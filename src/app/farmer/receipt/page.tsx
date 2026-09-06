"use client";

import { Clock, MapPin } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import VoiceSOSButton from "@/components/farmer/VoiceSOSButton";
import { DEMO_FARMER_ID, receiptStorageKey } from "@/lib/storage-keys";
import { useLanguage } from "@/lib/i18n";

export default function FarmerReceiptPage() {
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const { t } = useLanguage();
  const receiptKey = receiptStorageKey(DEMO_FARMER_ID);

  useEffect(() => {
    const readReceiptPhoto = () => {
      try {
        const storedReceipt = window.localStorage.getItem(receiptKey);
        const receipt = storedReceipt ? JSON.parse(storedReceipt) as { photo?: string } : null;
        setReceiptPhoto(receipt?.photo ?? null);
      } catch {
        setReceiptPhoto(null);
      }
    };

    readReceiptPhoto();
    window.addEventListener("storage", readReceiptPhoto);
    const refreshTimer = window.setInterval(readReceiptPhoto, 500);

    return () => {
      window.removeEventListener("storage", readReceiptPhoto);
      window.clearInterval(refreshTimer);
    };
  }, [receiptKey]);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-semibold text-slate-600">{t("digitalJForm")}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("receiptToken")}</h1>
            </div>
            <span className="rounded-md bg-emerald-100 px-2 py-1 text-sm font-bold text-emerald-800">{t("paymentComplete")}</span>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-600">{t("netPayment")}</p>
            <p className="mt-1 text-3xl font-bold text-green-700">₹90,090</p>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
            <h2 className="mb-4 font-bold text-slate-900">{t("certifiedEvidence")}</h2>
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-500">
              {receiptPhoto ? (
                <Image src={receiptPhoto} alt={t("officerPhoto")} width={600} height={240} className="max-h-60 w-full rounded-lg object-contain" unoptimized />
              ) : (
                t("noPhoto")
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin size={16} aria-hidden="true" />
                {t("gpsVerified")}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} aria-hidden="true" />
                {t("timeRecorded")}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <VoiceSOSButton />
        </div>
      </div>
    </main>
  );
}
