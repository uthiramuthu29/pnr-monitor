import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipient } from "@/models/Recipient";

const defaultRecipients = [
  {
    name: "Self",
    channel: "email" as const,
    email: "uthiramuthusp29@gmail.com",
    relationship: "Primary",
  },
  {
    name: "Shanmugavelu",
    channel: "email" as const,
    email: "shanmugavelu434@gmail.com",
    relationship: "Family",
  },
  {
    name: "Ponesakkiammal",
    channel: "email" as const,
    email: "pponesakkiammal@gmail.com",
    relationship: "Family",
  },
  {
    name: "Selvipriyadharshini",
    channel: "email" as const,
    email: "selvipriyadharshinisp24@gmail.com",
    relationship: "Family",
  },
];

export async function GET() {
  try {
    await connectDB();
    let recipients = await Recipient.find().sort({ createdAt: -1 }).lean();

    // Auto-seed default contacts if collection is currently empty
    if (recipients.length === 0) {
      await Recipient.insertMany(defaultRecipients);
      recipients = await Recipient.find().sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, data: recipients });
  } catch (error) {
    console.error("GET /api/recipients error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recipients from database",
        data: defaultRecipients,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      channel = "email",
      email,
      telegramChatId,
      phone,
      relationship = "Family",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Recipient name is required" },
        { status: 400 },
      );
    }

    if (channel === "telegram") {
      if (!telegramChatId || !telegramChatId.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Telegram Chat ID is required for Telegram notifications",
          },
          { status: 400 },
        );
      }
    } else {
      // Default to email
      if (!email || !email.trim()) {
        return NextResponse.json(
          { success: false, error: "Email address is required for Gmail notifications" },
          { status: 400 },
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address" },
          { status: 400 },
        );
      }
    }

    await connectDB();
    const newRecipient = await Recipient.create({
      name: name.trim(),
      channel: channel === "telegram" ? "telegram" : "email",
      email: email ? email.trim().toLowerCase() : "",
      telegramChatId: telegramChatId ? telegramChatId.trim() : "",
      phone: phone ? phone.trim() : "",
      relationship: relationship.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Recipient contact saved",
      data: newRecipient,
    });
  } catch (error) {
    console.error("POST /api/recipients error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create recipient",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Recipient ID is required" },
        { status: 400 },
      );
    }

    await connectDB();
    await Recipient.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Recipient deleted" });
  } catch (error) {
    console.error("DELETE /api/recipients error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete recipient",
      },
      { status: 500 },
    );
  }
}
