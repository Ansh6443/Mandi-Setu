"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MANDI_ID, STORAGE_KEYS } from "@/lib/storage-keys";
import type { TokenBoardState } from "@/lib/server/token-store";
import { useLanguage } from "@/lib/i18n";

const ratesStorageKey = STORAGE_KEYS.mspRates;

const initialRates = [
  { crop: "प्याज", value: "1850" },
  { crop: "गेहूँ", value: "2275" },
  { crop: "आलू", value: "1200" },
  { crop: "टमाटर", value: "900" },
  { crop: "सोयाबीन", value: "4700" },
];
const cropEmojis: Record<string, string> = {
  प्याज: "🧅",
  गेहूँ: "🌾",
  आलू: "🥔",
  टमाटर: "🍅",
  सोयाबीन: "🫘",
};

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const { t } = useLanguage();
  const [capacity, setCapacity] = useState("120");
  const [rates, setRates] = useState(() => {
    if (typeof window === "undefined") return initialRates;
    try {
      const savedRates = window.localStorage.getItem(ratesStorageKey);
      const parsedRates = savedRates ? JSON.parse(savedRates) : null;
      return Array.isArray(parsedRates) ? parsedRates : initialRates;
    } catch {
      return initialRates;
    }
  });

  useEffect(() => {
    let active = true;
    const loadStatus = async () => {
      try {
        const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`, { cache: "no-store" });
        if (!response.ok) throw new Error("मंडी की स्थिति लोड नहीं हो सकी।");
        const record = await response.json() as TokenBoardState;
        if (active) {
          setIsOpen(true);
          setStatusError("");
        }
      } catch (error) {
        if (active) setStatusError(error instanceof Error ? error.message : "मंडी की स्थिति लोड नहीं हो सकी।");
      } finally {
        if (active) setStatusLoading(false);
      }
    };

    void loadStatus();
    const intervalId = window.setInterval(() => void loadStatus(), 3000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function toggleMandiStatus() {
    if (statusLoading || statusUpdating) return;
    const nextStatus = !isOpen;
    setStatusUpdating(true);
    setStatusError("");
    try {
      const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mandiOpen: nextStatus }),
      });
      const result = await response.json() as TokenBoardState & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "मंडी की स्थिति सेव नहीं हो सकी।");
      setIsOpen(true);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "मंडी की स्थिति सेव नहीं हो सकी।");
    } finally {
      setStatusUpdating(false);
    }
  }

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ratesStorageKey || !event.newValue) return;
      try {
        const parsedRates = JSON.parse(event.newValue);
        if (Array.isArray(parsedRates)) setRates(parsedRates);
      } catch {
        // Keep the current settings when another tab writes invalid data.
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function updateRate(index: number, value: string) {
    setRates((current) => {
      const nextRates = current.map((rate, rateIndex) =>
      rateIndex === index ? { ...rate, value } : rate,
      );
      try {
        window.localStorage.setItem(ratesStorageKey, JSON.stringify(nextRates));
      } catch {
        // Keep the edit in the current page when browser storage is unavailable.
      }
      return nextRates;
    });
  }

  return (
    <main className="officer-page-shell">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">{t("mandiSettings")}</h1>
        <p className="mt-1 text-sm font-bold text-gray-600">{t("settingsDescription")}</p>
      </header>

      <div className="grid gap-6">
        <section className="flex min-h-20 items-center justify-between gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-black text-gray-900">{t("mandiStatus")}</h2>
            <p className="text-sm font-semibold text-gray-600">{isOpen ? t("mandiOpen") : t("mandiClosed")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isOpen}
            aria-label={t("toggleMandiStatus")}
            onClick={() => void toggleMandiStatus()}
            disabled
            className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
              isOpen ? "bg-[var(--success)]" : "bg-gray-300"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ${
                isOpen ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </section>
        {statusError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{statusError}</p>}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label htmlFor="capacity" className="mb-2 block text-sm font-black text-gray-700">{t("totalCapacity")}</label>
          <input
            id="capacity"
            type="number"
            min="0"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            className="h-14 w-full max-w-[180px] rounded-lg border border-gray-200 px-4 py-2 text-base font-semibold text-gray-900 outline-none focus:border-green-700"
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-black text-gray-900">{t("cropRates")}</h2>
          <p className="mt-1 text-sm font-semibold text-gray-600">{t("rateDescription")}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {rates.map((rate, index) => (
              <div key={rate.crop} className="rate-card rate-card--editable">
                <span className="rate-crop-icon" aria-hidden="true">{cropEmojis[rate.crop] ?? "🌱"}</span>
                <div className="rate-crop-name">{rate.crop}</div>
                <input
                  aria-label={`${rate.crop} दर`}
                  type="number"
                  min="0"
                  value={rate.value}
                  onChange={(event) => updateRate(index, event.target.value)}
                  className="rate-edit-input"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}