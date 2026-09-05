"use client";

import {
  ChartLineUp,
  GearSix,
  Receipt,
  Scales,
  SquaresFour,
  UsersThree,
  WifiHigh,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { label: "डैशबोर्ड", href: "/officer/dashboard", icon: SquaresFour },
  { label: "लाइव कतार", href: "/officer/queue", icon: UsersThree },
  { label: "लाइव तौल", href: "/officer/live-weighment", icon: Scales },
  { label: "तौल एवं भुगतान", href: "/officer/weighment", icon: Receipt },
  { label: "मंडी सेटिंग्स", href: "/officer/settings", icon: GearSix },
  { label: "रिपोर्ट", href: "/officer/reports", icon: ChartLineUp },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    try {
      window.localStorage.removeItem("officer-authenticated");
    } catch {
      // Continue to the login route if browser storage is unavailable.
    }
    router.replace("/officer/login");
  }

  return (
    <aside className="officer-sidebar flex min-h-screen w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-white px-4 pt-10 pb-6">
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-2 pb-[18px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[var(--civic)] font-bold text-white">
          अ
        </div>
        <div>
          <p className="sidebar-brand-title text-base font-bold text-[var(--text-primary)]">अधिकारी कंसोल</p>
          <p className="text-xs font-medium text-[var(--text-secondary)]">Officer Console v1.0</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-[var(--bg-body)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[var(--civic)] text-sm font-bold text-white">
            SP
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">सुनील पाटील</p>
            <p className="text-xs font-medium text-[var(--text-secondary)]">आज़ादपुर मंडी</p>
          </div>
        </div>
      </div>

      <nav aria-label="मुख्य मेनू" className="officer-sidebar-nav mt-6 flex flex-col gap-2">
        {menuItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
              pathname === href
                ? "border-l-2 border-[var(--primary-600)] bg-[var(--primary-50)] text-[var(--primary-700)]"
                : "border-l-2 border-transparent text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            <Icon size={20} weight="regular" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="mt-8 flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--success)_10%,transparent)] p-3 text-sm font-medium text-[var(--success)]">
          <span className="h-[7px] w-[7px] rounded-full bg-[var(--success)] animate-pulse" aria-hidden="true" />
          <WifiHigh size={20} weight="regular" aria-hidden="true" />
          <span>मंडी खुली है — लाइव अपडेट सक्रिय</span>
        </div>
        <button type="button" onClick={handleLogout} className="mt-4 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold text-[#C94A4A] transition-all duration-200 active:scale-95">
          <SignOut size={20} weight="regular" aria-hidden="true" />
          लॉग आउट
        </button>
      </div>
    </aside>
  );
}
