"use client";

import { Clock, MapPin } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import VoiceSOSButton from "@/components/farmer/VoiceSOSButton";

export default function FarmerReceiptPage() {
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

  useEffect(() => {
    const readReceiptPhoto = () => {
      try {
        const storedReceipt = window.localStorage.getItem("kisan-setu-weighment-receipt");
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
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-semibold text-slate-600">डिजिटल J-Form</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">टोकन T-114</h1>
            </div>
            <span className="rounded-md bg-emerald-100 px-2 py-1 text-sm font-bold text-emerald-800">भुगतान पूर्ण</span>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-600">निवल भुगतान राशि</p>
            <p className="mt-1 text-3xl font-bold text-green-700">₹90,090</p>
          </div>

          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
            <h2 className="mb-4 font-bold text-slate-900">कांटे का प्रमाणित साक्ष्य</h2>
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-slate-500">
              {receiptPhoto ? (
                <Image src={receiptPhoto} alt="अधिकारी द्वारा अपलोड की गई कांटे की फोटो" width={600} height={240} className="max-h-60 w-full rounded-lg object-contain" unoptimized />
              ) : (
                "अधिकारी द्वारा अपलोड की गई फोटो उपलब्ध नहीं है"
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin size={16} aria-hidden="true" />
                GPS सत्यापित
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} aria-hidden="true" />
                समय दर्ज
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
