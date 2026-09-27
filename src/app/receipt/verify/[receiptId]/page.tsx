"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type VerifiedReceipt = {
  verified: boolean;
  receiptNumber: string;
  issuedAt: string;
  farmerName: string;
  farmerId: string;
  mandiName: string;
  crop: string;
  grade: string;
  weightQuintals: number;
  mspRate: number;
  totalAmount: number;
  transactionId: string;
};

export default function VerifyReceiptPage() {
  const params = useParams<{ receiptId: string }>();
  const [receipt, setReceipt] = useState<VerifiedReceipt | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/receipts/${encodeURIComponent(params.receiptId)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Receipt could not be verified");
        setReceipt(await response.json() as VerifiedReceipt);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [params.receiptId]);

  const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {receipt ? (
          <>
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle size={30} weight="fill" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">मंडी सेतु</p>
                <h1 className="text-xl font-extrabold">रसीद सत्यापित</h1>
              </div>
            </div>
            <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-900">यह रसीद मंडी सेतु के server record से मेल खाती है।</p>
            <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500">रसीद नंबर</dt><dd className="mt-1 font-bold">{receipt.receiptNumber}</dd></div>
              <div><dt className="text-slate-500">दिनांक-समय</dt><dd className="mt-1 font-bold">{new Date(receipt.issuedAt).toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" })}</dd></div>
              <div><dt className="text-slate-500">किसान</dt><dd className="mt-1 font-bold">{receipt.farmerName} · {receipt.farmerId}</dd></div>
              <div><dt className="text-slate-500">मंडी</dt><dd className="mt-1 font-bold">{receipt.mandiName}</dd></div>
              <div><dt className="text-slate-500">फसल / ग्रेड</dt><dd className="mt-1 font-bold">{receipt.crop} · {receipt.grade}</dd></div>
              <div><dt className="text-slate-500">वेटब्रिज तौल</dt><dd className="mt-1 font-bold">{receipt.weightQuintals} क्विंटल</dd></div>
              <div><dt className="text-slate-500">MSP दर / क्विंटल</dt><dd className="mt-1 font-bold">{formatAmount(receipt.mspRate)}</dd></div>
              <div><dt className="text-slate-500">कुल भुगतान</dt><dd className="mt-1 font-bold">{formatAmount(receipt.totalAmount)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-slate-500">लेनदेन आईडी</dt><dd className="mt-1 break-all font-mono font-bold">{receipt.transactionId}</dd></div>
            </dl>
            <p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">यह computer-generated receipt है; हस्ताक्षर आवश्यक नहीं।</p>
          </>
        ) : failed ? (
          <div className="flex items-center gap-3 text-red-700" role="alert">
            <WarningCircle size={28} aria-hidden="true" />
            <div><h1 className="font-extrabold">रसीद सत्यापित नहीं हुई</h1><p className="mt-1 text-sm">यह रसीद server record में नहीं मिली या उपलब्ध नहीं है।</p></div>
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-600" role="status">रसीद सत्यापित हो रही है…</p>
        )}
      </section>
    </main>
  );
}