"use client";

import { CalendarCheck, CheckCircle, ChartLineUp, Clock, MicrophoneStage, SpeakerHigh, SquaresFour } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/lib/storage-keys";

type QueueEntry = {
  name: string;
  token: number;
  crop: string;
  status: "भुगतान पूर्ण" | "तौल जारी" | "चेक-इन" | "बुक्ड";
};

const initialEntries: QueueEntry[] = [
  { name: "विट्ठल शिंदे", token: 41, crop: "गेहूँ", status: "भुगतान पूर्ण" },
  { name: "सुनीता जाधव", token: 42, crop: "टमाटर", status: "भुगतान पूर्ण" },
  { name: "संतोष गायकवाड़", token: 43, crop: "सोयाबीन", status: "तौल जारी" },
  { name: "कावेरी देशमुख", token: 44, crop: "आलू", status: "चेक-इन" },
  { name: "रमेश पवार", token: 45, crop: "प्याज", status: "चेक-इन" },
];

const statusClass: Record<QueueEntry["status"], string> = {
  "भुगतान पूर्ण": "status-paid",
  "तौल जारी": "status-weighing",
  "चेक-इन": "status-arrived",
  बुक्ड: "status-booked",
};

export default function OfficerPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let authenticated = false;
    try {
      authenticated = window.localStorage.getItem(STORAGE_KEYS.officerAuthenticated) === "true";
    } catch {
      authenticated = false;
    }

    if (!authenticated) {
      router.replace("/officer/login");
      return;
    }
    const frameId = window.requestAnimationFrame(() => setIsAuthenticated(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [router]);

  if (isAuthenticated !== true) return null;

  function callNextToken() {
    const next = entries.find((entry) => entry.status === "चेक-इन");
    if (!next) {
      setToast("अभी कोई किसान प्रतीक्षा में नहीं है");
      return;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const announcement = new SpeechSynthesisUtterance(`टोकन नंबर ${next.token}, कृपया काउंटर पर आइए।`);
      announcement.lang = "hi-IN";
      announcement.rate = 0.92;
      window.speechSynthesis.speak(announcement);
    }
    setToast(`टोकन #${next.token} — ${next.name} को बुलाया गया`);
  }

  function assignSlot(token: number) {
    const entry = entries.find((item) => item.token === token);
    if (!entry) return;
    const nextStatus = entry.status === "चेक-इन" ? "तौल जारी" : "चेक-इन";
    setEntries((current) => current.map((item) => item.token === token ? { ...item, status: nextStatus } : item));
    setToast(nextStatus === "तौल जारी" ? `टोकन #${token} की तौल शुरू हुई` : `टोकन #${token} के लिए स्लॉट असाइन किया गया`);
  }

  return (
    <div className="officer-page">
      <div className="officer-main-content">
        <section className="officer-page-head">
          <div><h1>आज का डैशबोर्ड</h1><p>गुरुवार, 27 अगस्त 2026 · आज़ादपुर मंडी</p></div>
          <div className="officer-ghost-button flex h-14 items-center rounded-xl"><Clock size={15} /> 05:40 pm</div>
        </section>
        <section className="officer-kpi-grid gap-6">
          <Kpi icon={<CalendarCheck />} number="120" label="आज की क्षमता" note="कुल उपलब्ध स्लॉट" tone="green" />
          <Kpi icon={<SquaresFour />} number="8" label="बुक किए गए" note="आज के कुल टोकन" tone="saffron" />
          <Kpi icon={<CheckCircle />} number="5" label="पहुंचे (चेक-इन)" note="गेट पर उपस्थित" tone="green" />
          <Kpi icon={<CheckCircle />} number="2" label="पूर्ण" note="भुगतान हो चुका" tone="ok" />
          <Kpi icon={<Clock />} number="18 मिनट" label="औसत प्रतीक्षा" note="पिछले 50 किसानों पर आधारित" tone="slate" />
        </section>
        <section className="officer-call-banner gap-6 p-6">
          <div><p>अगला कदम</p><h2>प्रतीक्षारत किसान को काउंटर पर बुलाएं</h2><span>हिंदी में वास्तविक ध्वनि उद्घोषणा (Web Speech API)</span></div>
          <button type="button" className="flex h-14 items-center rounded-xl" onClick={callNextToken}><SpeakerHigh size={20} /> अगला टोकन बुलाएं</button>
        </section>
        {toast && <div className="officer-toast"><MicrophoneStage size={18} />{toast}</div>}
        <section className="officer-card officer-queue-card rounded-2xl border border-gray-200 p-6">
          <div className="officer-card-heading"><h2>आज की कतार — एक नज़र में</h2><Link href="/officer/queue" className="officer-ghost-button flex h-14 items-center rounded-xl">पूरी सूची <ChartLineUp size={15} /></Link></div>
          <div className="officer-table-wrap"><table><thead><tr><th>टोकन</th><th>किसान</th><th>फसल</th><th>स्टेटस</th><th>एक्शन</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.token}><td>#{entry.token}</td><td>{entry.name}</td><td>{entry.crop}</td><td><span className={`officer-status ${statusClass[entry.status]}`}><span />{entry.status}</span></td><td><button type="button" className="officer-row-action" onClick={() => assignSlot(entry.token)}>{entry.status === "चेक-इन" ? "तौल शुरू करें" : entry.status === "तौल जारी" ? "तौल जारी रखें" : "चेक-इन करें"}</button></td></tr>)}</tbody></table></div>
        </section>
        <section className="officer-dashboard-columns gap-6"><div className="officer-card rounded-2xl border border-gray-200 p-6"><div className="officer-card-heading"><h2>ऑपरेशनल स्नैपशॉट</h2></div><div className="officer-stats-grid gap-6"><div className="p-6"><strong>94%</strong><span>गेट पास जारी</span></div><div className="p-6"><strong>24</strong><span>सक्रिय किसान</span></div><div className="p-6"><strong>₹ 2.3L</strong><span>आज का भुगतान</span></div><div className="p-6"><strong>5</strong><span>लंबित समीक्षा</span></div></div></div><div className="officer-card rounded-2xl border border-gray-200 p-6"><div className="officer-card-heading"><h2>मैनुअल हस्तक्षेप</h2></div><div className="officer-intervention py-4"><span>वज़न सत्यापन</span><span>उच्च</span></div><div className="officer-intervention py-4"><span>गुणवत्ता निरीक्षण</span><span>मध्यम</span></div></div></section>
      </div>
    </div>
  );
}

function Kpi({ icon, number, label, note, tone }: { icon: React.ReactNode; number: string; label: string; note: string; tone: string }) {
  return <div className="officer-kpi-card rounded-2xl border border-gray-200 p-6"><div className={`officer-kpi-icon ${tone}`}>{icon}</div><strong className="text-4xl font-black text-gray-900">{number}</strong><span className="text-sm font-bold text-gray-500">{label}</span><small className="text-sm font-bold text-gray-500">{note}</small></div>;
}
