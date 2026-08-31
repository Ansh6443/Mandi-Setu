"use client";

import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, CreditCard, Home, Leaf, LogOut, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type AuthStep = "mobile" | "mobileOtp" | "identity" | "identityOtp";
type ViewName = "home" | "book" | "status" | "payment" | "profile";
type CropKey = "onion" | "wheat" | "potato" | "tomato" | "soybean";

const cropCatalog: Record<CropKey, string> = {
  onion: "प्याज",
  wheat: "गेहूँ",
  potato: "आलू",
  tomato: "टमाटर",
  soybean: "सोयाबीन",
};

const dateOptions = [
  { label: "आज", day: "27", month: "अगस्त" },
  { label: "कल", day: "28", month: "अगस्त" },
  { label: "परसों", day: "29", month: "अगस्त" },
  { label: "सोम", day: "30", month: "अगस्त" },
  { label: "मंगल", day: "31", month: "अगस्त" },
  { label: "बुध", day: "01", month: "सितंबर" },
  { label: "गुरु", day: "02", month: "सितंबर" },
];

const timeOptions = [
  "सुबह 8:00 - 10:00",
  "सुबह 10:00 - 12:00",
  "दोपहर 12:00 - 2:00",
  "दोपहर 2:00 - 4:00",
  "शाम 4:00 - 6:00",
  "शाम 6:00 - 8:00",
];

const marketRates = [
  { crop: "प्याज", emoji: "🧅", price: "₹1,850", change: "+2%", up: true },
  { crop: "गेहूँ", emoji: "🌾", price: "₹2,275", change: "-1%", up: false },
  { crop: "आलू", emoji: "🥔", price: "₹1,200", change: "+1%", up: true },
  { crop: "टमाटर", emoji: "🍅", price: "₹900", change: "-3%", up: false },
  { crop: "सोयाबीन", emoji: "🌱", price: "₹4,700", change: "+1%", up: true },
];

const statusSteps = [
  "रजिस्टर्ड",
  "मंडी चेक-इन",
  "क्वालिटी जाँच और वज़न",
  "नीलामी / स्वीकृत",
  "DBT भुगतान",
];

export default function KisanApp() {
  const [authStep, setAuthStep] = useState<AuthStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [mobileConsent, setMobileConsent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"aadhaar" | "farmer">("aadhaar");
  const [aadhaar, setAadhaar] = useState("");
  const [farmerId, setFarmerId] = useState("MH-26032-4812");
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [farmerConsent, setFarmerConsent] = useState(false);
  const [identityOtp, setIdentityOtp] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewName>("home");
  const [bookingDate, setBookingDate] = useState("27 अगस्त");
  const [bookingTime, setBookingTime] = useState("सुबह 8:00 - 10:00");
  const [cropQuantities, setCropQuantities] = useState<Record<string, number>>({ onion: 50 });
  const [customCrop, setCustomCrop] = useState("");
  const [customCropQty, setCustomCropQty] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const validMobile = mobile.replace(/\D/g, "").length === 10;
  const validOtp = mobileOtp.replace(/\D/g, "").length === 6;
  const validAadhaar = aadhaar.replace(/\D/g, "").length === 12;
  const validFarmerId = farmerId.trim().length > 5;
  const validIdentityOtp = identityOtp.replace(/\D/g, "").length === 6;

  const bookingSummary = useMemo(() => {
    const entries = Object.entries(cropQuantities).map(([key, qty]) => ({
      name: cropCatalog[key as CropKey] ?? key,
      qty,
    }));

    if (customCrop.trim() && customCropQty.trim()) {
      entries.push({ name: customCrop.trim(), qty: Number(customCropQty) || 0 });
    }

    return entries;
  }, [cropQuantities, customCrop, customCropQty]);

  const sendMobileOtp = () => {
    if (!validMobile || !mobileConsent) return;
    setAuthStep("mobileOtp");
  };

  const verifyMobileOtp = () => {
    if (!validOtp) return;
    setAuthStep("identity");
  };

  const sendIdentityOtp = () => {
    if (selectedMethod === "aadhaar" && !(validAadhaar && aadhaarConsent)) return;
    if (selectedMethod === "farmer" && !(validFarmerId && farmerConsent)) return;
    setAuthStep("identityOtp");
  };

  const verifyIdentityOtp = () => {
    if (!validIdentityOtp) return;
    setIsLoggedIn(true);
    setCurrentView("home");
  };

  const toggleCrop = (key: CropKey) => {
    setCropQuantities((prev) => {
      const next = { ...prev };
      if (key in next) {
        delete next[key];
      } else {
        next[key] = 50;
      }
      return next;
    });
  };

  const doBooking = () => {
    if (bookingSummary.length === 0) return;
    setBookingDone(true);
    setCurrentView("status");
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark small">
              <Leaf size={18} />
            </div>
            <div>
              <div className="brand-name">किसान साथी</div>
              <div className="brand-subtitle auth-subtitle">मंडी बुकिंग और भुगतान</div>
            </div>
          </div>

          {authStep === "mobile" && (
            <div className="auth-panel">
              <div className="panel-badge">
                <span className="status-dot" />
                मोबाइल सत्यापन
              </div>
              <h2>मोबाइल नंबर से शुरू करें</h2>
              <p>आपका पंजीकृत मोबाइल नंबर सुरक्षित रूप से सत्यापन के लिए उपयोग किया जाएगा।</p>

              <label className="field-label">मोबाइल नंबर</label>
              <div className="input-row">
                <span className="country-code">+91</span>
                <input
                  className="input-control"
                  value={mobile}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={mobileConsent} onChange={(e) => setMobileConsent(e.target.checked)} />
                <span>मैं OTP सत्यापन के लिए सहमत हूँ।</span>
              </label>

              <button className="primary-btn full" disabled={!validMobile || !mobileConsent} onClick={sendMobileOtp}>
                मोबाइल OTP भेजें
              </button>
            </div>
          )}

          {authStep === "mobileOtp" && (
            <div className="auth-panel">
              <button type="button" className="back-link" onClick={() => setAuthStep("mobile")}>
                ← मोबाइल नंबर बदलें
              </button>
              <div className="otp-icon">✓</div>
              <h2>मोबाइल OTP सत्यापित करें</h2>
              <p>OTP आपके मोबाइल नंबर पर भेजा गया है।</p>

              <label className="field-label">6 अंकों का OTP</label>
              <input
                className="input-control"
                value={mobileOtp}
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <button className="primary-btn full" disabled={!validOtp} onClick={verifyMobileOtp}>
                मोबाइल सत्यापित करें
              </button>
            </div>
          )}

          {authStep === "identity" && (
            <div className="auth-panel">
              <h2>अब पहचान चुनें</h2>
              <p>मोबाइल सत्यापन सफल रहा। अपनी पहचान का तरीका चुनें।</p>

              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice-card ${selectedMethod === "aadhaar" ? "active" : ""}`}
                  onClick={() => setSelectedMethod("aadhaar")}
                >
                  <span className="choice-icon">▣</span>
                  <span>
                    <b>आधार कार्ड</b>
                    <small>आधार नंबर + OTP</small>
                  </span>
                  <span className="choice-check">✓</span>
                </button>

                <button
                  type="button"
                  className={`choice-card ${selectedMethod === "farmer" ? "active" : ""}`}
                  onClick={() => setSelectedMethod("farmer")}
                >
                  <span className="choice-icon">♙</span>
                  <span>
                    <b>किसान ID</b>
                    <small>किसान ID से सत्यापन</small>
                  </span>
                  <span className="choice-check">✓</span>
                </button>
              </div>

              {selectedMethod === "aadhaar" ? (
                <div className="identity-box">
                  <label className="field-label">आधार नंबर</label>
                  <input
                    className="input-control"
                    value={aadhaar}
                    maxLength={14}
                    placeholder="XXXX XXXX XXXX"
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1 ").trim())}
                  />

                  <label className="checkbox-row">
                    <input type="checkbox" checked={aadhaarConsent} onChange={(e) => setAadhaarConsent(e.target.checked)} />
                    <span>मैं आधार आधारित सत्यापन के लिए सहमत हूँ।</span>
                  </label>

                  <button className="primary-btn full" disabled={!validAadhaar || !aadhaarConsent} onClick={sendIdentityOtp}>
                    आधार OTP भेजें
                  </button>
                </div>
              ) : (
                <div className="identity-box">
                  <label className="field-label">किसान ID</label>
                  <input
                    className="input-control"
                    value={farmerId}
                    placeholder="जैसे — MH-26032-4812"
                    onChange={(e) => setFarmerId(e.target.value)}
                  />

                  <label className="checkbox-row">
                    <input type="checkbox" checked={farmerConsent} onChange={(e) => setFarmerConsent(e.target.checked)} />
                    <span>मैं अपनी जानकारी साझा करने और सत्यापन के लिए सहमत हूँ।</span>
                  </label>

                  <button className="primary-btn full" disabled={!validFarmerId || !farmerConsent} onClick={sendIdentityOtp}>
                    OTP भेजें
                  </button>
                </div>
              )}
            </div>
          )}

          {authStep === "identityOtp" && (
            <div className="auth-panel">
              <button type="button" className="back-link" onClick={() => setAuthStep("identity")}>
                ← पहचान बदलें
              </button>
              <div className="otp-icon">✓</div>
              <h2>{selectedMethod === "aadhaar" ? "आधार OTP से सत्यापन करें" : "किसान ID OTP से सत्यापन करें"}</h2>
              <p>OTP आपके पंजीकृत मोबाइल नंबर पर भेजा गया है।</p>

              <label className="field-label">6 अंकों का OTP</label>
              <input
                className="input-control"
                value={identityOtp}
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                onChange={(e) => setIdentityOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <button className="primary-btn full" disabled={!validIdentityOtp} onClick={verifyIdentityOtp}>
                OTP सत्यापित करें
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-app-shell">
      <header className="app-topbar">
        <div className="topbar-left">
          <div className="brand-mark small">
            <Leaf size={18} />
          </div>
          <div>
            <div className="brand-name">राम कुमार</div>
            <div className="brand-subtitle">MH-26032-4812</div>
          </div>
        </div>

        <button type="button" className="notification-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
      </header>

      <main className="app-main">
        {currentView === "home" && (
          <>
            <div className="welcome-row">
              <div>
                <div className="eyebrow">किसान साथी</div>
                <h1>नमस्कार, राम कुमार</h1>
                <p>आज की मंडी गतिविधि और बुकिंग स्थिति देखें।</p>
              </div>
              <span className="live-pill">
                <span className="status-dot" />
                Live
              </span>
            </div>

            <div className="rate-header">
              <h2>आज का भाव</h2>
              <span>प्रति क्विंटल</span>
            </div>

            <div className="rate-grid">
              {marketRates.map((rate) => (
                <div key={rate.crop} className="rate-card">
                  <div className="rate-emoji">{rate.emoji}</div>
                  <div className="rate-price">{rate.price}</div>
                  <div className={`rate-change ${rate.up ? "up" : "down"}`}>{rate.up ? "▲" : "▼"} {rate.change}</div>
                </div>
              ))}
            </div>

            {!bookingDone ? (
              <div className="empty-card">
                <div className="empty-badge">● अभी कोई सक्रिय बुकिंग नहीं</div>
                <div className="empty-icon">🌾</div>
                <h3>कोई सक्रिय बुकिंग नहीं</h3>
                <p>अपनी फसल बेचने के लिए नज़दीकी मंडी में सुविधाजनक समय का स्लॉट अभी बुक करें।</p>
                <button className="primary-btn" onClick={() => setCurrentView("book")}>नया स्लॉट बुक करें</button>
              </div>
            ) : (
              <div className="active-card">
                <div>
                  <div className="active-meta">📅 अगली बुकिंग: {bookingDate} • {bookingTime}</div>
                  <div className="active-title">आज़ादपुर मंडी</div>
                </div>
                <div className="token-box">
                  <strong>47</strong>
                  <span>टोकन</span>
                </div>
              </div>
            )}

            <div className="section-header">
              <h2>त्वरित सेवाएं</h2>
              <span>एक टैप में शुरू करें</span>
            </div>

            <div className="services-grid">
              <button type="button" className="service-tile" onClick={() => setCurrentView("book")}>
                <span className="tile-icon civic"><CalendarDays size={18} /></span>
                <span>
                  <strong>स्लॉट बुक करें</strong>
                  <small>मंडी और तारीख चुनें</small>
                </span>
                <ChevronRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => setCurrentView("status")}>
                <span className="tile-icon ok"><ShieldCheck size={18} /></span>
                <span>
                  <strong>लाइव स्टेटस</strong>
                  <small>टोकन और कतार देखें</small>
                </span>
                <ChevronRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => setCurrentView("payment")}>
                <span className="tile-icon saffron"><CreditCard size={18} /></span>
                <span>
                  <strong>भुगतान ट्रैक</strong>
                  <small>J-Form और DBT देखें</small>
                </span>
                <ChevronRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => window.location.href = "tel:18001801551"}>
                <span className="tile-icon danger"><Phone size={18} /></span>
                <span>
                  <strong>सहायता</strong>
                  <small>कॉल करके मदद पाएं</small>
                </span>
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {currentView === "book" && (
          <div className="panel-card">
            <h2 className="panel-title">स्लॉट बुक करें</h2>

            <label className="field-label">1. मंडी चुनें</label>
            <select className="select-box" defaultValue="azadpur">
              <option value="azadpur">आज़ादपुर मंडी (🟢 47 खाली)</option>
              <option value="ghazipur">गाज़ीपुर मंडी (🟡 12 स्लॉट खाली)</option>
            </select>

            <label className="field-label">2. फसल चुनें और मात्रा दर्ज करें</label>
            <div className="crop-grid">
              {(Object.keys(cropCatalog) as CropKey[]).map((key) => {
                const isSelected = key in cropQuantities;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`crop-btn ${isSelected ? "active" : ""}`}
                    onClick={() => toggleCrop(key)}
                  >
                    {key === "onion" && "🧅"}
                    {key === "wheat" && "🌾"}
                    {key === "potato" && "🥔"}
                    {key === "tomato" && "🍅"}
                    {key === "soybean" && "🌱"}
                    {` ${cropCatalog[key]}`}
                  </button>
                );
              })}
              <button type="button" className={`crop-btn ${customCrop ? "active" : ""}`} onClick={() => setCustomCrop(customCrop || "मक्का")}>
                ➕ अन्य फसल
              </button>
            </div>

            {customCrop && (
              <div className="custom-crop-box">
                <label className="field-label">अपनी फसल का नाम लिखें</label>
                <input className="input-control" value={customCrop} onChange={(e) => setCustomCrop(e.target.value)} placeholder="जैसे: मक्का, बाजरा, कपास..." />
                <div className="qty-row">
                  <input
                    className="input-control short"
                    value={customCropQty}
                    inputMode="numeric"
                    placeholder="0"
                    onChange={(e) => setCustomCropQty(e.target.value.replace(/\D/g, ""))}
                  />
                  <span>क्विंटल</span>
                </div>
              </div>
            )}

            {bookingSummary.length > 0 && (
              <div className="selected-list">
                {bookingSummary.map((entry) => (
                  <div key={entry.name} className="selected-item">
                    <span>✅ {entry.name}</span>
                    <div className="qty-row">
                      <input
                        className="input-control short"
                        value={entry.qty}
                        inputMode="numeric"
                        onChange={(e) => {
                          const val = Number(e.target.value.replace(/\D/g, ""));
                          if (entry.name === customCrop.trim()) {
                            setCustomCropQty(String(val || ""));
                            return;
                          }
                          const key = Object.keys(cropCatalog).find((cropKey) => cropCatalog[cropKey as CropKey] === entry.name) as CropKey | undefined;
                          if (!key) return;
                          setCropQuantities((prev) => ({ ...prev, [key]: val || 0 }));
                        }}
                      />
                      <span>क्विंटल</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="field-label">3. तारीख चुनें (आगामी 7 दिन)</label>
            <div className="date-scroll">
              {dateOptions.map((item) => (
                <button
                  key={`${item.day}-${item.month}`}
                  type="button"
                  className={`date-card ${bookingDate === `${item.day} ${item.month}` ? "active" : ""}`}
                  onClick={() => setBookingDate(`${item.day} ${item.month}`)}
                >
                  <span>{item.label}</span>
                  <strong>{item.day}</strong>
                  <small>{item.month}</small>
                </button>
              ))}
            </div>

            <label className="field-label">4. समय चुनें</label>
            <div className="time-grid">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`time-card ${bookingTime === time ? "active" : ""}`}
                  onClick={() => setBookingTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>

            <button className="primary-btn full" onClick={doBooking}>सुरक्षित बुक करें (Book Now)</button>
          </div>
        )}

        {currentView === "status" && (
          <div className="panel-card">
            <h2 className="panel-title">लाइव ट्रैकिंग</h2>
            <div className="status-banner">
              <div>
                <small>LIVE GATE #2</small>
                <strong>Token #47</strong>
              </div>
              <div>
                <small>अनुमानित प्रतीक्षा</small>
                <strong>~18 Mins</strong>
              </div>
            </div>

            <div className="timeline">
              {statusSteps.map((step, index) => (
                <div key={step} className={`timeline-item ${index === 0 ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <div>
                    <strong>{step}</strong>
                    {index === 0 && <p>स्लॉट कन्फर्म। कृपया तय समय पर मंडी पहुँचें।</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "payment" && (
          <div className="panel-card">
            <div className="payment-banner">सभी भुगतान PFMS/DBT के माध्यम से सीधे बैंक खाते में भेजे जाते हैं।</div>
            <div className="payment-header">
              <div>
                <small>प्याज (50.5 Q)</small>
                <h2>₹91,575</h2>
                <span className="success-tag">✅ भुगतान सफल</span>
              </div>
              <button type="button" className="icon-btn" aria-label="Speak">
                🔊
              </button>
            </div>

            <div className="timeline compact">
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>स्वीकृत</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>एस्क्रो</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>खाते में जमा</strong></div></div>
            </div>

            <button type="button" className="secondary-btn full" onClick={() => setCurrentView("home")}>डिजिटल J-Form देखें</button>
          </div>
        )}

        {currentView === "profile" && (
          <div className="panel-card profile-card">
            <div className="profile-top">
              <div className="avatar">RK</div>
              <div>
                <h2>राम कुमार <span className="verified-pill">✓ Verified</span></h2>
                <div className="profile-id">FARMER ID: MH-26032-4812</div>
              </div>
            </div>

            <div className="profile-location">
              <MapPin size={16} />
              पिंपलगांव बसवंत, नासिक (महाराष्ट्र)
            </div>

            <div className="security-box">
              <ShieldCheck size={18} />
              <div>
                <strong>NPCI / बैंक लिंक सक्रिय</strong>
                <small>State Bank of India (SBI) ****4521</small>
              </div>
            </div>

            <button type="button" className="danger-btn" onClick={() => setIsLoggedIn(false)}>
              <LogOut size={18} />
              खाता बंद करें (Logout)
            </button>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <button type="button" className={currentView === "home" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("home")}>
          <Home size={18} />
          <span>होम</span>
        </button>
        <button type="button" className={currentView === "book" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("book")}>
          <CalendarDays size={18} />
          <span>बुकिंग</span>
        </button>
        <button type="button" className={currentView === "status" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("status")}>
          <Check size={18} />
          <span>स्टेटस</span>
        </button>
        <button type="button" className={currentView === "payment" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("payment")}>
          <CreditCard size={18} />
          <span>भुगतान</span>
        </button>
        <button type="button" className={currentView === "profile" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("profile")}>
          <UserRound size={18} />
          <span>प्रोफाइल</span>
        </button>
      </nav>

      <div className="app-footer">
        <Link href="/">← Home</Link>
      </div>
    </div>
  );
}
