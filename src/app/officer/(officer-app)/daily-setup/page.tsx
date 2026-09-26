"use client";

import { ArrowSquareOut, CalendarPlus, ChartLineUp, CheckCircle, Clock, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DEFAULT_MANDI_ID } from "@/lib/storage-keys";
import type { TokenBoardState } from "@/lib/server/token-store";
import { useLanguage } from "@/lib/i18n";

const setupUrl = `/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`;

export default function DailySetupPage() {
  const { t } = useLanguage();
  const [record, setRecord] = useState<TokenBoardState | null>(null);
  const [capacity, setCapacity] = useState("120");
  const [mandiOpen, setMandiOpen] = useState(false);
  const [expectedOpenTime, setExpectedOpenTime] = useState("08:00");
  const [expectedCloseTime, setExpectedCloseTime] = useState("18:00");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formInitialized = useRef(false);
  const issuedTokenCount = record
    ? record.completedTokens.length + Number(record.currentToken !== null)
    : 0;
  const remainingTokenCount = record ? Math.max(0, record.capacity - issuedTokenCount) : 0;

  function applyRecord(nextRecord: TokenBoardState) {
    setRecord(nextRecord);
    setCapacity(String(nextRecord.capacity));
    setMandiOpen(nextRecord.mandiOpen);
    setExpectedOpenTime(nextRecord.expectedOpenTime);
    setExpectedCloseTime(nextRecord.expectedCloseTime);
  }

  useEffect(() => {
    let active = true;
    const refreshDailyRecord = async () => {
      try {
        const response = await fetch(setupUrl, { cache: "no-store" });
        if (!response.ok) throw new Error("आज का रिकॉर्ड लोड नहीं हो सका।");
        const dailyRecord = await response.json() as TokenBoardState;
        if (!active) return;
        setRecord(dailyRecord);
        if (!formInitialized.current) {
          setCapacity(String(dailyRecord.capacity));
          setMandiOpen(dailyRecord.mandiOpen);
          setExpectedOpenTime(dailyRecord.expectedOpenTime);
          setExpectedCloseTime(dailyRecord.expectedCloseTime);
          formInitialized.current = true;
        }
        setError("");
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : "आज का रिकॉर्ड लोड नहीं हो सका।");
      } finally {
        if (active) setLoading(false);
      }
    };

    void refreshDailyRecord();
    const intervalId = window.setInterval(() => void refreshDailyRecord(), 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function submitSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (record?.setupCompletedAt && !window.confirm("आज की चालू कतार और टोकन क्रम रीसेट होंगे। क्या आप फिर से सेटअप करना चाहते हैं?")) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(setupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capacity: Number(capacity),
          mandiOpen,
          expectedOpenTime,
          expectedCloseTime,
          redoConfirmed: Boolean(record?.setupCompletedAt),
        }),
      });
      const result = await response.json() as TokenBoardState & { error?: string };
      if (!response.ok || !result.setupCompletedAt) throw new Error(result.error ?? "सेटअप सेव नहीं हो सका।");
      applyRecord(result);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "सेटअप सेव नहीं हो सका।");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="officer-page-shell daily-setup-page">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">दैनिक सेटअप</h1>
        <p className="mt-1 text-sm font-bold text-gray-600">{record?.date ?? "आज"} · {t("officerMandi")}</p>
      </header>

      {record?.setupCompletedAt && (
        <section className="officer-card mb-6 flex flex-wrap items-center justify-between gap-4 border-green-200 bg-green-50 text-green-800" role="status">
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" aria-hidden="true" />
                <div>
                  <strong className="block">{record.mandiOpen ? "आज की मंडी सक्रिय है — टोकन #01 से शुरू" : "आज का सेटअप पूरा है — टोकन #01 से शुरू"}</strong>
                  <span className="mt-1.5 text-sm">{record.mandiOpen ? "मंडी खुली है" : "मंडी बंद है"} · क्षमता {record.capacity} स्लॉट</span>
                </div>
              </div>
              <span className="text-xs font-semibold">सेटअप: {new Date(record.setupCompletedAt).toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-live="polite">
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-green-200 bg-white/70 px-4 py-3.5">
                <Clock size={20} aria-hidden="true" />
                <div className="min-w-0"><strong className="block text-base leading-tight">{record.currentToken === null ? "—" : `#${String(record.currentToken).padStart(2, "0")}`}</strong><span className="mt-1 block text-xs font-semibold">वर्तमान टोकन</span></div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-green-200 bg-white/70 px-4 py-3.5">
                <UsersThree size={20} aria-hidden="true" />
                <div className="min-w-0"><strong className="block text-base leading-tight">{issuedTokenCount}</strong><span className="mt-1 block text-xs font-semibold">कुल बुक किए गए टोकन</span></div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-green-200 bg-white/70 px-4 py-3.5">
                <ChartLineUp size={20} aria-hidden="true" />
                <div className="min-w-0"><strong className="block text-base leading-tight">{remainingTokenCount}</strong><span className="mt-1 block text-xs font-semibold">शेष टोकन</span></div>
              </div>
              <div className={`flex min-w-0 items-center gap-3 rounded-lg border px-4 py-3.5 ${record.mandiOpen ? "border-green-200 bg-green-100 text-green-800" : "border-gray-200 bg-gray-100 text-gray-600"}`}>
                <CheckCircle size={20} aria-hidden="true" />
                <div className="min-w-0"><strong className="block text-sm leading-tight">{record.mandiOpen ? "मंडी सक्रिय" : "मंडी बंद"}</strong><span className="mt-1 block text-xs font-semibold">स्थिति</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={submitSetup} className="grid gap-6">
        <section className="officer-card">
          <label htmlFor="daily-capacity" className="f-label">आज की क्षमता</label>
          <input
            id="daily-capacity"
            type="number"
            min="0"
            step="1"
            required
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            disabled={loading || submitting}
            className="inp-basic max-w-[220px]"
          />
          <p className="mt-2 text-xs font-semibold text-gray-500">पिछले दिन की क्षमता डिफ़ॉल्ट रूप से भरी जाती है।</p>
        </section>

        <section className="officer-card">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-base font-black text-gray-900">मंडी खुली है</h2>
              <p className="mt-1 text-sm font-semibold text-gray-600">{mandiOpen ? "किसान लाइव बोर्ड पर मंडी खुली देखेंगे" : "किसान लाइव बोर्ड पर मंडी बंद देखेंगे"}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={mandiOpen}
              aria-label="मंडी खुली है"
              onClick={() => setMandiOpen((current) => !current)}
              disabled={loading || submitting}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors duration-200 ${mandiOpen ? "bg-[var(--success)]" : "bg-gray-300"}`}
            >
              <span className={`h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ${mandiOpen ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="f-label">खुलने का समय<input type="time" value={expectedOpenTime} onChange={(event) => setExpectedOpenTime(event.target.value)} disabled={loading || submitting} className="inp-basic" /></label>
            <label className="f-label">बंद होने का समय<input type="time" value={expectedCloseTime} onChange={(event) => setExpectedCloseTime(event.target.value)} disabled={loading || submitting} className="inp-basic" /></label>
          </div>
        </section>

        <section className="officer-card flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-gray-900">आज की फसल दरें</h2>
            <p className="mt-1 text-sm font-semibold text-gray-600">सेटअप से पहले मंडी सेटिंग्स में दरें जाँचें।</p>
          </div>
          <Link href="/officer/settings" className="officer-ghost-button">
            मंडी सेटिंग्स खोलें <ArrowSquareOut size={18} aria-hidden="true" />
          </Link>
        </section>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={loading || submitting || !capacity.trim()} className="btn-primary flex h-14 items-center gap-2 px-6 disabled:cursor-not-allowed disabled:opacity-50">
            {record?.setupCompletedAt ? <Clock size={20} aria-hidden="true" /> : <CalendarPlus size={20} aria-hidden="true" />}
            {record?.setupCompletedAt ? "फिर से सेटअप करें" : "आज का सेटअप शुरू करें"}
          </button>
          {loading && <span className="text-sm font-semibold text-gray-500">आज का रिकॉर्ड लोड हो रहा है…</span>}
        </div>
      </form>
    </main>
  );
}