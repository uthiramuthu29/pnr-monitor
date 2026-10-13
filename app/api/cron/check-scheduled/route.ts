import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MonitoredJourney, IMonitoredJourney } from "@/models/MonitoredJourney";
import { sendGmailEmail, formatPnrEmailMessage } from "@/lib/gmail";
import {
  sendTelegramBroadcast,
  formatPnrTelegramMessage,
} from "@/lib/telegram";

const RAPIDAPI_HOST = "irctc-indian-railway-pnr-status.p.rapidapi.com";

export async function GET(request: Request) {
  return handleScheduledCheck(request);
}

export async function POST(request: Request) {
  return handleScheduledCheck(request);
}

async function handleScheduledCheck(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    const forcePnr = searchParams.get("pnr");
    const secret = searchParams.get("secret");

    // Check optional security token if configured
    const configuredSecret = process.env.CRON_SECRET;
    if (configuredSecret && secret !== configuredSecret && !force) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron request" },
        { status: 401 },
      );
    }

    await connectDB();

    // Get current time in Indian Standard Time (IST)
    const now = new Date();
    const istTime = now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }); // e.g. "09:00"

    const istDay = now.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    }); // e.g. "Monday"

    const istFormatted = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }); // e.g. "12 Oct 2026, 06:30 PM"

    let query: Record<string, unknown> = { isActive: true };

    if (forcePnr) {
      query = { pnrNumber: forcePnr };
    }

    const allActive = await MonitoredJourney.find(query);

    // Filter to journeys whose scheduled time matches the current IST time (unless force=true or forcePnr)
    const dueJourneys: IMonitoredJourney[] = force
      ? allActive
      : allActive.filter((j) => {
          if (forcePnr && j.pnrNumber === forcePnr) return true;

          if (j.scheduleType === "weekly") {
            return (
              Array.isArray(j.weeklyDays) &&
              j.weeklyDays.some(
                (w) =>
                  w.day.toLowerCase() === istDay.toLowerCase() &&
                  w.time === istTime,
              )
            );
          }

          // Once daily or Twice daily
          return (
            Array.isArray(j.notificationTimes) &&
            j.notificationTimes.includes(istTime)
          );
        });

    if (dueJourneys.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No PNR checks due at ${istTime} IST (${istDay}). Active PNRs checked: ${allActive.length}`,
        currentTimeIST: istTime,
        currentDayIST: istDay,
        checkedCount: 0,
      });
    }

    const results = [];

    for (const journey of dueJourneys) {
      const pnr = journey.pnrNumber;
      let rapidData = null;

      // 1. Fetch live IRCTC status from RapidAPI
      try {
        const apiKey = process.env.RAPIDAPI_KEY;
        if (apiKey) {
          const res = await fetch(
            `https://${RAPIDAPI_HOST}/getPNRStatus/${pnr}`,
            {
              headers: {
                "x-rapidapi-host": RAPIDAPI_HOST,
                "x-rapidapi-key": apiKey,
              },
            },
          );

          if (res.ok) {
            const json = await res.json();
            rapidData = json?.data;
          }
        }
      } catch (err) {
        console.error(`Error querying RapidAPI for PNR ${pnr}:`, err);
      }

      // 2. Update journey data
      if (rapidData) {
        journey.trainNumber = rapidData.trainNumber || journey.trainNumber;
        journey.trainName = rapidData.trainName || journey.trainName;
        journey.dateOfJourney = rapidData.dateOfJourney || journey.dateOfJourney;
        journey.chartStatus = rapidData.chartStatus || journey.chartStatus;

        if (Array.isArray(rapidData.passengerList)) {
          journey.passengers = rapidData.passengerList.map(
            (p: {
              passengerSerialNumber?: number;
              bookingStatus?: string;
              bookingStatusDetails?: string;
              currentStatus?: string;
              currentStatusDetails?: string;
              bookingCoachId?: string;
              bookingBerthNo?: number;
              currentCoachId?: string;
              currentBerthNo?: number;
            }) => ({
              passengerSerialNumber: p.passengerSerialNumber || 1,
              bookingStatus: p.bookingStatus || "",
              bookingStatusDetails: p.bookingStatusDetails || "",
              currentStatus: p.currentStatus || "",
              currentStatusDetails: p.currentStatusDetails || "",
              bookingCoachId: p.bookingCoachId || "",
              bookingBerthNo: p.bookingBerthNo || 0,
              currentCoachId: p.currentCoachId || "",
              currentBerthNo: p.currentBerthNo || 0,
            }),
          );

          journey.lastStatusSummary = journey.passengers
            .map(
              (p) =>
                `P${p.passengerSerialNumber}: ${p.currentStatusDetails || p.currentStatus}`,
            )
            .join(", ");
        }

        journey.rawPnrData = rapidData;
      }

      const statusLower = (journey.chartStatus || "").toLowerCase();
      const isChartPrepared =
        statusLower.includes("chart prepared") &&
        !statusLower.includes("not prepared") &&
        !statusLower.includes("not");

      journey.lastCheckedAt = new Date();

      // 3. Dispatch to selected recipients strictly at user's scheduled time
      const emailRecipients: string[] = [];
      const telegramRecipients: string[] = [];

      for (const rec of journey.recipients || []) {
        if (rec.channel === "telegram" && rec.telegramChatId) {
          telegramRecipients.push(rec.telegramChatId.trim());
        } else if (rec.email) {
          emailRecipients.push(rec.email.trim());
        } else if (rec.phone && rec.phone.includes("@")) {
          emailRecipients.push(rec.phone.trim());
        }
      }

      let emailResult = null;
      let telegramResult = null;

      // Dispatch via Gmail
      if (emailRecipients.length > 0) {
        const { subject, text, html } = formatPnrEmailMessage({
          trainNumber: journey.trainNumber || "—",
          trainName: journey.trainName || "Express Train",
          pnrNumber: journey.pnrNumber,
          dateOfJourney: journey.dateOfJourney || "",
          chartStatus: journey.chartStatus || "Chart Not Prepared",
          passengers: journey.passengers || [],
          checkedAt: `${istFormatted} IST`,
          isChartPrepared,
        });

        emailResult = await sendGmailEmail({
          recipients: emailRecipients,
          subject,
          text,
          html,
        });

        if (emailResult.success) {
          journey.lastEmailSentAt = new Date();
          journey.lastNotifiedAt = new Date();
        }
      }

      // Dispatch via Telegram
      if (telegramRecipients.length > 0) {
        const telegramText = formatPnrTelegramMessage({
          trainNumber: journey.trainNumber || "—",
          trainName: journey.trainName || "Express Train",
          pnrNumber: journey.pnrNumber,
          dateOfJourney: journey.dateOfJourney || "",
          chartStatus: journey.chartStatus || "Chart Not Prepared",
          passengers: journey.passengers || [],
          checkedAt: `${istFormatted} IST`,
          isChartPrepared,
        });

        telegramResult = await sendTelegramBroadcast({
          chatIds: telegramRecipients,
          text: telegramText,
        });

        if (telegramResult.success) {
          journey.lastTelegramSentAt = new Date();
          journey.lastNotifiedAt = new Date();
        }
      }

      if (isChartPrepared) {
        // As in your Python script: Chart has been prepared, monitoring concluded.
        journey.isActive = false;
      }

      await journey.save();

      results.push({
        pnr,
        train: `${journey.trainNumber} - ${journey.trainName}`,
        emailsNotified: emailRecipients,
        telegramNotified: telegramRecipients,
        emailResult,
        telegramResult,
        isChartPrepared,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully executed scheduled check for ${dueJourneys.length} PNR(s) at ${istTime} IST`,
      currentTimeIST: istTime,
      currentDayIST: istDay,
      checkedCount: dueJourneys.length,
      results,
    });
  } catch (error) {
    console.error("Scheduled check error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Scheduled check execution failed",
      },
      { status: 500 },
    );
  }
}
