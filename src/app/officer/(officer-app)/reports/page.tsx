"use client";
import { useLanguage } from "@/lib/i18n";

const dailyFarmers = [
  { day: "सोम", value: 38, height: "h-24" },
  { day: "मंगल", value: 44, height: "h-28" },
  { day: "बुध", value: 41, height: "h-26" },
  { day: "गुरु", value: 52, height: "h-32" },
  { day: "शुक्र", value: 49, height: "h-30" },
  { day: "शनि", value: 57, height: "h-32" },
  { day: "आज", value: 49, height: "h-30", current: true },
];

export default function ReportsPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-full bg-[#f4f9f4] p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">{t("weeklyReport")}</h1>
        <p className="mt-1 text-base font-semibold text-gray-600">{t("servedFarmers")}</p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-600">{t("totalFarmersWeek")}</h2>
          <p className="mt-2 text-4xl font-black text-gray-900">341</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-600">{t("totalPurchaseWeek")}</h2>
          <p className="mt-2 text-4xl font-black text-gray-900">₹58.2 L</p>
        </article>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-900">{t("dailyFarmers")}</h2>
        <p className="mt-1 text-sm font-semibold text-gray-600">{t("waitingAverage")}</p>
        <div className="mt-8 flex h-64 items-end justify-between gap-4 border-b border-gray-200 px-2">
          {dailyFarmers.map((entry) => (
            <div key={entry.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-sm font-bold text-gray-600">{entry.value}</span>
              <div className={`w-full max-w-12 ${entry.height} rounded-t-lg ${entry.current ? "bg-[var(--saffron)]" : "bg-[var(--civic)]"}`} />
              <span className="text-sm font-bold text-gray-700">{entry.day}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}