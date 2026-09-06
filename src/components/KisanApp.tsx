"use client";

import { Bell, CalendarBlank, Check, CaretRight, CreditCard, House, Leaf, LockKey, MapPin, Phone, Plus, ShieldCheck, SignOut, SpeakerHigh, CheckCircle, User } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { DEMO_FARMER_ID, receiptStorageKey } from "@/lib/storage-keys";

type AuthStep = "mobile" | "mobileOtp" | "identity" | "identityOtp";
type ViewName = "home" | "book" | "status" | "payment" | "profile" | "receipt" | "identity" | "identityOtp";
type CropKey = "onion" | "wheat" | "potato" | "tomato" | "soybean";

const cropCatalog: Record<CropKey, string> = {
  onion: "प्याज",
  wheat: "गेहूँ",
  potato: "आलू",
  tomato: "टमाटर",
  soybean: "सोयाबीन",
};

const cropCatalogEnglish: Record<CropKey, string> = {
  onion: "Onion",
  wheat: "Wheat",
  potato: "Potato",
  tomato: "Tomato",
  soybean: "Soybean",
};

const cropIcons: Record<CropKey, string> = {
  onion: "🧅",
  wheat: "🌾",
  potato: "🥔",
  tomato: "🍅",
  soybean: "🫘",
};

const dateOptions = [
  { label: "आज", english: "Today", day: "27", month: "अगस्त", englishMonth: "August" },
  { label: "कल", english: "Tomorrow", day: "28", month: "अगस्त", englishMonth: "August" },
  { label: "परसों", english: "Day after", day: "29", month: "अगस्त", englishMonth: "August" },
  { label: "सोम", english: "Mon", day: "30", month: "अगस्त", englishMonth: "August" },
  { label: "मंगल", english: "Tue", day: "31", month: "अगस्त", englishMonth: "August" },
  { label: "बुध", english: "Wed", day: "01", month: "सितंबर", englishMonth: "September" },
  { label: "गुरु", english: "Thu", day: "02", month: "सितंबर", englishMonth: "September" },
];

const timeOptions = [
  "सुबह 8:00 - 10:00",
  "सुबह 10:00 - 12:00",
  "दोपहर 12:00 - 2:00",
  "दोपहर 2:00 - 4:00",
  "शाम 4:00 - 6:00",
  "शाम 6:00 - 8:00",
];

const englishTimeOptions = [
  "8:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM", "6:00 PM - 8:00 PM",
];

const marketRates = [
  { key: "onion" as CropKey, crop: "प्याज", price: "₹1,850", change: "+2%", up: true },
  { key: "wheat" as CropKey, crop: "गेहूँ", price: "₹2,275", change: "-1%", up: false },
  { key: "potato" as CropKey, crop: "आलू", price: "₹1,200", change: "+1%", up: true },
  { key: "tomato" as CropKey, crop: "टमाटर", price: "₹900", change: "-3%", up: false },
  { key: "soybean" as CropKey, crop: "सोयाबीन", price: "₹4,700", change: "+1%", up: true },
];

const statusSteps = ["registered", "checkIn", "qualityWeight", "auctionApproved", "dbtPayment"] as const;

export default function KisanApp() {
  const { language, t } = useLanguage();
  const [authStep, setAuthStep] = useState<AuthStep>("mobile");
  const [mobile, setMobile] = useState("");
  const [mobileConsent, setMobileConsent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<"aadhaar" | "farmer">("aadhaar");
  const [aadhaar, setAadhaar] = useState("");
  const [farmerId, setFarmerId] = useState(DEMO_FARMER_ID);
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
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // यह identifier officer के farmer.bookingId से बिल्कुल समान होना MUST है, तभी receipt मिल पाएगी।
  const receiptKey = receiptStorageKey(farmerId);

  useEffect(() => {
    const readReceiptPhoto = (storedValue: string | null) => {
      try {
        const receipt = storedValue ? JSON.parse(storedValue) as { photo?: string } : null;
        setReceiptPhoto(receipt?.photo ?? null);
      } catch {
        setReceiptPhoto(null);
      }
    };

    // 화면을 새로 열거나 새로고침해도 현재 किसान की saved receipt पढ़ी जाएगी।
    if (currentView === "receipt") readReceiptPhoto(window.localStorage.getItem(receiptKey));
    const handleReceiptStorage = (event: StorageEvent) => {
      // केवल इसी किसान की key बदलने पर J-Form की फोटो update होगी।
      if (event.key === receiptKey) readReceiptPhoto(event.newValue);
    };
    window.addEventListener("storage", handleReceiptStorage);

    return () => {
      window.removeEventListener("storage", handleReceiptStorage);
    };
  }, [currentView, receiptKey]);

  const validMobile = mobile.replace(/\D/g, "").length === 10;
  const validOtp = mobileOtp.replace(/\D/g, "").length === 6;
  const validAadhaar = aadhaar.replace(/\D/g, "").length === 12;
  const validFarmerId = farmerId.trim().length > 5;
  const validIdentityOtp = identityOtp.replace(/\D/g, "").length === 6;

  const openReceipt = () => {
    // openReceipt केवल scoped key पढ़ता है; यह कभी localStorage clear नहीं करता।
    setReceiptPhoto(null);
    try {
      const storedReceipt = window.localStorage.getItem(receiptKey);
      if (storedReceipt) {
        const receipt = JSON.parse(storedReceipt) as { photo?: string };
        setReceiptPhoto(receipt.photo ?? null);
      }
    } catch {
      setReceiptPhoto(null);
    }
    setCurrentView("receipt");
  };

  const speakReceipt = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const announcement = new SpeechSynthesisUtterance(t("paymentComplete"));
    announcement.lang = language === "en" ? "en-IN" : `${language}-IN`;
    announcement.rate = 0.9;
    announcement.onstart = () => setIsSpeaking(true);
    announcement.onend = () => setIsSpeaking(false);
    announcement.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(announcement);
  };

  const bookingSummary = useMemo(() => {
    const entries = Object.entries(cropQuantities).map(([key, qty]) => ({
      name: language === "en" ? cropCatalogEnglish[key as CropKey] ?? key : cropCatalog[key as CropKey] ?? key,
      qty,
    }));

    if (customCrop.trim() && customCropQty.trim()) {
      entries.push({ name: customCrop.trim(), qty: Number(customCropQty) || 0 });
    }

    return entries;
  }, [cropQuantities, customCrop, customCropQty, language]);

  const sendMobileOtp = () => {
    if (!validMobile || !mobileConsent) return;
    setAuthStep("mobileOtp");
  };

  const verifyMobileOtp = () => {
    if (!validOtp) return;
    setIsLoggedIn(true);
    setCurrentView("home");
  };

  const sendIdentityOtp = () => {
    if (selectedMethod === "aadhaar" && !(validAadhaar && aadhaarConsent)) return;
    if (selectedMethod === "farmer" && !(validFarmerId && farmerConsent)) return;
    setCurrentView("identityOtp");
  };

  const verifyIdentityOtp = () => {
    if (!validIdentityOtp) return;
    setIsLoggedIn(true);
    setCurrentView("status");
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
    setCurrentView("identity");
  };

  const viewTitle = currentView === "book"
    ? t("bookSlotTitle")
    : currentView === "status"
      ? t("liveTracking")
      : currentView === "payment"
        ? t("payments")
        : currentView === "profile"
          ? t("profile")
          : currentView === "receipt"
            ? t("digitalJForm")
            : currentView === "identity"
              ? t("aadhaarKyc")
              : currentView === "identityOtp"
                ? t("verifyAadhaarOtp")
                : "";

  const goBack = () => {
    const previousView: Partial<Record<ViewName, ViewName>> = {
      book: "home",
      status: "home",
      payment: "home",
      profile: "home",
      receipt: "payment",
      identity: "book",
      identityOtp: "identity",
    };
    const destination = previousView[currentView];
    if (destination) setCurrentView(destination);
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
              <div className="brand-name">{t("brand")}</div>
              <div className="brand-subtitle auth-subtitle">{t("farmerAuthSubtitle")}</div>
            </div>
          </div>

          {authStep === "mobile" && (
            <div className="auth-panel">
              <div className="panel-badge">
                <span className="status-dot" />
                {t("mobileVerification")}
              </div>
              <h2>{t("startWithMobile")}</h2>
              <p>{t("mobileDescription")}</p>

              <label className="field-label">{t("mobileNumber")}</label>
              <div className="input-row phone-input-row">
                <span className="country-code">+91</span>
                <div className="phone-input-wrap">
                  <input
                    className="input-control"
                    value={mobile}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("mobilePlaceholder")}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  {validMobile && <Check aria-label={t("validNumber")} className="phone-valid-icon" size={20} weight="bold" />}
                </div>
              </div>

              <p className="phone-trust"><LockKey size={15} weight="regular" aria-hidden="true" />{t("phoneTrust")}</p>

              <label className="checkbox-row">
                <input type="checkbox" checked={mobileConsent} onChange={(e) => setMobileConsent(e.target.checked)} />
                <span>{t("otpConsent")}</span>
              </label>

              <button type="button" className="primary-btn full" disabled={!validMobile || !mobileConsent} onClick={sendMobileOtp}>
                {t("sendOtp")}
              </button>
            </div>
          )}

          {authStep === "mobileOtp" && (
            <div className="auth-panel">
              <button type="button" className="back-link" onClick={() => setAuthStep("mobile")}>
                ← {t("changeMobile")}
              </button>
              <div className="otp-icon">✓</div>
              <h2>{t("verifyMobileOtp")}</h2>
              <p>{t("otpSent")}</p>

              <label className="field-label">{t("sixDigitOtp")}</label>
              <input
                className="input-control"
                value={mobileOtp}
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <button className="primary-btn full" disabled={!validOtp} onClick={verifyMobileOtp}>
                {t("verify")}
              </button>
            </div>
          )}

          {authStep === "identity" && (
            <div className="auth-panel">
              <h2>{t("chooseIdentity")}</h2>
              <p>{t("identityDescription")}</p>

              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice-card ${selectedMethod === "aadhaar" ? "active" : ""}`}
                  onClick={() => setSelectedMethod("aadhaar")}
                >
                  <span className="choice-icon">▣</span>
                  <span>
                    <b>{t("aadhaarCard")}</b>
                    <small>{t("aadhaarOtp")}</small>
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
                    <b>{t("farmerId")}</b>
                    <small>{t("farmerIdVerification")}</small>
                  </span>
                  <span className="choice-check">✓</span>
                </button>
              </div>

              {selectedMethod === "aadhaar" ? (
                <div className="identity-box">
                  <label className="field-label">{t("aadhaarNumber")}</label>
                  <input
                    className="input-control"
                    value={aadhaar}
                    maxLength={14}
                    placeholder="XXXX XXXX XXXX"
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1 ").trim())}
                  />

                  <label className="checkbox-row">
                    <input type="checkbox" checked={aadhaarConsent} onChange={(e) => setAadhaarConsent(e.target.checked)} />
                    <span>{t("aadhaarConsent")}</span>
                  </label>

                  <button className="primary-btn full" disabled={!validAadhaar || !aadhaarConsent} onClick={sendIdentityOtp}>
                    {t("sendAadhaarOtp")}
                  </button>
                </div>
              ) : (
                <div className="identity-box">
                  <label className="field-label">{t("farmerId")}</label>
                  <input
                    className="input-control"
                    value={farmerId}
                    placeholder="जैसे — MH-26032-4812"
                    onChange={(e) => setFarmerId(e.target.value)}
                  />

                  <label className="checkbox-row">
                    <input type="checkbox" checked={farmerConsent} onChange={(e) => setFarmerConsent(e.target.checked)} />
                    <span>{t("farmerConsent")}</span>
                  </label>

                  <button className="primary-btn full" disabled={!validFarmerId || !farmerConsent} onClick={sendIdentityOtp}>
                    {t("sendFarmerOtp")}
                  </button>
                </div>
              )}
            </div>
          )}

          {authStep === "identityOtp" && (
            <div className="auth-panel">
              <button type="button" className="back-link" onClick={() => setAuthStep("identity")}>
                ← {t("changeIdentity")}
              </button>
              <div className="otp-icon">✓</div>
              <h2>{selectedMethod === "aadhaar" ? t("verifyAadhaarOtp") : `${t("farmerId")} OTP ${t("verify")}`}</h2>
              <p>{t("otpSent")}</p>

              <label className="field-label">{t("sixDigitOtp")}</label>
              <input
                className="input-control"
                value={identityOtp}
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                onChange={(e) => setIdentityOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />

              <button className="primary-btn full" disabled={!validIdentityOtp} onClick={verifyIdentityOtp}>
                {t("verify")}
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
          {currentView !== "home" && (
            <button type="button" className="app-back-button" onClick={goBack} aria-label={t("backHome")}>
              <span className="back-icon" aria-hidden="true">←</span>
              <span>{t("backHome")}</span>
            </button>
          )}
          <div className="brand-mark small">
            <Leaf size={18} />
          </div>
          <div>
            <div className="brand-name">{t("farmerName")}</div>
            <div className="brand-subtitle">{t("farmerIdValue")}</div>
          </div>
        </div>

        {currentView !== "home" && <h1 className="screen-title">{viewTitle}</h1>}

        <button type="button" className="notification-btn" aria-label={t("notifications")}>
          <Bell size={18} />
        </button>
      </header>

      <main className="app-main">
        {currentView === "identity" && (
          <div className="panel-card">
            <div className="auth-panel">
              <h2>{t("aadhaarKyc")}</h2>
              <p>{t("kycDescription")}</p>
              <div className="identity-box">
                <label className="field-label">{t("aadhaarNumber")}</label>
                <input
                  className="input-control"
                  value={aadhaar}
                  maxLength={14}
                  inputMode="numeric"
                  placeholder="XXXX XXXX XXXX"
                  onChange={(event) => setAadhaar(event.target.value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1 ").trim())}
                />
                <label className="checkbox-row">
                  <input type="checkbox" checked={aadhaarConsent} onChange={(event) => setAadhaarConsent(event.target.checked)} />
                  <span>{t("aadhaarConsent")}</span>
                </label>
                <button className="primary-btn full" disabled={!validAadhaar || !aadhaarConsent} onClick={sendIdentityOtp}>{t("sendAadhaarOtp")}</button>
              </div>
            </div>
          </div>
        )}

        {currentView === "identityOtp" && (
          <div className="panel-card">
            <div className="auth-panel">
              <div className="otp-icon">✓</div>
              <h2>{t("verifyAadhaarOtp")}</h2>
              <p>{t("otpSent")}</p>
              <label className="field-label">{t("sixDigitOtp")}</label>
              <input className="input-control" value={identityOtp} maxLength={6} inputMode="numeric" placeholder="• • • • • •" onChange={(event) => setIdentityOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} />
              <button className="primary-btn full" disabled={!validIdentityOtp} onClick={verifyIdentityOtp}>{t("verify")}</button>
            </div>
          </div>
        )}

        {currentView === "home" && (
          <>
            <div className="welcome-row">
              <div>
                <div className="eyebrow">{t("brand")}</div>
                <h1>{t("greeting")}</h1>
                <p>{t("dashboardIntro")}</p>
              </div>
              <span className="live-pill">
                <span className="status-dot" />
                {t("live")}
              </span>
            </div>

            <div className="rate-header">
              <h2>{t("todayPrice")}</h2>
              <span>{t("perQuintal")}</span>
            </div>

            <div className="rate-grid">
              {marketRates.map((rate) => (
                <div key={rate.crop} className="rate-card">
                  <span className="rate-crop-icon" aria-hidden="true">{cropIcons[rate.key]}</span>
                  <div className="rate-crop-name">{t(rate.key)}</div>
                  <div className="rate-price">{rate.price}</div>
                  <div className={`rate-change ${rate.up ? "up" : "down"}`}>{rate.up ? "▲" : "▼"} {rate.change}</div>
                </div>
              ))}
            </div>

            {!bookingDone ? (
              <div className="empty-card">
                <div className="empty-badge">● {t("noBooking")}</div>
                <div className="empty-icon">
                  <Image src="/mandi-setu-logo.svg" alt={t("brand")} width={54} height={54} />
                </div>
                <h3>{t("noBooking")}</h3>
                <p>{t("bookPrompt")}</p>
                <button className="primary-btn" onClick={() => setCurrentView("book")}>{t("bookNewSlot")}</button>
              </div>
            ) : (
              <div className="active-card">
  <div>
    <div className="active-meta">📅 {t("nextBooking")}: {bookingDate} • {bookingTime}</div>
    <div className="active-title">
      <select 
        className="bg-transparent border-none outline-none cursor-pointer text-inherit"
        defaultValue="lucknow"
      >
        <option value="gorakhpur">{t("gorakhpurMandi")}</option>
        <option value="lucknow">{t("lucknowMandi")}</option>
        <option value="kanpur">{t("kanpurMandi")}</option>
        <option value="varanasi">{t("varanasiMandi")}</option>
        <option value="ayodhya">{t("ayodhyaMandi")}</option>
      </select>
    </div>
  </div>
  <div className="token-box">
    <strong>47</strong>
    <span>{t("token")}</span>
  </div>
</div>
            )}

            <div className="section-header">
              <h2>{t("quickServices")}</h2>
              <span>{t("startOneTap")}</span>
            </div>

            <div className="services-grid">
              <button type="button" className="service-tile" onClick={() => setCurrentView("book")}>
                <span className="tile-icon civic"><CalendarBlank size={18} /></span>
                <span>
                  <strong>{t("bookSlot")}</strong>
                  <small>{t("chooseMandiDate")}</small>
                </span>
                <CaretRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => setCurrentView("status")}>
                <span className="tile-icon ok"><ShieldCheck size={18} /></span>
                <span>
                  <strong>{t("liveStatus")}</strong>
                  <small>{t("seeTokenQueue")}</small>
                </span>
                <CaretRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => setCurrentView("payment")}>
                <span className="tile-icon saffron"><CreditCard size={18} /></span>
                <span>
                  <strong>{t("trackPayment")}</strong>
                  <small>{t("seeJForm")}</small>
                </span>
                <CaretRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => window.location.href = "tel:18001801551"}>
                <span className="tile-icon danger"><Phone size={18} /></span>
                <span>
                  <strong>{t("help")}</strong>
                  <small>{t("callForHelp")}</small>
                </span>
                <CaretRight size={18} />
              </button>
            </div>
          </>
        )}

        {currentView === "book" && (
          <div className="panel-card">
            <h2 className="panel-title">{t("bookSlotTitle")}</h2>

            <label className="field-label">1. {t("chooseMandi")}</label>
            <select className="select-box" defaultValue="lucknow">
  <option value="gorakhpur">{t("gorakhpurMandi")} (🟢 47 {t("available")})</option>
  <option value="lucknow">{t("lucknowMandi")} (🟢 32 {t("available")})</option>
  <option value="kanpur">{t("kanpurMandi")} (🟡 15 {t("available")})</option>
  <option value="varanasi">{t("varanasiMandi")} (🟡 12 {t("available")})</option>
  <option value="ayodhya">{t("ayodhyaMandi")} (🔴 2 {t("available")})</option>
</select>

            <label className="field-label">2. {t("chooseCrop")}</label>
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
                    <span className="crop-emoji" aria-hidden="true">{cropIcons[key]}</span>
                    {language === "en" ? cropCatalogEnglish[key] : cropCatalog[key]}
                  </button>
                );
              })}
              <button type="button" className={`crop-btn ${customCrop ? "active" : ""}`} onClick={() => setCustomCrop(customCrop || "मक्का")}>
                <Plus size={20} aria-hidden="true" /> {t("otherCrop")}
              </button>
            </div>

            {customCrop && (
              <div className="custom-crop-box">
                <label className="field-label">{t("cropName")}</label>
                <input className="input-control" value={customCrop} onChange={(e) => setCustomCrop(e.target.value)} placeholder="जैसे: मक्का, बाजरा, कपास..." />
                <div className="qty-row">
                  <input
                    className="input-control short"
                    value={customCropQty}
                    inputMode="numeric"
                    placeholder="0"
                    onChange={(e) => setCustomCropQty(e.target.value.replace(/\D/g, ""))}
                  />
                  <span>{t("quintal")}</span>
                </div>
              </div>
            )}

            {bookingSummary.length > 0 && (
              <div className="selected-list">
                {bookingSummary.map((entry) => (
                  <div key={entry.name} className="selected-item">
                    <span><CheckCircle size={18} aria-hidden="true" /> {entry.name}</span>
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
                          const key = Object.keys(cropCatalog).find((cropKey) => cropCatalog[cropKey as CropKey] === entry.name || cropCatalogEnglish[cropKey as CropKey] === entry.name) as CropKey | undefined;
                          if (!key) return;
                          setCropQuantities((prev) => ({ ...prev, [key]: val || 0 }));
                        }}
                      />
                      <span>{t("quintal")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="field-label">3. {t("chooseDate")}</label>
            <div className="date-scroll">
              {dateOptions.map((item) => (
                <button
                  key={`${item.day}-${item.month}`}
                  type="button"
                  className={`date-card ${bookingDate === `${item.day} ${item.month}` ? "active" : ""}`}
                  onClick={() => setBookingDate(`${item.day} ${item.month}`)}
                >
                  <span>{language === "en" ? item.english : item.label}</span>
                  <strong>{item.day}</strong>
                  <small>{language === "en" ? item.englishMonth : item.month}</small>
                </button>
              ))}
            </div>

            <label className="field-label">4. {t("chooseTime")}</label>
            <div className="time-grid">
              {timeOptions.map((time, index) => (
                <button
                  key={time}
                  type="button"
                  className={`time-card ${bookingTime === time ? "active" : ""}`}
                  onClick={() => setBookingTime(time)}
                >
                  {language === "en" ? englishTimeOptions[index] : time}
                </button>
              ))}
            </div>

            <button className="primary-btn full" onClick={doBooking}>{t("secureBooking")}</button>
          </div>
        )}

        {currentView === "status" && (
          <div className="panel-card">
            <h2 className="panel-title">{t("liveTracking")}</h2>
            <div className="status-banner">
              <div>
                <small>{t("liveGate")}</small>
                <strong>Token #47</strong>
              </div>
              <div>
                <small>{t("estimatedWait")}</small>
                <strong>~18 Mins</strong>
              </div>
            </div>

            <div className="timeline">
              {statusSteps.map((step, index) => (
                <div key={step} className={`timeline-item ${index === 0 ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <div>
                    <strong>{t(step)}</strong>
                    {index === 0 && <p>{t("slotConfirmed")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "payment" && (
          <div className="panel-card">
            <div className="payment-banner">{t("paymentNotice")}</div>
            <div className="payment-header">
              <div>
                <small>प्याज (50.5 Q)</small>
                <h2>₹90,090</h2>
                <span className="success-tag"><CheckCircle size={18} aria-hidden="true" /> {t("paymentSuccessful")}</span>
              </div>
              <button
  type="button"
  className="icon-btn speaker-btn flex items-center justify-center"
  aria-label={isSpeaking ? t("stopSpeaking") : t("speakPayment")}
  aria-pressed={isSpeaking}
  onClick={speakReceipt}
>
  <SpeakerHigh size={22} weight="regular" aria-hidden="true" />
</button>
            </div>

            <div className="timeline compact">
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("approved")}</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("escrow")}</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("deposited")}</strong></div></div>
            </div>

            <button type="button" className="secondary-btn full" onClick={openReceipt}>{t("viewJForm")}</button>
          </div>
        )}

        {currentView === "receipt" && (
          <div className="panel-card">
            <div className="payment-header">
              <div>
                <small>{t("digitalJForm")}</small>
                <h2>टोकन T-114</h2>
                <span className="success-tag"><CheckCircle size={18} aria-hidden="true" /> {t("paymentComplete")}</span>
              </div>
              <button type="button" className="icon-btn" aria-label={t("closeReceipt")} onClick={() => setCurrentView("payment")}>×</button>
            </div>
            <div className="payment-header">
              <div><small>{t("netPayment")}</small><h2>₹90,090</h2></div>
            </div>
            <div className="security-box">
              <strong>{t("certifiedEvidence")}</strong>
              {receiptPhoto ? <Image src={receiptPhoto} alt={t("officerPhoto")} width={600} height={240} unoptimized /> : <small>{t("noPhoto")}</small>}
            </div>
            <div className="timeline compact">
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("approved")}</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("escrow")}</strong></div></div>
              <div className="timeline-item done"><div className="timeline-dot" /><div><strong>{t("deposited")}</strong></div></div>
            </div>
          </div>
        )}

        {currentView === "profile" && (
         <div className="panel-card profile-card max-w-2xl mx-auto rounded-[24px] p-6 md:p-8 mt-8">
            <div className="profile-language-switcher">
              <LanguageSwitcher />
            </div>
            <div className="profile-top">
              <div className="avatar">RK</div>
              <div>
                <h2>राम कुमार <span className="verified-pill">✓ {t("verified")}</span></h2>
                <div className="profile-id">{t("farmerIdLabel")}: MH-26032-4812</div>
              </div>
            </div>

            <div className="profile-location">
              <MapPin size={16} />
              {t("farmerLocation")}
            </div>

            <div className="security-box">
              <ShieldCheck size={18} />
              <div>
                <strong>{t("bankLinked")}</strong>
                <small>{t("bankName")}</small>
              </div>
            </div>

            <button 
  type="button" 
  className="danger-btn" 
  style={{ marginTop: '24px' }} 
  onClick={() => setIsLoggedIn(false)}
>
  <SignOut size={18} />
  {t("closeAccount")}
</button>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <button type="button" className={currentView === "home" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("home")}>
          <House size={18} />
          <span>{t("home")}</span>
        </button>
        <button type="button" className={currentView === "book" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("book")}>
          <CalendarBlank size={18} />
          <span>{t("navBooking")}</span>
        </button>
        <button type="button" className={currentView === "status" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("status")}>
          <Check size={18} />
          <span>{t("status")}</span>
        </button>
        <button type="button" className={currentView === "payment" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("payment")}>
          <CreditCard size={18} />
          <span>{t("payments")}</span>
        </button>
        <button type="button" className={currentView === "profile" ? "nav-item active" : "nav-item"} onClick={() => setCurrentView("profile")}>
          <User size={18} />
          <span>{t("profile")}</span>
        </button>
      </nav>

    </div>
  );
}
