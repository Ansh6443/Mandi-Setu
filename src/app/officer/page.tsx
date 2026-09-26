"use client";

import { CalendarCheck, CheckCircle, ChartLineUp, Clock, MicrophoneStage, SpeakerHigh, SquaresFour } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_MANDI_ID, STORAGE_KEYS } from "@/lib/storage-keys";
import { useLanguage } from "@/lib/i18n";
import type { TokenBoardState } from "@/lib/server/token-store";

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
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [toast, setToast] = useState("");
  const [tokenState, setTokenState] = useState<TokenBoardState | null>(null);
  const [tokenActionPending, setTokenActionPending] = useState(false);

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

  useEffect(() => {
    let active = true;
    const refreshTokenState = async () => {
      try {
        const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`, { cache: "no-store" });
        if (!response.ok) return;
        const state = await response.json() as TokenBoardState;
        if (active) setTokenState(state);
      } catch {
        if (active) setTokenState(null);
      }
    };

    void refreshTokenState();
    const intervalId = window.setInterval(() => void refreshTokenState(), 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (isAuthenticated !== true) return null;

  async function updateToken(action: "advance" | "undo") {
    setTokenActionPending(true);
    try {
      const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json() as { error?: string; requiresSetup?: boolean; state?: TokenBoardState; advanced?: boolean; debounced?: boolean; noMoreTokens?: boolean; undone?: boolean };
      if (!response.ok) {
        setToast(payload.requiresSetup ? "कृपया पहले आज का सेटअप पूरा करें" : payload.error ?? "टोकन अपडेट नहीं हो सका। फिर से कोशिश करें।");
        return;
      }
      const result = payload as {
        state: TokenBoardState;
        advanced?: boolean;
        debounced?: boolean;
        noMoreTokens?: boolean;
        undone?: boolean;
      };
      setTokenState(result.state);

      if (action === "undo") {
        setToast(result.undone ? `पिछला टोकन #${result.state.currentToken ?? "—"} वापस बुलाया गया` : "वापस करने के लिए पिछला टोकन नहीं है");
        return;
      }
      if (result.debounced) {
        setToast("टोकन अभी हाल में बदला गया है।");
        return;
      }
      if (result.noMoreTokens || result.state.currentToken === null) {
        setToast("आज कोई और टोकन नहीं");
        return;
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const announcement = new SpeechSynthesisUtterance(`टोकन नंबर ${result.state.currentToken}, कृपया काउंटर पर आइए।`);
        announcement.lang = "hi-IN";
        announcement.rate = 0.92;
        window.speechSynthesis.speak(announcement);
      }
      setToast(`टोकन #${result.state.currentToken} बुलाया गया`);
    } catch {
      setToast("टोकन अपडेट नहीं हो सका। फिर से कोशिश करें।");
    } finally {
      setTokenActionPending(false);
    }
  }

  function callNextToken() {
    void updateToken("advance");
  }

  function undoToken() {
    void updateToken("undo");
  }

  function assignSlot(token: number) {
    const entry = entries.find((item) => item.token === token);
    if (!entry) return;
    const nextStatus = entry.status === "चेक-इन" ? "तौल जारी" : "चेक-इन";
    setEntries((current) => current.map((item) => item.token === token ? { ...item, status: nextStatus } : item));
    setToast((nextStatus === "तौल जारी" ? t("weighingStarted") : t("slotAssigned")).replace("{token}", String(token)));
  }

  return (
    <div className="officer-page">
      <div className="officer-main-content">
        <section className="officer-page-head">
          <div><h1>{t("officerDashboard")}</h1><p>{tokenState?.date ? `${tokenState.date} · ${t("officerMandi")}` : t("todayMandi")}</p></div>
          <div className="officer-ghost-button flex h-14 items-center rounded-xl"><Clock size={15} /> 05:40 pm</div>
        </section>
        <section className="officer-kpi-grid gap-6">
          <Kpi icon={<CalendarCheck />} number={tokenState ? String(tokenState.capacity) : "—"} label={t("todayCapacity")} note={t("availableSlots")} tone="green" />
          <Kpi icon={<SquaresFour />} number={tokenState ? String(tokenState.dailyTokenNumbers.length) : "—"} label={t("booked")} note={t("totalTokens")} tone="saffron" />
          <Kpi icon={<CheckCircle />} number="5" label={t("arrived")} note={t("atGate")} tone="green" />
          <Kpi icon={<CheckCircle />} number="2" label={t("complete")} note={t("paid")} tone="ok" />
          <Kpi icon={<Clock />} number={`18 ${t("minutesWait")}`} label={t("averageWait")} note={t("basedOnFarmers")} tone="slate" />
        </section>
        <section className="officer-call-banner gap-6 p-6">
          <div><p>{t("nextStep")}</p><h2>{t("callFarmer")}</h2><span>{t("voiceAnnouncement")}</span><p className="mt-2 text-sm font-bold" role="status" aria-live="polite">{tokenState?.setupCompletedAt ? tokenState.currentToken === null ? "आज कोई और टोकन नहीं" : `वर्तमान टोकन #${String(tokenState.currentToken).padStart(2, "0")}` : <Link href="/officer/daily-setup">कृपया पहले आज का सेटअप पूरा करें</Link>}</p></div>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={tokenActionPending} className="flex h-14 items-center rounded-xl" onClick={callNextToken}><SpeakerHigh size={20} /> {t("callNextToken")}</button>
            <button type="button" disabled={tokenActionPending} className="flex h-14 items-center rounded-xl" onClick={undoToken}>पिछला टोकन</button>
          </div>
        </section>
        {toast && <div className="officer-toast"><MicrophoneStage size={18} />{toast}</div>}
        <section className="officer-card officer-queue-card rounded-2xl border border-gray-200 p-6">
          <div className="officer-card-heading"><h2>{t("queueOverview")}</h2><Link href="/officer/queue" className="officer-ghost-button flex h-14 items-center rounded-xl">{t("fullList")} <ChartLineUp size={15} /></Link></div>
          <div className="officer-table-wrap"><table><thead><tr><th>{t("tokenNumber")}</th><th>{t("farmerName")}</th><th>{t("crop")}</th><th>{t("status")}</th><th>{t("action")}</th></tr></thead><tbody>{entries.map((entry, index) => { const dailyToken = tokenState?.dailyTokenNumbers[index]; return <tr key={entry.token}><td>#{dailyToken ?? "—"}</td><td>{entry.name}</td><td>{entry.crop}</td><td><span className={`officer-status ${statusClass[entry.status]}`}><span />{entry.status}</span></td><td><button type="button" className="officer-row-action" onClick={() => assignSlot(entry.token)}>{entry.status === "चेक-इन" ? t("weighmentPayment") : entry.status === "तौल जारी" ? t("liveWeighment") : t("checkIn")}</button></td></tr>; })}</tbody></table></div>
        </section>
        <section className="officer-dashboard-columns gap-6"><div className="officer-card rounded-2xl border border-gray-200 p-6"><div className="officer-card-heading"><h2>{t("operationalSnapshot")}</h2></div><div className="officer-stats-grid gap-6"><div className="p-6"><strong>94%</strong><span>{t("gatePassIssued")}</span></div><div className="p-6"><strong>24</strong><span>{t("activeFarmers")}</span></div><div className="p-6"><strong>₹ 2.3L</strong><span>{t("todayPayment")}</span></div><div className="p-6"><strong>5</strong><span>{t("pendingReview")}</span></div></div></div><div className="officer-card rounded-2xl border border-gray-200 p-6"><div className="officer-card-heading"><h2>{t("manualIntervention")}</h2></div><div className="officer-intervention py-4"><span>{t("weightVerification")}</span><span>{t("high")}</span></div><div className="officer-intervention py-4"><span>{t("qualityInspection")}</span><span>{t("medium")}</span></div></div></section>
      </div>
    </div>
  );
}

function Kpi({ icon, number, label, note, tone }: { icon: React.ReactNode; number: string; label: string; note: string; tone: string }) {
  return <div className="officer-kpi-card rounded-2xl border border-gray-200 p-6"><div className={`officer-kpi-icon ${tone}`}>{icon}</div><strong className="text-4xl font-black text-gray-900">{number}</strong><span className="text-sm font-bold text-gray-500">{label}</span><small className="text-sm font-bold text-gray-500">{note}</small></div>;
}
