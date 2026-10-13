import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPassenger {
  passengerSerialNumber: number;
  bookingStatus: string;
  bookingStatusDetails: string;
  currentStatus: string;
  currentStatusDetails: string;
  bookingCoachId?: string;
  bookingBerthNo?: number;
  currentCoachId?: string;
  currentBerthNo?: number;
}

export interface IRecipientRef {
  name: string;
  channel?: "email" | "telegram";
  email?: string;
  telegramChatId?: string;
  phone?: string;
}

export interface IWeeklySchedule {
  day: string;
  time: string;
}

export interface IMonitoredJourney extends Document {
  pnrNumber: string;
  trainNumber: string;
  trainName: string;
  dateOfJourney: string;
  sourceStation: string;
  destinationStation: string;
  journeyClass?: string;
  chartStatus?: string;
  scheduleType: "once_daily" | "twice_daily" | "weekly";
  notificationTimes: string[];
  weeklyDays?: IWeeklySchedule[];
  passengers: IPassenger[];
  recipients: IRecipientRef[];
  lastCheckedAt?: Date;
  lastStatusSummary?: string;
  rawPnrData?: Record<string, unknown>;
  lastNotifiedAt?: Date;
  lastEmailSentAt?: Date;
  lastTelegramSentAt?: Date;
  lastSmsSentAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MonitoredJourneySchema = new Schema<IMonitoredJourney>(
  {
    pnrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    trainNumber: { type: String, default: "" },
    trainName: { type: String, default: "" },
    dateOfJourney: { type: String, default: "" },
    sourceStation: { type: String, default: "" },
    destinationStation: { type: String, default: "" },
    journeyClass: { type: String, default: "" },
    chartStatus: { type: String, default: "Chart Not Prepared" },
    scheduleType: {
      type: String,
      enum: ["once_daily", "twice_daily", "weekly"],
      default: "once_daily",
    },
    notificationTimes: {
      type: [String],
      default: ["09:00"],
    },
    weeklyDays: [
      {
        day: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    passengers: [
      {
        passengerSerialNumber: { type: Number, default: 1 },
        bookingStatus: { type: String, default: "" },
        bookingStatusDetails: { type: String, default: "" },
        currentStatus: { type: String, default: "" },
        currentStatusDetails: { type: String, default: "" },
        bookingCoachId: { type: String, default: "" },
        bookingBerthNo: { type: Number, default: 0 },
        currentCoachId: { type: String, default: "" },
        currentBerthNo: { type: Number, default: 0 },
      },
    ],
    recipients: [
      {
        name: { type: String, required: true },
        channel: { type: String, default: "email" },
        email: { type: String, default: "" },
        telegramChatId: { type: String, default: "" },
        phone: { type: String, default: "" },
      },
    ],
    lastCheckedAt: { type: Date },
    lastStatusSummary: { type: String, default: "" },
    rawPnrData: { type: Schema.Types.Mixed },
    lastNotifiedAt: { type: Date },
    lastEmailSentAt: { type: Date },
    lastTelegramSentAt: { type: Date },
    lastSmsSentAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MonitoredJourney: Model<IMonitoredJourney> =
  mongoose.models.MonitoredJourney ||
  mongoose.model<IMonitoredJourney>(
    "MonitoredJourney",
    MonitoredJourneySchema,
  );
