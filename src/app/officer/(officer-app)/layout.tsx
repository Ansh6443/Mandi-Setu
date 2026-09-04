"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { House } from "@phosphor-icons/react";

export default function OfficerAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 🔒 सिक्योरिटी गार्ड (Auth Logic)
  useEffect(() => {
    if (window.localStorage.getItem("officer-authenticated") !== "true") {
      router.replace("/officer/login");
      return;
    }
    const frameId = window.requestAnimationFrame(() => setIsAuthenticated(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [router]);

  if (isAuthenticated !== true) {
    return null; // जब तक चेक कर रहा है, खाली स्क्रीन
  }

  return (
    <div className="officer-shell flex min-h-screen flex-col overflow-x-hidden bg-[var(--bg-body)]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-green-900 bg-[#00522c] px-[5%] py-2 text-xs font-semibold text-white">
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded bg-[var(--saffron)] px-3 py-0.5 font-extrabold text-[var(--text-primary)]">DOCA समस्या समाधान #26032</span>
            <span>भारत सरकार | उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/farmer" className="flex h-14 items-center gap-1.5 rounded-xl px-3 font-bold hover:text-green-200">
              <House size={20} weight="regular" /> किसान ऐप देखें
            </Link>
          </div>
      </header>

      <div className="officer-body flex min-h-0 flex-1">
        <Sidebar />
        <div className="officer-content flex min-w-0 flex-1 flex-col overflow-visible">
        <main className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}