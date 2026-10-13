export type Passenger = {
  passengerSerialNumber: number;
  bookingStatus: string;
  bookingStatusDetails: string;
  currentStatus: string;
  currentStatusDetails: string;
  bookingCoachId: string;
  bookingBerthNo: number;
  currentCoachId: string;
  currentBerthNo: number;
};

export type PnrData = {
  pnrNumber: string;
  dateOfJourney: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  reservationUpto: string;
  boardingPoint: string;
  journeyClass: string;
  numberOfpassenger: number;
  chartStatus: string;
  informationMessage: string[];
  passengerList: Passenger[];
  timeStamp: string;
  bookingFare: number;
  ticketFare: number;
  quota: string;
  arrivalDate: string;
  distance: number;
  isWL: string;
};

export type PnrResponse = {
  success?: boolean;
  data: PnrData;
  generatedTimeStamp?: number;
  error?: string;
};

export type TrackedRecipient = {
  name: string;
  channel?: "email" | "telegram";
  email?: string;
  telegramChatId?: string;
  phone?: string;
};

export type TrackedPnr = {
  pnrNumber: string;
  frequency: string;
  scheduleType?: "once_daily" | "twice_daily" | "weekly";
  notificationTimes?: string[];
  weeklyDays?: { day: string; time: string }[];
  recipients?: TrackedRecipient[];
  lastChecked?: string;
  lastNotifiedAt?: string;
  lastEmailSentAt?: string;
  lastTelegramSentAt?: string;
  lastSmsSentAt?: string;
  lastStatusSummary?: string;
  data?: PnrData;
  createdAt: string;
};
