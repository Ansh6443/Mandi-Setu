"use client";

import { Camera, CheckCircle, Scales, WarningCircle } from "@phosphor-icons/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";

const farmer = {
  name: "रमेश पवार",
  bookingId: "MH-26032-3390",
  commodity: "प्याज",
};

const MSP_RATE: Record<string, number> = {
  गेहूँ: 2275,
  चावल: 2183,
  मक्का: 2090,
  सोयाबीन: 4600,
  आलू: 1200,
  प्याज: 1200,
  टमाटर: 1000,
};

export default function LiveWeighmentPanel() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [fallbackReason, setFallbackReason] = useState("");
  const [weight, setWeight] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const validWeight = Number(weight) > 0;
  const fallbackActive = captureAttempts >= 2 && !photoTaken;
  const canSubmit = Boolean(photoTaken && photoFile && validWeight && !submitted);
  const mspRate = MSP_RATE[farmer.commodity] ?? 0;
  const amount = validWeight ? Number(weight) * mspRate : 0;

  function handlePhotoCapture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setCaptureAttempts((attempts) => attempts + 1);
      event.target.value = "";
      return;
    }
    setCaptureAttempts((attempts) => attempts + 1);
    setPhotoFile(file);
    setPhotoTaken(true);
    setFallbackReason("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSubmitWeighment() {
    if (!canSubmit) return;
    setSubmitted(true);
    setSubmittedAt(new Date().toLocaleString("hi-IN"));
    if (photoPreview) {
      window.localStorage.setItem("kisan-setu-weighment-receipt", JSON.stringify({
        photo: photoPreview,
        farmer: farmer.name,
        commodity: farmer.commodity,
        weight,
        amount,
        submittedAt: new Date().toLocaleString("hi-IN"),
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSubmitWeighment();
  }

  return (
    <form className="w-full max-w-2xl overflow-visible rounded-[18px] border border-gray-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 leading-relaxed">
            <h2 className="text-xl font-black text-gray-900">{farmer.name}</h2>
            <p className="mt-1 break-words text-sm font-semibold text-gray-600">{farmer.bookingId}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">फसल</p>
            <p className="mt-1 font-black text-gray-900">{farmer.commodity}</p>
          </div>
          <div className="mt-1 mr-2 shrink-0 whitespace-nowrap rounded-full bg-[var(--primary-50)] px-3 py-1 text-sm font-semibold text-[var(--primary-700)]">टोकन #46</div>
        </div>

        <div className="rounded-[14px] border-2 border-dashed border-gray-300 p-5 text-center sm:p-7">
        {photoPreview ? (
          <Image src={photoPreview} alt="कांटे की लाइव फ़ोटो" width={384} height={192} className="mx-auto max-h-48 max-w-full rounded-lg object-contain" unoptimized />
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-gray-500">
            <Camera size={32} aria-hidden="true" />
            <p className="font-bold">लाइव फोटो लें</p>
          </div>
        )}
        {!submitted && <label className="mt-5 inline-flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-700 px-5 font-bold text-white hover:bg-green-800">
          <Camera size={22} aria-hidden="true" />
          {photoPreview ? "फिर से लें" : "स्केल की फ़ोटो लें"}
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhotoCapture} />
        </label>}
        {fallbackActive && !photoTaken && !submitted && (
          <div className="mx-auto mt-4 max-w-sm text-left">
            <label htmlFor="photo-fallback-reason" className="mb-2 block text-sm font-bold text-gray-700">कारण बताएं (फ़ोटो उपलब्ध नहीं)</label>
            <input id="photo-fallback-reason" type="text" value={fallbackReason} onChange={(event) => setFallbackReason(event.target.value)} placeholder="जैसे: camera not working" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-900 outline-none focus:border-green-700" />
          </div>
        )}
        </div>

        {fallbackActive && <div className="inline-flex rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">फ़ोटो के बिना दर्ज</div>}

        <div>
          <label htmlFor="live-weight" className="mb-2 block text-sm font-bold text-gray-700">वास्तविक तौल (क्विंटल में)</label>
          <input id="live-weight" type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="वास्तविक तौल दर्ज करें" disabled={submitted || (!photoTaken && !fallbackActive)} className={`h-14 w-full rounded-xl border border-gray-200 px-4 font-semibold outline-none focus:border-green-700 ${photoTaken || fallbackActive ? "text-gray-900" : "cursor-not-allowed bg-neutral-100 text-neutral-400"}`} />
        </div>

        <div>
          <label htmlFor="estimated-amount" className="mb-2 block text-sm font-bold text-gray-700">अनुमानित राशि (₹)</label>
          <input id="estimated-amount" type="text" value={amount ? `₹ ${amount.toLocaleString("en-IN")}` : "₹ 0"} readOnly disabled={submitted} className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-700 outline-none" />
        </div>

        {submittedAt && <p className="text-xs font-semibold text-gray-500">दर्ज समय: {submittedAt}</p>}

        <div className="mt-6 block w-full">
          {!submitted && !canSubmit && <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs font-semibold text-gray-500"><WarningCircle size={14} aria-hidden="true" />{!photoTaken && !validWeight ? "फ़ोटो लें और वज़न दर्ज करें" : !photoTaken ? "फ़ोटो लेना ज़रूरी है" : "वज़न दर्ज करें"}</p>}
          <button type="button" disabled={submitted || !photoTaken || !weight || Number(weight) <= 0} onClick={handleSubmitWeighment} className="live-weighment-submit mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary-600)] px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">
            <Scales size={20} aria-hidden="true" />
            जमा करें
          </button>
          {submitted && <div className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary-50)] px-4 py-2.5 font-semibold text-[var(--primary-700)]" role="status">
            <CheckCircle size={20} aria-hidden="true" />
            ✓ दर्ज किया गया
          </div>}
        </div>
      </div>
    </form>
  );
}