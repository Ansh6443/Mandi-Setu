import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Landmark,
  Leaf,
  Phone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const queueStats = [
  { name: "आज़ादपुर मंडी", token: "T - 114", wait: "18 min avg wait" },
  { name: "गाज़ीपुर मंडी", token: "T - 067", wait: "9 min avg wait" },
  { name: "लातूर (NCCF)", token: "T - 032", wait: "41 min avg wait" },
];

const services = [
  {
    icon: CalendarDays,
    title: "स्मार्ट स्लॉट बुकिंग",
    description:
      "घर बैठे मंडी में अपनी फसल बेचने का दिन और समय चुनें। भीड़ से बचें और अपना समय बचाएं।",
    tone: "civic",
  },
  {
    icon: TrendingUp,
    title: "लाइव स्टेटस ट्रैकिंग",
    description:
      "मंडी गेट-पास से लेकर तौल और गुणवत्ता चेक तक हर कदम की लाइव अपडेट पाएं।",
    tone: "ok",
  },
  {
    icon: Landmark,
    title: "DBT व डिजिटल J-Form",
    description:
      "नीलामी के तुरंत बाद सिस्टम जनरेटेड J-Form और सीधा बैंक खाते में भुगतान।",
    tone: "saffron",
  },
];

export default function HomePage() {
  return (
    <div className="app-shell">
      <div className="top-gov-bar">
        <div className="gov-left">
          <span className="doca-badge">DOCA समस्या समाधान #26032</span>
          <span>भारत सरकार | उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय</span>
        </div>

        <div className="gov-right">
          <span className="voice-link">
            <Sparkles size={15} />
            बोलकर सुनें
          </span>
          <span className="phone-link">
            <Phone size={15} />
            1800-180-1551
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
              <div className="brand-name">किसान साथी</div>
              <div className="brand-subtitle">स्मार्ट मंडी प्रोक्योरमेंट पोर्टल</div>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/">होम</Link>
            <Link href="#services">सुविधाएं</Link>
            <Link href="/officer/login">अधिकारी</Link>
          </nav>

          <Link href="/farmer" className="btn-primary header-button">
            लॉगिन / ऐप खोलें
          </Link>
        </div>
      </header>

      <main className="page-shell">
        <section className="hero" id="hero">
          <div className="hero-copy">
            <div className="hero-badge">
              PS 26032 • Ministry of Consumer Affairs, Food & Public Distribution
            </div>

            <h1>
              कतारें चलेंगी.
              <br />
              किसान की <u>उलझन रुकेगी।</u>
            </h1>

            <p>
              सरकारी मंडियों में एमएसपी (MSP) पर फसल बेचने वाले किसान अब घंटों इंतज़ार नहीं
              करेंगे। &apos;किसान साथी&apos; मौजूदा प्रोक्योरमेंट सिस्टम को बदलता नहीं है, बल्कि उसमें
              पारदर्शिता, रफ़्तार और भरोसे की एक स्मार्ट लेयर जोड़ता है।
            </p>

            <div className="cta-row">
              <Link href="/farmer" className="btn-primary cta-button">
                किसान ऐप खोलें (Farmer App)
                <ArrowRight size={18} />
              </Link>

              <Link href="/officer/login" className="btn-secondary cta-button">
                मंडी अधिकारी व्यू (Officer Portal)
              </Link>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span>LIVE — TODAY&apos;S CENTRES</span>
              <span className="live-indicator">
                <span className="live-dot" />
                updating
              </span>
            </div>

            {queueStats.map((item) => (
              <div key={item.name} className="queue-row">
                <span className="queue-name">{item.name}</span>
                <span className="queue-token">{item.token}</span>
                <span className="queue-wait">{item.wait}</span>
              </div>
            ))}

            <div className="panel-footnote">
              Same board, three ways to read it: PWA App, SMS, or the physical display at the gate.
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <h2>हमारी मुख्य सुविधाएं</h2>
          <p>स्मार्ट खेती, स्मार्ट व्यापार</p>

          <div className="service-grid">
            {services.map(({ icon: Icon, title, description, tone }) => (
              <article key={title} className="service-card">
                <div className={`service-icon ${tone}`}>
                  <Icon size={26} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">किसान साथी — SIH 26032</div>
        <div>© 2026 भारत सरकार (प्रोटोटाइप)। सभी अधिकार सुरक्षित।</div>
      </footer>
    </div>
  );
}
