"use client";

import { useState } from "react";

const initialRates = [
  { crop: "प्याज", value: "1850" },
  { crop: "गेहूँ", value: "2275" },
  { crop: "आलू", value: "1200" },
  { crop: "टमाटर", value: "900" },
  { crop: "सोयाबीन", value: "4700" },
];

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [capacity, setCapacity] = useState("120");
  const [rates, setRates] = useState(initialRates);

  function updateRate(index: number, value: string) {
    setRates((current) => current.map((rate, rateIndex) =>
      rateIndex === index ? { ...rate, value } : rate,
    ));
  }

  return (
    <main className="min-h-full bg-[#f4f9f4] px-6 py-6 md:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">मंडी सेटिंग्स</h1>
        <p className="mt-1 text-sm font-bold text-gray-600">क्षमता और आज की फसल दरें यहाँ से नियंत्रित करें</p>
      </header>

      <div className="grid gap-6">
        <section className="flex min-h-20 items-center justify-between gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-black text-gray-900">मंडी स्थिति</h2>
            <p className="text-sm font-semibold text-gray-600">{isOpen ? "खुली है — किसान अभी बुकिंग कर सकते हैं" : "बंद है — किसान बुकिंग नहीं कर सकते"}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isOpen}
            aria-label="मंडी स्थिति बदलें"
            onClick={() => setIsOpen((current) => !current)}
            className={`flex h-14 w-14 items-center rounded-full p-1 transition-colors ${isOpen ? "bg-[var(--success)]" : "bg-[var(--text-secondary)]"}`}
          >
            <span className={`h-10 w-10 rounded-full bg-white shadow-sm transition-transform ${isOpen ? "translate-x-2" : "translate-x-0"}`} />
          </button>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <label htmlFor="capacity" className="mb-2 block text-sm font-black text-gray-700">आज की कुल क्षमता (स्लॉट)</label>
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
          <h2 className="text-base font-black text-gray-900">आज की फसल दरें (₹ / क्विंटल)</h2>
          <p className="mt-1 text-sm font-semibold text-gray-600">यह दरें तोल स्क्रीन में स्वतः दिखाई जाती हैं — यहाँ बदलाव से नई गणना पर असर पड़ेगा।</p>
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