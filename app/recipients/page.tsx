"use client";

import PageHeading from "@/components/PageHeading";
import {
  Users,
  UserPlus,
  Mail,
  Send,
  ShieldCheck,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

type RecipientItem = {
  _id?: string;
  id?: number;
  name: string;
  channel?: "email" | "telegram";
  email?: string;
  telegramChatId?: string;
  phone?: string;
  relationship: string;
};

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"email" | "telegram">("email");
  const [email, setEmail] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRecipients = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/recipients");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecipients(json.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load contacts from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/recipients")
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && Array.isArray(json.data)) {
          setRecipients(json.data);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setError("Failed to load contacts from database");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (channel === "email" && !email.trim()) {
      setError("Please enter a valid email address");
      return;
    }
    if (channel === "telegram" && !telegramChatId.trim()) {
      setError("Please enter a Telegram Chat ID");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          channel,
          email: channel === "email" ? email.trim() : "",
          telegramChatId: channel === "telegram" ? telegramChatId.trim() : "",
          relationship,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to add recipient");
      }

      setName("");
      setEmail("");
      setTelegramChatId("");
      setShowForm(false);
      await loadRecipients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save contact");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/recipients?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecipients((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Delete recipient error:", err);
    }
  };

  return (
    <section className="pb-10">
      <div className="flex justify-between items-baseline mb-4">
        <PageHeading
          title="Recipients"
          desc="Manage who receives automatic Gmail & Telegram alerts at your scheduled times"
        />
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center text-white bg-[#0058BE] hover:bg-[#00479c] active:scale-95 transition-all text-[13px] font-bold font-inter leading-4.5 gap-1.5 px-4.5 py-2.5 rounded-full shadow-sm hover:shadow-md cursor-pointer shrink-0 touch-manipulation select-none"
        >
          <UserPlus size={16} />
          Add
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3.5"
        >
          <h4 className="text-sm font-bold text-navy-dark">New Alert Contact</h4>

          {/* Channel selector */}
          <div className="flex gap-2 p-1 bg-light-blue rounded-2xl">
            <button
              type="button"
              onClick={() => setChannel("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                channel === "email"
                  ? "bg-white text-[#0058BE] shadow-xs"
                  : "text-blackish-ash hover:text-navy-dark"
              }`}
            >
              <Mail size={15} />
              <span>Gmail / Email</span>
            </button>
            <button
              type="button"
              onClick={() => setChannel("telegram")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                channel === "telegram"
                  ? "bg-[#0088cc] text-white shadow-xs"
                  : "text-blackish-ash hover:text-navy-dark"
              }`}
            >
              <Send size={14} />
              <span>Telegram Bot</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="Contact Name (e.g. Sister, Mom, Self)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 bg-light-blue rounded-xl text-xs font-semibold text-navy-dark focus:outline-none focus:ring-1 focus:ring-[#0058BE]"
            required
          />

          {channel === "email" ? (
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Gmail / Email Address (e.g. user@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 bg-light-blue rounded-xl text-xs font-semibold text-navy-dark focus:outline-none focus:ring-1 focus:ring-[#0058BE]"
                required
              />
              <span className="text-[11px] text-blackish-ash pl-1">
                Alerts will be sent via Gmail SMTP at your exact scheduled times.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="Telegram Chat ID (e.g. 123456789)"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="p-3 bg-light-blue rounded-xl text-xs font-semibold text-navy-dark focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                required
              />
              <span className="text-[11px] text-blackish-ash pl-1">
                💡 To find your Chat ID: message your bot or send <code>/start</code> to <b>@userinfobot</b> on Telegram.
              </span>
            </div>
          )}

          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="p-3 bg-light-blue rounded-xl text-xs font-semibold text-navy-dark focus:outline-none"
          >
            <option value="Family">Family</option>
            <option value="Primary">Primary (Self)</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-blackish-ash hover:text-navy-dark cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#0058BE] hover:bg-[#00479c] text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {submitting ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center items-center text-blackish-ash text-xs">
          <Loader2 size={20} className="animate-spin text-[#0058BE] mr-2" />
          Loading contacts from MongoDB...
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recipients.map((r, idx) => {
            const isTelegram =
              r.channel === "telegram" || (!r.channel && r.telegramChatId);
            const destination = isTelegram
              ? r.telegramChatId || "Telegram Bot"
              : r.email || r.phone || "Email";

            return (
              <div
                key={r._id || idx}
                className="p-4 bg-white rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${
                      isTelegram
                        ? "bg-[#E6F4FB] text-[#0088cc]"
                        : "bg-light-blue text-[#0058BE]"
                    }`}
                  >
                    {isTelegram ? <Send size={18} /> : <Mail size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-navy-dark">
                        {r.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isTelegram
                            ? "bg-sky-50 text-[#0088cc] border border-sky-200"
                            : "bg-blue-50 text-[#0058BE] border border-blue-200"
                        }`}
                      >
                        {isTelegram ? "Telegram" : "Gmail"}
                      </span>
                    </div>
                    <p className="text-xs text-blackish-ash flex items-center gap-1.5 mt-0.5 font-medium">
                      {isTelegram ? (
                        <>Chat ID: {destination}</>
                      ) : (
                        <>{destination}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-light-blue text-[#0058BE] rounded-full">
                    {r.relationship}
                  </span>
                  {r._id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Contact"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-light-blue rounded-3xl flex items-center gap-3 border border-[#E2E7FF]">
        <ShieldCheck size={20} className="text-[#0058BE] shrink-0" />
        <p className="text-xs text-navy-dark font-medium leading-relaxed">
          Alerts will automatically be dispatched via <strong>Gmail</strong> &amp; <strong>Telegram</strong> directly to these recipients strictly at your configured alert times.
        </p>
      </div>
    </section>
  );
}
