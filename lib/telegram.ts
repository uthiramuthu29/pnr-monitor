export type SendTelegramOptions = {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "MarkdownV2" | "Markdown";
};

export type SendTelegramResult = {
  success: boolean;
  messageId?: number;
  error?: string;
  simulated?: boolean;
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
 * Dispatches a single Telegram message via Telegram Bot API
 */
export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = "HTML",
}: SendTelegramOptions): Promise<SendTelegramResult> {
  const token = getEnvValue("TELEGRAM_BOT_TOKEN");

  const cleanChatId = chatId.trim();
  if (!cleanChatId) {
    return {
      success: false,
      error: "Telegram Chat ID is required",
    };
  }

  // If token is missing, log simulation
  if (!token || token === "your_telegram_bot_token") {
    console.warn(
      `[Telegram SIMULATION] TELEGRAM_BOT_TOKEN not set in .env.local. Simulating Telegram dispatch to chat: ${cleanChatId}\nMessage:\n${text}`,
    );
    return {
      success: true,
      simulated: true,
      messageId: Date.now(),
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errorMsg =
        data?.description || `Telegram HTTP error ${response.status}`;
      console.error("[Telegram Error]", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (error) {
    const errText =
      error instanceof Error ? error.message : "Failed to dispatch Telegram message";
    console.error("[Telegram Exception]", errText);
    return {
      success: false,
      error: errText,
    };
  }
}

/**
 * Dispatches Telegram message to multiple chat IDs
 */
export async function sendTelegramBroadcast({
  chatIds,
  text,
}: {
  chatIds: string[];
  text: string;
}): Promise<{
  success: boolean;
  results: { chatId: string; success: boolean; error?: string }[];
}> {
  const uniqueChatIds = Array.from(new Set(chatIds.map((c) => c.trim()).filter(Boolean)));
  const results: { chatId: string; success: boolean; error?: string }[] = [];

  for (const chatId of uniqueChatIds) {
    const res = await sendTelegramMessage({ chatId, text });
    results.push({
      chatId,
      success: res.success,
      error: res.error,
    });
  }

  const anySuccess = results.length > 0 && results.some((r) => r.success);
  return {
    success: anySuccess,
    results,
  };
}

/**
 * Builds a clear HTML-formatted Telegram message for PNR status
 */
export function formatPnrTelegramMessage({
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
}): string {
  const dateStr = dateOfJourney ? dateOfJourney.slice(0, 10) : "";

  const paxLines = passengers
    .map((p, idx) => {
      const num = p.passengerSerialNumber || idx + 1;
      const bStatus = p.bookingStatusDetails || p.bookingStatus || "N/A";
      const cStatus = p.currentStatusDetails || p.currentStatus || "N/A";
      const coachBerth =
        p.currentCoachId && p.currentCoachId !== "NA"
          ? ` (${p.currentCoachId}-${p.currentBerthNo || ""})`
          : "";

      return `👤 <b>Passenger ${num}:</b>
   • Booking: <code>${bStatus}</code>
   • Current: <b>${cStatus}</b>${coachBerth}`;
    })
    .join("\n\n");

  if (isChartPrepared) {
    return `✅ <b>Chart Prepared – Final Update</b>
━━━━━━━━━━━━━━━━━━━━
🎫 <b>PNR:</b> <code>${pnrNumber}</code>
🚆 <b>Train:</b> ${trainNumber} ${trainName}
📅 <b>Date:</b> ${dateStr}

📊 <b>Final Passenger Details:</b>
${paxLines}

📋 <b>Chart Status:</b> <b>${chartStatus}</b>
🏁 <i>Chart prepared. Monitoring completed.</i>

⏰ <i>Checked at: ${checkedAt}</i>`;
  }

  return `🚆 <b>IRCTC PNR Status Update</b>
━━━━━━━━━━━━━━━━━━━━
🎫 <b>PNR:</b> <code>${pnrNumber}</code>
🚆 <b>Train:</b> ${trainNumber} ${trainName}
📅 <b>Date:</b> ${dateStr}

📊 <b>Passenger Details:</b>
${paxLines}

📋 <b>Chart Status:</b> <b>${chartStatus}</b>
⏰ <i>Checked at: ${checkedAt}</i>`;
}
