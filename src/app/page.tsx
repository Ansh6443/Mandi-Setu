"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bank,
  CalendarBlank,
  Leaf,
  Phone,
  Sparkle,
  TrendUp,
} from "@phosphor-icons/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

const queueStats = [
  { name: "लखनऊ दुबग्गा मंडी", token: "T - 114", waitMinutes: 18 },
  { name: "गोरखपुर मंडी", token: "T - 067", waitMinutes: 9 },
  { name: "कानपुर नवाबगंज मंडी", token: "T - 032", waitMinutes: 41 },
];

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
  { value: "3+", label: "availableLanguages" as const },
];

export default function HomePage() {
  const { language, t } = useLanguage();

  return (
    <div className="app-shell">
      <div className="top-gov-bar">
        <div className="gov-left">
          <span className="doca-badge">DOCA {t("language") === "Language" ? "Issue Resolution" : "समस्या समाधान"} #26032</span>
          <span>{t("language") === "Language" ? "Government of India | Ministry of Consumer Affairs, Food & Public Distribution" : "भारत सरकार | उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय"}</span>
        </div>

        <div className="gov-right">
          <span className="voice-link">
            <Sparkle size={15} />
            {t("speak")}
          </span>
          <span className="phone-link">
            <Phone size={15} />
            080 4749 5548
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="nav-container">
          <Link href="/" className="brand" aria-label="Kisan Setu home">
            <div className="brand-mark">
              <Leaf size={20} />
            </div>
            <div>
              <div className="brand-name">{t("brand")}</div>
              <div className="brand-subtitle">{t("brandSubtitle")}</div>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/">{t("home")}</Link>
            <Link href="#services">{t("services")}</Link>
            <Link href="/officer/login">{t("officer")}</Link>
          </nav>

          <div className="header-actions"><LanguageSwitcher /><Link href="/farmer" className="btn-primary header-button">{t("openApp")}</Link></div>
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

            <div className="trust-strip">
              {trustStats.map(({ value, label }, index) => (
                <div key={label} className={`trust-stat${index > 0 ? " with-divider" : ""}`}>
                  <strong>{value}</strong>
                  <span>{t(label)}</span>
                </div>
              ))}
            </div>

            <div className="cta-row">
              <Link href="/farmer" className="btn-primary cta-button">
                {t("farmerApp")}
                <ArrowRight size={18} />
              </Link>

              <Link href="/officer/login" className="btn-secondary cta-button">
                {t("officerPortal")}
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span>{t("liveCentres")}</span>
              <span className="live-indicator">
                <span className="live-dot" />
                {t("updating")}
              </span>
            </div>

            {queueStats.map((item) => (
  <div key={item.name} className="queue-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span className="queue-name" style={{ flex: 1 }}>{item.name}</span>
    <span className="queue-token" style={{ flex: 1, textAlign: 'center' }}>{item.token}</span>
    <span className="queue-wait" style={{ flex: 1, textAlign: 'right' }}>
      {language === "hi" ? `${item.waitMinutes} मिनट औसत प्रतीक्षा` : `${item.waitMinutes} min avg wait`}
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

      <footer className="site-footer">
        <div className="footer-brand">किसान साथी — SIH 26032</div>
        <div>{t("footer")}</div>
      </footer>
    </div>
  );
}
