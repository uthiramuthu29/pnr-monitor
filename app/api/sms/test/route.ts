import { NextResponse } from "next/server";
import { sendGmailEmail } from "@/lib/gmail";

/**
 * Legacy test route forwarded to email test
 */
export async function POST(request: Request) {
  try {
    const { phone, email, message } = await request.json();
    const target = email || phone;

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Recipient address is required" },
        { status: 400 },
      );
    }

    const testMsg =
      message ||
      "🚂 PNR Monitor: Notification Service test successful! Your railway notifications are active.";

    const result = await sendGmailEmail({
      recipients: [target],
      subject: "🚂 PNR Monitor: Test Notification",
      text: testMsg,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Test failed",
      },
      { status: 500 },
    );
  }
}
