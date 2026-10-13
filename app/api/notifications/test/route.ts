import { NextResponse } from "next/server";
import { sendGmailEmail } from "@/lib/gmail";
import { sendTelegramMessage } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { channel = "email", target, message } = await request.json();

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error:
            channel === "telegram"
              ? "Telegram Chat ID is required"
              : "Email address is required",
        },
        { status: 400 },
      );
    }

    if (channel === "telegram") {
      const text =
        message ||
        `🚆 <b>PNR Monitor Test</b>\n━━━━━━━━━━━━━━━━━━━━\n✅ <i>Telegram Bot notification service connected successfully!</i>\nRailway alerts for your journeys will be delivered here at your scheduled times.`;

      const result = await sendTelegramMessage({
        chatId: target,
        text,
      });

      return NextResponse.json({
        ...result,
        message: result.success
          ? result.simulated
            ? "Simulated Telegram dispatch (TELEGRAM_BOT_TOKEN not configured yet in .env.local)"
            : "Telegram test message sent successfully!"
          : result.error,
      });
    }

    // Default: Email (Gmail)
    const subject = "🚆 PNR Monitor: Gmail Notification Service Test";
    const body =
      message ||
      `PNR Monitor: Gmail Notification Service Test Successful!\n\nYour railway notifications are active and will be delivered to this address at your scheduled times.\n\nChecked at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
        <h2 style="color: #0058be; margin-top: 0;">🚆 PNR Monitor Test</h2>
        <p style="color: #1e1b4b; font-size: 14px;"><strong>Gmail Notification Service is working properly!</strong></p>
        <p style="color: #4b5563; font-size: 13px;">Your IRCTC railway status alerts will be delivered directly to this email at your exact scheduled times.</p>
        <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b;">
          Timestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </div>
      </div>
    `;

    const result = await sendGmailEmail({
      recipients: [target],
      subject,
      text: body,
      html,
    });

    const debugText = result.debug
      ? ` [Used Env: User="${result.debug.user}", PassLength=${result.debug.passLength}, Prefix="${result.debug.passPrefix}"]`
      : "";

    return NextResponse.json({
      ...result,
      message: result.success
        ? result.simulated
          ? `Simulated email dispatch (PNR_GMAIL_APP_PASSWORD not configured yet in .env.local)${debugText}`
          : `Test email sent successfully via Gmail!${debugText}`
        : `${result.error}${debugText}`,
    });
  } catch (error) {
    console.error("Notification test error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Notification test failed",
      },
      { status: 500 },
    );
  }
}
