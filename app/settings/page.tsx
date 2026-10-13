"use client";

import { useState } from "react";
import PageHeading from "@/components/PageHeading";
import {
  Mail,
  Send,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  // Test Email state
  const [testEmail, setTestEmail] = useState("uthiramuthusp29@gmail.com");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  // Test Telegram state
  const [testChatId, setTestChatId] = useState("");
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramResult, setTelegramResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setEmailResult({
        success: false,
        message: "Please enter a valid email address",
      });
      return;
    }

    try {
      setSendingEmail(true);
      setEmailResult(null);

      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          target: testEmail.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEmailResult({
          success: true,
          message: json.message || "Test email sent successfully via Gmail!",
        });
      } else {
        setEmailResult({
          success: false,
          message: json.message || json.error || "Failed to send test email",
        });
      }
    } catch (err) {
      setEmailResult({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Network error sending test email",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendTestTelegram = async () => {
    if (!testChatId.trim()) {
      setTelegramResult({
        success: false,
        message: "Please enter your numeric Telegram Chat ID",
      });
      return;
    }

    try {
      setSendingTelegram(true);
      setTelegramResult(null);

      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "telegram",
          target: testChatId.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTelegramResult({
          success: true,
          message:
            json.message ||
            "Test Telegram notification dispatched successfully!",
        });
      } else {
        setTelegramResult({
          success: false,
          message: json.error || "Failed to send test Telegram message",
        });
      }
    } catch (err) {
      setTelegramResult({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Network error sending Telegram message",
      });
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <section className="pb-10">
      <PageHeading
        title="Settings"
        desc="Gmail & Telegram notification gateways, database & exact-time schedule preferences"
      />

      <div className="flex flex-col gap-3.5">
        {/* Gmail Gateway Card */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-light-blue text-[#0058BE]">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy-dark">
                  Gmail Notification Service
                </h4>
                <p className="text-xs text-blackish-ash">
                  smtp.gmail.com:587 (Google App Password)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 uppercase tracking-wider">
              Connected
            </span>
          </div>

          <div className="bg-light-blue/60 p-3 rounded-2xl border border-gray-100 mb-3">
            <p className="text-xs text-navy-dark leading-relaxed font-medium">
              Sends beautiful, formatted railway cards with passenger current status, coach, and berth details strictly at the user&apos;s scheduled times.
            </p>
          </div>

          {/* Test Email Sender */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <label className="text-[12px] font-bold text-navy-dark block mb-1.5">
              Send Test Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@gmail.com"
                className="flex-1 px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold text-navy-dark border border-gray-200 focus:border-[#0058BE] outline-hidden placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingEmail}
                className="px-4 py-2.5 bg-[#0058BE] text-white rounded-xl text-xs font-bold hover:bg-[#00479c] active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {sendingEmail ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                <span>Send</span>
              </button>
            </div>

            {emailResult && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-1.5 font-medium ${
                  emailResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {emailResult.success ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : (
                  <AlertCircle size={14} className="shrink-0" />
                )}
                <span>{emailResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Telegram Bot Gateway Card */}
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#E6F4FB] text-[#0088cc]">
                <Send size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy-dark">
                  Telegram Bot Notification
                </h4>
                <p className="text-xs text-blackish-ash">
                  api.telegram.org/bot (Telegram Bot API)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#0088cc] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
              Bot API
            </span>
          </div>

          <div className="bg-[#E6F4FB]/50 p-3 rounded-2xl border border-gray-100 mb-3">
            <p className="text-xs text-navy-dark leading-relaxed font-medium">
              Dispatches instant alerts directly to users or groups using Telegram Chat IDs. To obtain your Chat ID, start your bot on Telegram or send <code>/start</code> to <strong>@userinfobot</strong>.
            </p>
          </div>

          {/* Test Telegram Sender */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <label className="text-[12px] font-bold text-navy-dark block mb-1.5">
              Send Test Telegram Message
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testChatId}
                onChange={(e) => setTestChatId(e.target.value)}
                placeholder="Telegram Chat ID (e.g. 123456789)"
                className="flex-1 px-3.5 py-2.5 bg-white rounded-xl text-xs font-bold text-navy-dark border border-gray-200 focus:border-[#0088cc] outline-hidden placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleSendTestTelegram}
                disabled={sendingTelegram}
                className="px-4 py-2.5 bg-[#0088cc] text-white rounded-xl text-xs font-bold hover:bg-[#0077b5] active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {sendingTelegram ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Send</span>
              </button>
            </div>

            {telegramResult && (
              <div
                className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-1.5 font-medium ${
                  telegramResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {telegramResult.success ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : (
                  <AlertCircle size={14} className="shrink-0" />
                )}
                <span>{telegramResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* MongoDB Status */}
        <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-light-blue text-[#0058BE]">
              <Database size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-dark">
                Database (MongoDB)
              </h4>
              <p className="text-xs text-blackish-ash">
                Monitored journeys &amp; alert recipients persistence
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            Active
          </span>
        </div>

        {/* Execution Mode */}
        <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-light-blue text-[#0058BE]">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-dark">
                Execution Mode
              </h4>
              <p className="text-xs text-blackish-ash">
                Checks &amp; dispatches strictly at user-scheduled times (IST)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-navy-dark bg-gray-100 px-2.5 py-1 rounded-full">
            Exact Time (IST)
          </span>
        </div>
      </div>
    </section>
  );
}
