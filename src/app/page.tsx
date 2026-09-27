"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bank,
  CalendarBlank,
  CheckCircle,
  Clock,
  Phone,
  TrendUp,
} from "@phosphor-icons/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { DEFAULT_MANDI_ID } from "@/lib/storage-keys";
import type { TokenBoardState } from "@/lib/server/token-store";

const services = [
  {
    icon: CalendarBlank,
    title: "booking" as const,
    description: "bookingDescription" as const,
    tone: "civic",
  },
  {
    icon: TrendUp,
    title: "tracking" as const,
    description: "trackingDescription" as const,
    tone: "ok",
  },
  {
    icon: Bank,
    title: "payment" as const,
    description: "paymentDescription" as const,
    tone: "saffron",
  },
];

const trustStats = [
  { value: "120+", label: "connectedMandis" as const },
  { value: "~40%", label: "waitReduction" as const },
  { value: "10+", label: "availableLanguages" as const },
];

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const numericMatch = value.match(/\d+(?:\.\d+)?/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const endValue = Number(numericMatch[0]);
    const prefix = value.startsWith("~") ? "~" : "";
    const suffix = value.includes("%") ? "%" : value.includes("+") ? "+" : "";
    let frameId = 0;
    const startTime = performance.now();
    const duration = 800;

    const tick = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = endValue * eased;
      setDisplayValue(`${prefix}${Math.round(current)}${suffix}`);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      frameId = window.requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [value]);

  return (
    <div ref={ref} className="trust-stat">
      <strong>{displayValue}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const [liveTokenState, setLiveTokenState] = useState<TokenBoardState | null>(null);

  useEffect(() => {
    let active = true;
    const pollLiveToken = async () => {
      try {
        const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`, { cache: "no-store" });
        if (!response.ok) return;
        const state = await response.json() as TokenBoardState;
        if (active) setLiveTokenState(state);
      } catch {
        if (active) setLiveTokenState(null);
      }
    };

    void pollLiveToken();
    const intervalId = window.setInterval(() => void pollLiveToken(), 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const queueStats = [
    { name: t("officerMandi"), token: "T - 01", waitMinutes: 5, live: true, pendingSetup: false },
    { name: t("gorakhpurMandi"), token: "T - 067", waitMinutes: 9, live: false, pendingSetup: false },
    { name: t("kanpurMandi"), token: "T - 032", waitMinutes: 41, live: false, pendingSetup: false },
  ];
  const mandiIsLive = true;

  return (
    <div className="app-shell">
      <div className="top-gov-bar">
        <div className="gov-left">
          <span className="doca-badge">DOCA {t("govIssue")} #26032</span>
          <span>{t("govMinistry")}</span>
        </div>

        <div className="gov-right">
          <span className="phone-link">
            <span className="phone-icon">
              <Phone size={15} />
            </span>
            080 4728 0994
          </span>
          <LanguageSwitcher />
        </div>
      </div>

      <header className="site-header">
        <div className="nav-container">
          <Link href="/" className="brand" aria-label={t("mandiSetuHome")}>
            <Image
              src="/mandi-setu-logo.svg"
              alt={t("brand")}
              width={62}
              height={46}
              priority
              className="brand-logo"
            />
            <span className="brand-copy">
              <span className="brand-name">{t("brand")}</span>
              <span className="brand-subtitle">{t("brandSubtitle")}</span>
            </span>
          </Link>

          <nav className="nav-links" aria-label={t("mainNavigation")}>
            <Link href="/">{t("home")}</Link>
            <Link href="#services">{t("services")}</Link>
            <Link href="/officer/login">{t("officer")}</Link>
          </nav>

          <div className="header-actions"><Link href="/farmer" className="btn-primary header-button">{t("openApp")}</Link></div>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero" id="hero">
          <div className="hero-copy">
            <h1>
              {t("heroTitle")}
            </h1>

            <p className="hero-subheading">
              {t("heroSubtitle")}
            </p>

            <div className="cta-row">
              <Link href="/farmer" className="btn-primary cta-button">
                {t("farmerApp")}
                <ArrowRight size={18} />
              </Link>

              <Link href="/officer/login" className="btn-secondary cta-button">
                {t("officerPortal")}
              </Link>
            </div>

            <div className="trust-strip">
              {trustStats.map(({ value, label }, index) => (
                <AnimatedStat
                  key={label}
                  value={value}
                  label={t(label)}
                />
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span>{t("liveCentres")}</span>
                <span className={`live-indicator${mandiIsLive ? " is-live" : " is-closed"}`}>
                  <span className={`live-dot${mandiIsLive ? " is-pulsing" : ""}`} />
                  {t("mandiOpen")}
              </span>
            </div>

            {queueStats.map((item) => (
                <div key={item.name} className="queue-row">
                  <span className="queue-name">{item.name}</span>
                  <span className="queue-token" aria-live={item.live ? "polite" : undefined}>
                    {item.token}
                  </span>
                  <span className="queue-wait">
                    <Clock size={16} aria-hidden="true" />
                  {item.waitMinutes} {t("minWait")}
                </span>
              </div>
            ))}
            <div className="panel-footnote">
              {t("sameBoard")}
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <h2>{t("mainServices")}</h2>
          <p>{t("smartFarming")}</p>

          <div className="service-grid">
            {services.map(({ icon: Icon, title, description, tone }) => (
              <article key={title} className="service-card">
                <div className={`service-icon ${tone}`}>
                  <Icon size={26} />
                </div>
                <h3>{t(title)}</h3>
                <p>{t(description)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="credibility-row">
        <span className="credibility-message"><CheckCircle size={18} weight="fill" aria-hidden="true" />{t("govMinistry")}</span>
        <span className="credibility-stat"><strong>120+</strong>{t("connectedMandis")}</span>
      </div>

      <footer className="site-footer">
        <div className="footer-brand">{t("brand")} — SIH 26032</div>
        <div>{t("footer")}</div>
      </footer>
    </div>
  );
}
