"use client";

import { CheckCircle, Scales } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useEffect } from "react";

const farmer = {
  name: "रमेश पवार",
  bookingId: "MH-26032-3390",
  commodity: "प्याज",
};

const defaultMspRates: Record<string, number> = { प्याज: 1850 };
const ratesStorageKey = "kisan-setu-msp-rates";

export default function WeighmentPanel() {
  const router = useRouter();
  const [weight, setWeight] = useState("60");
  const [submitted, setSubmitted] = useState(false);
  const [mspRates, setMspRates] = useState(defaultMspRates);

  useEffect(() => {
    const readRates = () => {
      try {
        const savedRates = window.localStorage.getItem(ratesStorageKey);
        if (!savedRates) return;
        const parsedRates = JSON.parse(savedRates) as Array<{ crop?: string; value?: string }>;
        setMspRates(Object.fromEntries(parsedRates.map((rate) => [rate.crop, Number(rate.value)])));
      } catch {
        setMspRates(defaultMspRates);
      }
    };

    readRates();
    window.addEventListener("storage", readRates);
    return () => window.removeEventListener("storage", readRates);
  }, []);

  const numericWeight = Number(weight);
  const mspRate = mspRates[farmer.commodity] ?? defaultMspRates[farmer.commodity];
  const gross = numericWeight > 0 ? numericWeight * mspRate : 0;
  const tax = gross * 0.01;
  const net = gross - tax;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!(Number.isFinite(numericWeight) && numericWeight > 0)) return;
    setSubmitted(true);
    router.push("/officer/payment-list");
  }

  return (
    <form className="grid grid-cols-1 items-start gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{farmer.name}</h2>
            <p className="mt-1 text-xs font-semibold text-gray-500">{farmer.bookingId}</p>
            <p className="mt-4 text-sm font-bold text-gray-700">फसल</p>
            <p className="font-black text-gray-900">{farmer.commodity}</p>
          </div>
          <div className="rounded-md bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700">टोकन #46</div>
        </div>

        <label htmlFor="actual-weight" className="mb-2 block text-sm font-bold text-slate-700">वास्तविक तौल (क्विंटल में)</label>
        <input
          id="actual-weight"
          type="number"
          min="0"
          step="0.1"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="वास्तविक तौल दर्ज करें"
          className="mb-6 h-14 w-full rounded-md border-2 border-slate-300 px-4 text-base font-semibold text-slate-900 outline-none transition-colors focus:border-green-600"
        />

        <label htmlFor="estimated-amount" className="mb-2 block text-sm font-bold text-slate-700">अनुमानित राशि (₹)</label>
        <input id="estimated-amount" type="text" value={`₹ ${Math.round(gross).toLocaleString("hi-IN")}`} readOnly className="mb-6 h-14 w-full rounded-md border-2 border-slate-300 bg-gray-50 px-4 text-base font-semibold text-slate-700" />

        <label htmlFor="msp-rate" className="mb-2 block text-sm font-bold text-slate-700">दर / क्विंटल (₹) — मंडी सेटिंग्स से</label>
        <input id="msp-rate" type="number" value={mspRate} readOnly className="h-14 w-full rounded-md border-2 border-slate-300 bg-white px-4 text-base font-semibold text-slate-900" />
        <p className="mb-4 mt-2 text-xs font-semibold text-gray-500">दर बदलनी है? <span className="font-black text-green-700">मंडी सेटिंग्स खोलें</span></p>

        <button type="submit" disabled={submitted || !(Number.isFinite(numericWeight) && numericWeight > 0)} className="payment-submit-button relative z-10 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 font-bold text-white transition-all duration-200 active:scale-95 hover:bg-green-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
          {submitted ? <CheckCircle size={22} aria-hidden="true" /> : <Scales size={22} aria-hidden="true" />}
          {submitted ? "✓ दर्ज किया गया" : "J-Form जनरेट करें और DBT भेजें"}
        </button>
        {submitted && <p className="mt-3 text-sm font-medium text-green-700">✓ दर्ज किया गया</p>}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 border-b border-slate-200 pb-4 text-lg font-bold text-slate-900">डिजिटल J-Form — पूर्वावलोकन</h2>
        <div className="flex items-center justify-between gap-6 py-4 text-base font-bold text-slate-600">
          <span>सकल राशि</span>
          <span className="text-slate-900">₹{Math.round(gross).toLocaleString("hi-IN")}</span>
        </div>
        <div className="flex items-center justify-between gap-6 py-4 text-base font-bold text-red-600">
          <span>मंडी टैक्स (1%)</span>
          <span>− ₹{Math.round(tax).toLocaleString("hi-IN")}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-6 border-t-2 border-dashed border-slate-300 pt-5 text-xl font-bold text-green-700">
          <span>निवल भुगतान</span>
          <span>₹{Math.round(net).toLocaleString("hi-IN")}</span>
        </div>
      </section>

    </form>
  );
}
