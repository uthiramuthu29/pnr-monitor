export type SendSmsOptions = {
  recipients: string[];
  message: string;
  deviceId?: string;
};

export type SendSmsResult = {
  success: boolean;
  smsBatchId?: string;
  error?: string;
  simulated?: boolean;
};

/**
 * Normalizes phone numbers to standard E.164 format (defaulting to +91 for Indian numbers if omitted)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If 10 digits (standard Indian mobile number), prepend +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If 12 digits starting with 91, prepend +
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Builds a clear, readable SMS template for PNR status
 */
export function formatPnrSmsMessage({
  trainNumber,
  trainName,
  pnrNumber,
  dateOfJourney,
  chartStatus,
  passengers,
  movementNote,
}: {
  trainNumber: string;
  trainName: string;
  pnrNumber: string;
  dateOfJourney: string;
  chartStatus: string;
  passengers: {
    passengerSerialNumber: number;
    currentStatus: string;
    currentStatusDetails?: string;
    currentCoachId?: string;
    currentBerthNo?: number;
  }[];
  movementNote?: string;
}): string {
  const passengerLines = passengers
    .map((p, idx) => {
      const num = p.passengerSerialNumber || idx + 1;
      const status = p.currentStatusDetails || p.currentStatus || "N/A";
      const coachBerth =
        p.currentCoachId && p.currentCoachId !== "NA"
          ? ` (${p.currentCoachId}-${p.currentBerthNo || ""})`
          : "";
      return `P${num}: ${status}${coachBerth}`;
    })
    .join(", ");

  const dateStr = dateOfJourney ? dateOfJourney.slice(0, 10) : "";

  let msg = `[PNR Monitor] PNR: ${pnrNumber}\nTrain: ${trainNumber} ${trainName}\nDate: ${dateStr} | Chart: ${chartStatus || "Not Prepared"}\nStatus: ${passengerLines}`;

  if (movementNote) {
    msg += `\nUpdate: ${movementNote}`;
  }

  return msg;
}

/**
 * Dispatches an SMS via TextBee.dev gateway API
 */
export async function sendTextBeeSms({
  recipients,
  message,
  deviceId,
}: SendSmsOptions): Promise<SendSmsResult> {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const targetDevice = deviceId || process.env.TEXTBEE_DEVICE_ID;

  const validRecipients = recipients
    .map(formatPhoneNumber)
    .filter((phone) => phone.length >= 10);

  if (validRecipients.length === 0) {
    return {
      success: false,
      error: "No valid recipients provided",
    };
  }

  // If API key is not configured yet, log and return simulation
  if (!apiKey || apiKey === "your_textbee_api_key") {
    console.warn(
      `[TextBee SIMULATION] TEXTBEE_API_KEY not set in .env.local. Simulating SMS dispatch to:`,
      validRecipients,
      `\nMessage:\n${message}`,
    );
    return {
      success: true,
      simulated: true,
      smsBatchId: `sim_${Date.now()}`,
    };
  }

  try {
    const payload: {
      recipients: string[];
      message: string;
      deviceId?: string;
    } = {
      recipients: validRecipients,
      message,
    };

    if (targetDevice) {
      payload.deviceId = targetDevice;
    }

    const response = await fetch(
      "https://api.textbee.dev/api/v1/gateway/send-sms",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `TextBee HTTP error ${response.status}`;
      console.error("[TextBee Error]", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      smsBatchId: data?.smsBatchId || data?.id || "batch_dispatched",
    };
  } catch (error) {
    const errText =
      error instanceof Error ? error.message : "Failed to send SMS via TextBee";
    console.error("[TextBee Exception]", errText);
    return {
      success: false,
      error: errText,
    };
  }
}
