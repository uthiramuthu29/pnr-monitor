import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationChannel = "email" | "telegram";

export interface IRecipientDoc extends Document {
  name: string;
  channel: NotificationChannel;
  email?: string;
  telegramChatId?: string;
  phone?: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecipientSchema = new Schema<IRecipientDoc>(
  {
    name: { type: String, required: true, trim: true },
    channel: {
      type: String,
      enum: ["email", "telegram"],
      default: "email",
    },
    email: { type: String, trim: true, lowercase: true, default: "" },
    telegramChatId: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    relationship: { type: String, default: "Family", trim: true },
  },
  { timestamps: true },
);

export const Recipient: Model<IRecipientDoc> =
  mongoose.models.Recipient ||
  mongoose.model<IRecipientDoc>("Recipient", RecipientSchema);
