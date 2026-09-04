"use client";

import { useMemo } from "react";
import Link from "next/link";

const queueEntries = [
  { token: "#41", id: "MH-26032-1187", farmer: "विट्ठल शिंदे", crop: "गेहूँ", quantity: "अनुमानित 40 क्विंटल", slot: "08:30 AM", status: "भुगतान पूर्ण" },
  { token: "#42", id: "MH-26032-2093", farmer: "सुनीता जाधव", crop: "टमाटर", quantity: "अनुमानित 22 क्विंटल", slot: "09:00 AM", status: "भुगतान पूर्ण" },
  { token: "#43", id: "MH-26032-3456", farmer: "संतोष गायकवाड़", crop: "सोयाबीन", quantity: "अनुमानित 35 क्विंटल", slot: "09:30 AM", status: "तौल जारी" },
  { token: "#44", id: "MH-26032-2761", farmer: "कावेरी देशमुख", crop: "आलू", quantity: "अनुमानित 28 क्विंटल", slot: "09:45 AM", status: "चेक-इन" },
  { token: "#45", id: "MH-26032-3390", farmer: "रमेश पवार", crop: "प्याज", quantity: "अनुमानित 60 क्विंटल", slot: "10:00 AM", status: "चेक-इन" },
  { token: "#46", id: "MH-26032-4021", farmer: "अनिता भोसले", crop: "गेहूँ", quantity: "अनुमानित 33 क्विंटल", slot: "10:15 AM", status: "बुक्ड" },
  { token: "#47", id: "MH-26032-4812", farmer: "राम कुमार", crop: "प्याज", quantity: "अनुमानित 50 क्विंटल", slot: "10:15 AM", status: "बुक्ड" },
  { token: "#48", id: "MH-26032-2205", farmer: "दत्तात्रेय कुलकर्णी", crop: "टमाटर", quantity: "अनुमानित 18 क्विंटल", slot: "10:30 AM", status: "बुक्ड" },
];

const statusClasses: Record<string, string> = {
  बुक्ड: "bg-[var(--bg-body)] text-[var(--text-secondary)]",
  "चेक-इन": "bg-[var(--primary-50)] text-[var(--primary-700)]",
  "तौल जारी": "bg-[var(--saffron-t)] text-[var(--saffron)]",
  "भुगतान पूर्ण": "bg-[var(--ok-t)] text-[var(--success)]",
};

export default function QueueTable({ query }: { query: string }) {
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return queueEntries;
    return queueEntries.filter((entry) =>
      `${entry.token} ${entry.id} ${entry.farmer}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[1080px] overflow-hidden rounded-t-xl text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-bold text-gray-500">
              <th className="px-4 pt-3 pb-3">टोकन</th>
              <th className="px-4 pt-3 pb-3">किसान</th>
              <th className="px-4 pt-3 pb-3">फसल एवं मात्रा</th>
              <th className="px-4 pt-3 pb-3">स्लॉट समय</th>
              <th className="px-4 pt-3 pb-3">स्टेटस</th>
              <th className="px-4 pt-3 pb-3">एक्शन</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={entry.token} className={`border-b border-gray-200 last:border-0 ${entry.status === "तौल जारी" ? "bg-[var(--saffron-t)]" : "bg-white"}`}>
                <td className="px-4 py-4 font-black text-gray-900">{entry.token}</td>
                <td className="px-4 py-4">
                  <strong className="block font-black text-gray-900">{entry.farmer}</strong>
                  <span className="text-xs font-semibold text-gray-500">{entry.id}</span>
                </td>
                <td className="px-4 py-4 font-bold text-gray-900">{entry.crop} — {entry.quantity}</td>
                <td className="px-4 py-4 font-semibold text-gray-900">{entry.slot}</td>
                <td className="px-4 py-4">
                  <span className={`flex w-fit items-center gap-1.5 rounded px-2 py-1 text-sm font-bold ${statusClasses[entry.status]}`}>
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-current" />{entry.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {entry.status === "भुगतान पूर्ण" ? (
                    <button type="button" className="flex min-w-[140px] items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-center font-bold text-white">पूर्ण</button>
                  ) : (
                    <Link href={`${entry.status === "तौल जारी" ? "/officer/live-weighment" : "/officer/weighment"}?token=${entry.token.slice(1)}`} className={`flex min-w-[140px] items-center justify-center rounded-lg px-4 py-2 text-center font-bold text-white ${entry.status === "बुक्ड" ? "bg-primary-800 text-white hover:brightness-90" : entry.status === "तौल जारी" || entry.status === "चेक-इन" ? "bg-[var(--saffron)] hover:brightness-95" : "bg-[var(--civic)] hover:brightness-90"}`} style={entry.status === "बुक्ड" ? { backgroundColor: "#166534", color: "#FFFFFF" } : undefined}>
                      {entry.status === "तौल जारी" ? "तौल जारी रखें" : entry.status === "चेक-इन" ? "तौल शुरू करें" : "चेक-इन करें"}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
