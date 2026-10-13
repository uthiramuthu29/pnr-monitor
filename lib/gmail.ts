import nodemailer from "nodemailer";

export type SendEmailOptions = {
  recipients: string[];
  subject: string;
  text: string;
  html?: string;
};

export type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
  debug?: {
    user: string;
    passLength: number;
    passPrefix: string;
  };
};

import fs from "fs";
import path from "path";

function getEnvValue(key: string): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const regex = new RegExp(`^\\s*${key}\\s*=\\s*["']?([^"'\\r\\n]+)`, "m");
      const match = content.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}
  return process.env[key] || "";
}

/**
 * Dispatches an email via Gmail SMTP using Nodemailer
 */
export async function sendGmailEmail({
  recipients,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<SendEmailResult> {
  const rawUser = getEnvValue("PNR_GMAIL_ADDRESS") || getEnvValue("GMAIL_USER");
  const rawPass = getEnvValue("PNR_GMAIL_APP_PASSWORD") || getEnvValue("GMAIL_APP_PASSWORD");

  const user = rawUser.trim().replace(/^["']|["']$/g, "");
  // Google app passwords are 16 letters; strip any spaces, quotes, or dashes
  const pass = rawPass.replace(/[\s"'-]/g, "").trim();

  const debug = {
    user: user || "(NOT SET)",
    passLength: pass.length,
    passPrefix: pass ? `${pass.slice(0, 4)}...${pass.slice(-4)}` : "(EMPTY)",
  };

  console.log("==================================================");
  console.log("[GMAIL ENV CHECK]");
  console.log("  • PNR_GMAIL_ADDRESS:", debug.user);
  console.log("  • PNR_GMAIL_APP_PASSWORD length:", debug.passLength);
  console.log("  • PNR_GMAIL_APP_PASSWORD preview:", debug.passPrefix);
  console.log("  • Target Recipients:", recipients);
  console.log("==================================================");

  const validRecipients = recipients
    .map((r) => r.trim())
    .filter((r) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r));

  if (validRecipients.length === 0) {
    return {
      success: false,
      error: "No valid email recipients provided",
      debug,
    };
  }

  // If Gmail App Password is not yet configured, log and return simulation
  if (!user || !pass || pass === "your-16-char-app-password") {
    console.warn(
      `[Gmail SIMULATION] PNR_GMAIL_APP_PASSWORD not set in .env.local. Simulating email dispatch to:`,
      validRecipients,
      `\nSubject: ${subject}\nBody:\n${text}`,
    );
    return {
      success: true,
      simulated: true,
      messageId: `sim_gmail_${Date.now()}`,
      debug,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"PNR Monitor" <${user}>`,
      to: validRecipients.join(", "),
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });

    console.log(`[Gmail Success] Email dispatched successfully to: ${validRecipients.join(", ")} (ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      debug,
    };
  } catch (error) {
    const errText =
      error instanceof Error ? error.message : "Failed to send email via Gmail";
    console.error(`[Gmail Exception] Failed to authenticate as "${user}" with password length ${pass.length}:`, errText);
    return {
      success: false,
      error: errText,
      debug,
    };
  }
}

/**
 * Builds plain text & rich HTML email templates for PNR alerts
 */
export function formatPnrEmailMessage({
  trainNumber,
  trainName,
  pnrNumber,
  dateOfJourney,
  chartStatus,
  passengers,
  checkedAt,
  isChartPrepared,
}: {
  trainNumber: string;
  trainName: string;
  pnrNumber: string;
  dateOfJourney: string;
  chartStatus: string;
  passengers: {
    passengerSerialNumber: number;
    bookingStatus?: string;
    bookingStatusDetails?: string;
    currentStatus?: string;
    currentStatusDetails?: string;
    bookingCoachId?: string;
    bookingBerthNo?: number;
    currentCoachId?: string;
    currentBerthNo?: number;
  }[];
  checkedAt: string;
  isChartPrepared?: boolean;
}): { subject: string; text: string; html: string } {
  const p1 = passengers[0] || {
    bookingStatusDetails: "N/A",
    currentStatusDetails: "N/A",
    passengerSerialNumber: 1,
  };

  const bookingStatus =
    p1.bookingStatusDetails || p1.bookingStatus || "N/A";
  const currentStatus =
    p1.currentStatusDetails || p1.currentStatus || "N/A";

  const dateStr = dateOfJourney ? dateOfJourney.slice(0, 10) : "";

  // Plain text matching your Python template
  const text = isChartPrepared
    ? `PNR : ${pnrNumber}
Train : ${trainNumber} ${trainName}
Date : ${dateStr}

FINAL STATUS :
${currentStatus}

Chart Status : ${chartStatus}
Chart has been prepared. Monitoring concluded.

Checked at :
${checkedAt}`
    : `PNR : ${pnrNumber}
Train : ${trainNumber} ${trainName}
Date : ${dateStr}

Booking Status :
${bookingStatus}

Current Status :
${currentStatus}

Chart Status :
${chartStatus}

Checked at :
${checkedAt}`;

  const subject = isChartPrepared
    ? `✅ Chart Prepared – Final Update: PNR ${pnrNumber}`
    : `🚆 IRCTC PNR Update: PNR ${pnrNumber} (${trainNumber})`;

  const passengerRows = passengers
    .map((p, idx) => {
      const num = p.passengerSerialNumber || idx + 1;
      const bStatus = p.bookingStatusDetails || p.bookingStatus || "—";
      const cStatus = p.currentStatusDetails || p.currentStatus || "—";
      const coachBerth =
        p.currentCoachId && p.currentCoachId !== "NA"
          ? `<strong>${p.currentCoachId}</strong> / Berth ${p.currentBerthNo || ""}`
          : "—";

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 14px; font-weight: bold; color: #1e1b4b;">P${num}</td>
          <td style="padding: 10px 14px; color: #4b5563;">${bStatus}</td>
          <td style="padding: 10px 14px; font-weight: bold; color: #0058be;">${cStatus}</td>
          <td style="padding: 10px 14px; color: #1f2937;">${coachBerth}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
    
    <!-- Header banner -->
    <div style="background: linear-gradient(135deg, #0058be 0%, #003e87 100%); padding: 22px 24px; color: #ffffff;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; font-weight: 600;">
        ${isChartPrepared ? "Final Journey Update" : "Scheduled PNR Alert"}
      </div>
      <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">
        PNR: ${pnrNumber}
      </h1>
      <div style="margin-top: 6px; font-size: 13px; opacity: 0.95;">
        🚆 ${trainNumber} · ${trainName}
      </div>
    </div>

    <!-- Body content -->
    <div style="padding: 24px;">
      
      <!-- Key Journey Metrics -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; padding: 10px 12px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Date of Journey</div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${dateStr || "—"}</div>
          </td>
          <td style="width: 8px;"></td>
          <td style="width: 50%; padding: 10px 12px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Chart Status</div>
            <div style="font-size: 14px; font-weight: 700; color: ${isChartPrepared ? "#15803d" : "#0058be"}; margin-top: 2px;">
              ${chartStatus || "Chart Not Prepared"}
            </div>
          </td>
        </tr>
      </table>

      <!-- Passenger details table -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #1e1b4b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
          Passenger Status
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e5e7eb;">
              <th style="padding: 10px 14px;">Pax</th>
              <th style="padding: 10px 14px;">Booking</th>
              <th style="padding: 10px 14px;">Current</th>
              <th style="padding: 10px 14px;">Coach/Berth</th>
            </tr>
          </thead>
          <tbody>
            ${passengerRows}
          </tbody>
        </table>
      </div>

      <!-- Footer timestamp -->
      <div style="padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
        Checked & dispatched at: <strong style="color: #4b5563;">${checkedAt}</strong>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, text, html };
}
