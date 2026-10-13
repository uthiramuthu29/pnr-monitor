import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MonitoredJourney } from "@/models/MonitoredJourney";

const RAPIDAPI_HOST = "irctc-indian-railway-pnr-status.p.rapidapi.com";

export async function GET() {
  try {
    await connectDB();
    const journeys = await MonitoredJourney.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: journeys });
  } catch (error) {
    console.error("GET /api/pnrs error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch monitored journeys",
        data: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pnrNumber,
      scheduleType = "once_daily",
      notificationTimes = ["09:00"],
      weeklyDays = [],
      recipients = [],
    } = body;

    if (!pnrNumber || !/^\d{10}$/.test(pnrNumber)) {
      return NextResponse.json(
        { success: false, error: "Valid 10-digit PNR number is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // 1. Fetch initial status from RapidAPI
    let trainNumber = "";
    let trainName = "";
    let dateOfJourney = "";
    let sourceStation = "";
    let destinationStation = "";
    let journeyClass = "";
    let chartStatus = "Chart Not Prepared";
    let passengers: Array<{
      passengerSerialNumber: number;
      bookingStatus: string;
      bookingStatusDetails: string;
      currentStatus: string;
      currentStatusDetails: string;
      bookingCoachId?: string;
      bookingBerthNo?: number;
      currentCoachId?: string;
      currentBerthNo?: number;
    }> = [];
    let rawPnrData: Record<string, unknown> | undefined;

    try {
      const apiKey = process.env.RAPIDAPI_KEY;
      if (apiKey) {
        const rapidRes = await fetch(
          `https://${RAPIDAPI_HOST}/getPNRStatus/${pnrNumber}`,
          {
            headers: {
              "x-rapidapi-host": RAPIDAPI_HOST,
              "x-rapidapi-key": apiKey,
            },
          },
        );

        if (rapidRes.ok) {
          const resJson = await rapidRes.json();
          if (resJson?.data) {
            const d = resJson.data;
            trainNumber = d.trainNumber || "";
            trainName = d.trainName || "";
            dateOfJourney = d.dateOfJourney || "";
            sourceStation = d.sourceStation || "";
            destinationStation = d.destinationStation || "";
            journeyClass = d.journeyClass || "";
            chartStatus = d.chartStatus || "Chart Not Prepared";
            rawPnrData = d;

            if (Array.isArray(d.passengerList)) {
              passengers = d.passengerList.map(
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
            }
          }
        }
      }
    } catch (rapidErr) {
      console.warn("RapidAPI lookup error on PNR register:", rapidErr);
    }

    // 2. Build summary
    const summary = passengers
      .map(
        (p) =>
          `P${p.passengerSerialNumber}: ${p.currentStatusDetails || p.currentStatus}`,
      )
      .join(", ");

    const normalizedRecipients = Array.isArray(recipients)
      ? recipients.map((r: { name?: string; channel?: string; email?: string; telegramChatId?: string; phone?: string }) => ({
          name: r.name || "Recipient",
          channel: r.channel === "telegram" ? "telegram" : "email",
          email: r.email || (r.phone && r.phone.includes("@") ? r.phone : ""),
          telegramChatId: r.telegramChatId || "",
          phone: r.phone || "",
        }))
      : [];

    // 3. Upsert into MongoDB
    const journey = await MonitoredJourney.findOneAndUpdate(
      { pnrNumber },
      {
        $set: {
          pnrNumber,
          trainNumber,
          trainName,
          dateOfJourney,
          sourceStation,
          destinationStation,
          journeyClass,
          chartStatus,
          scheduleType,
          notificationTimes,
          weeklyDays,
          passengers,
          recipients: normalizedRecipients,
          lastCheckedAt: new Date(),
          lastStatusSummary: summary,
          rawPnrData,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "PNR monitoring initiated in MongoDB",
      data: journey,
    });
  } catch (error) {
    console.error("POST /api/pnrs error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save monitored journey",
      },
      { status: 500 },
    );
  }
}
