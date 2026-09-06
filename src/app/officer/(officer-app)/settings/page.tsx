"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useLanguage } from "@/lib/i18n";

const ratesStorageKey = STORAGE_KEYS.mspRates;

const initialRates = [
  { crop: "प्याज", value: "1850" },
  { crop: "गेहूँ", value: "2275" },
  { crop: "आलू", value: "1200" },
  { crop: "टमाटर", value: "900" },
  { crop: "सोयाबीन", value: "4700" },
];

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
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
    <main className="min-h-full bg-[#f4f9f4] px-6 py-6 md:px-8">
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
  onClick={() => setIsOpen((current) => !current)}
  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors duration-200 ${
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
          <div className="mt-4">
            {rates.map((rate, index) => (
              <div key={rate.crop} className="flex min-h-20 items-center justify-between gap-6 border-b border-neutral-200 py-4 last:border-0">
                <span className="font-black text-gray-900">{rate.crop}</span>
                <input
                  aria-label={`${rate.crop} दर`}
                  type="number"
                  min="0"
                  value={rate.value}
                  onChange={(event) => updateRate(index, event.target.value)}
                  className="h-14 w-full max-w-[180px] rounded-lg border border-gray-200 px-4 py-2 text-right font-semibold text-gray-900 outline-none focus:border-green-700"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}