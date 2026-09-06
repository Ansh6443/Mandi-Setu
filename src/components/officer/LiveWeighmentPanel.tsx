"use client";

import { Camera, CheckCircle, Scales, WarningCircle } from "@phosphor-icons/react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_FARMER_ID, STORAGE_KEYS, receiptStorageKey } from "@/lib/storage-keys";
const farmer = {
  name: "रमेश पवार",
  // किसान ऐप के Farmer ID से यही पहचान मिलनी चाहिए, तभी दोनों तरफ एक ही रसीद खुलेगी।
  bookingId: DEMO_FARMER_ID,
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

const ratesStorageKey = STORAGE_KEYS.mspRates;
// यह identifier KisanApp के farmerId से बिल्कुल समान होना MUST है, तभी receipt मिल पाएगी।
const receiptKey = receiptStorageKey(farmer.bookingId);

export default function LiveWeighmentPanel() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [fallbackReason, setFallbackReason] = useState("");
  const [weight, setWeight] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [mspRates, setMspRates] = useState(MSP_RATE);
  const redirectTimeout = useRef<number | null>(null);
  const validWeight = Number(weight) > 0;
  const fallbackActive = captureAttempts >= 2 && !photoTaken;
  const canSubmit = Boolean(photoTaken && photoFile && validWeight && !submitted);
  const mspRate = mspRates[farmer.commodity] ?? 0;
  const amount = validWeight ? Number(weight) * mspRate : 0;

  useEffect(() => {
    const readRates = () => {
      try {
        const savedRates = window.localStorage.getItem(ratesStorageKey);
        if (!savedRates) return;
        const parsedRates = JSON.parse(savedRates) as Array<{ crop?: string; value?: string }>;
        setMspRates(Object.fromEntries(parsedRates.map((rate) => [rate.crop, Number(rate.value)])));
      } catch {
        setMspRates(MSP_RATE);
      }
    };

    readRates();
    window.addEventListener("storage", readRates);
    return () => window.removeEventListener("storage", readRates);
  }, []);

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
      if (typeof reader.result !== "string") return;
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleSubmitWeighment() {
    if (!canSubmit) return;
    // photo upload के समय नहीं, केवल सफल submit पर किसान की रसीद save होगी।
    const submissionTime = new Date().toLocaleString("hi-IN");
    setSubmitted(true);
    setSubmittedAt(submissionTime);
    if (photoPreview) {
      try {
        window.localStorage.setItem(receiptKey, JSON.stringify({
          photo: photoPreview,
          farmer: farmer.name,
          bookingId: farmer.bookingId,
          commodity: farmer.commodity,
          weight,
          amount,
          submittedAt: submissionTime,
        }));
      } catch {
        // The submission can still complete when browser storage is unavailable.
      }
    }
  }

 function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (!canSubmit) return;
  handleSubmitWeighment();
  
  // सबमिट होने के 1.5 सेकंड बाद पेज बदलने का कोड
  redirectTimeout.current = window.setTimeout(() => {
    router.push("/officer/weighment"); 
  }, 1500);
}

  useEffect(() => () => {
    if (redirectTimeout.current !== null) window.clearTimeout(redirectTimeout.current);
  }, []);

  return (
   <form className="w-full max-w-2xl overflow-visible rounded-[18px] border border-gray-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] pb-16 mb-10" onSubmit={handleSubmit}>
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
  <input 
    id="live-weight" 
    type="number" 
    min="0" 
    step="0.1" 
    value={weight}
    onChange={(event) => setWeight(event.target.value)}
    placeholder="वास्तविक तौल दर्ज करें" 
    disabled={submitted} 
    className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 font-semibold text-gray-900 outline-none focus:border-green-700" 
  />
</div>

        <div>
          <label htmlFor="estimated-amount" className="mb-2 block text-sm font-bold text-gray-700">अनुमानित राशि (₹)</label>
          <input
            id="estimated-amount"
            type="text"
            value={amount ? `₹ ${amount.toLocaleString("en-IN")}` : "₹ 0"}
            readOnly
            disabled={submitted}
            className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-700 outline-none"
          />
        </div>

        {submittedAt && <p className="text-xs font-semibold text-gray-500">दर्ज समय: {submittedAt}</p>}

                <div className="mt-6 block w-full">
          <button
            type="submit"
            disabled={submitted || !photoTaken || !weight || Number(weight) <= 0}
            className={`flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-base font-bold transition-all ${
              submitted || !photoTaken || !weight || Number(weight) <= 0
                ? "cursor-not-allowed border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400"
                : "border-2 border-green-700 bg-green-700 text-white shadow-md hover:bg-green-800 hover:shadow-lg active:scale-[0.99]"
            }`}
          >
            <Scales size={22} aria-hidden="true" />
            जमा करें
          </button>

          {/* यह हिस्सा फिक्स हाइट रखेगा ताकि कुछ ऊपर-नीचे न भागे */}
          <div className="mt-4 min-h-[44px]">
            {submitted ? (
              <div
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700"
                role="status"
              >
                <CheckCircle size={20} aria-hidden="true" />
                ✓ दर्ज किया गया
              </div>
            ) : !photoTaken || !weight || Number(weight) <= 0 ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                <WarningCircle size={16} aria-hidden="true" />
                फ़ोटो लें और वज़न दर्ज करें
              </div>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                ✓ जानकारी सही है, बटन पर क्लिक करें
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}