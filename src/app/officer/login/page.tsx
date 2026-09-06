"use client";

import { LockKey } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export default function OfficerLoginPage() {
  const router = useRouter();
  const [mandi, setMandi] = useState("आज़ादपुर मंडी");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(STORAGE_KEYS.officerAuthenticated, "true");
    } catch {
      // The guard will redirect back if browser storage is unavailable.
    }
    router.push("/officer/dashboard");
  }

  return (
    <main className="auth-wrap officer-login">
        <div className="auth-badge"><LockKey size={15} /> PS 26032 · Secure Employee Login</div>
        <h1 className="portal-title">मंडी अधिकारी पोर्टल</h1>
        <p className="muted login-subtitle">कतार, तौल और भुगतान — एक ही डैशबोर्ड से प्रबंधित करें।</p>
        <form onSubmit={handleLogin}>
          <label className="f-label">कर्मचारी आईडी (Employee ID)</label>
          <input className="inp-basic" placeholder="DOCA-OFF-2291" defaultValue="DOCA-OFF-2291" />
          <label className="f-label">तैनाती मंडी (Assigned Mandi)</label>
          <select className="inp-basic" value={mandi} onChange={(event) => setMandi(event.target.value)}>
            <option>आज़ादपुर मंडी</option><option>गाज़ीपुर सेंटर</option>
          </select>
          <label className="f-label">सुरक्षित पिन (6-अंक)</label>
          <input className="inp-basic pin-input" type="password" maxLength={6} placeholder="• • • • • •" defaultValue="221199" />
          <button className="btn-primary login-button h-14 min-h-0" type="submit">सुरक्षित लॉगिन (Secure Login)</button>
        </form>
        <p className="login-note">केवल अधिकृत DoCA / मंडी बोर्ड कर्मचारियों के लिए</p>
      </main>
  );
}
