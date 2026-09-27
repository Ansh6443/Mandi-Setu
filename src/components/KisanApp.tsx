"use client";

import { Bell, CalendarBlank, Check, CaretRight, Copy, CreditCard, DownloadSimple, House, Leaf, LockKey, MapPin, Phone, Plus, ShieldCheck, SignOut, CheckCircle, User } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CropQualityPanel from "@/components/CropQualityPanel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";
import { DEFAULT_MANDI_ID, DEMO_FARMER_ID, receiptStorageKey, STORAGE_KEYS } from "@/lib/storage-keys";

type AuthStep = "mobile" | "mobileOtp" | "identity" | "identityOtp";
type ViewName = "home" | "book" | "status" | "quality" | "payment" | "profile" | "receipt" | "identity" | "identityOtp";
type CropKey = "onion" | "wheat" | "potato" | "tomato" | "soybean";
type StoredReceipt = {
  photo?: string;
  farmer?: string;
  bookingId?: string;
  mandiName?: string;
  commodity?: string;
  grade?: string;
  weight?: string | number;
  weightQuintals?: number;
  mspRate?: number;
  amount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  submittedAt?: string;
  receiptId?: string;
  receiptNumber?: string;
  transactionId?: string;
  issuedAt?: string;
  qrCode?: string;
  verificationUrl?: string;
};

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

const cropEmojis: Record<CropKey, string> = {
  onion: "🧅",
  wheat: "🌾",
  potato: "🥔",
  tomato: "🍅",
  soybean: "🫘",
};

function CropIcon({ crop }: { crop: CropKey }) {
  return <span className="rate-crop-icon" aria-hidden="true">{cropEmojis[crop]}</span>;
}

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
  { key: "onion" as CropKey, crop: "प्याज", price: 1850, change: "+2%", up: true },
  { key: "wheat" as CropKey, crop: "गेहूँ", price: 2275, change: "-1%", up: false },
  { key: "potato" as CropKey, crop: "आलू", price: 1200, change: "+1%", up: true },
  { key: "tomato" as CropKey, crop: "टमाटर", price: 900, change: "-3%", up: false },
  { key: "soybean" as CropKey, crop: "सोयाबीन", price: 4700, change: "+1%", up: true },
];

const statusSteps = ["registered", "checkIn", "qualityWeight", "auctionApproved", "dbtPayment"] as const;
const statusStepDescriptions = [
  "स्लॉट कन्फर्म। कृपया तय समय पर मंडी पहुँचें।",
  "मंडी पहुँचकर गेट पर अपना टोकन नंबर दिखाएं और चेक-इन करें।",
  "आपकी उपज की गुणवत्ता जांची जाएगी और तौल पूरी की जाएगी।",
  "नीलामी में सबसे अच्छा भाव मिलने पर उपज स्वीकृत की जाएगी।",
  "भुगतान राशि सीधे आपके बैंक खाते में ट्रांसफर कर दी जाएगी।",
] as const;

export default function KisanApp() {
  const { language, t } = useLanguage();
  const router = useRouter();
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
  const [mandiOpen, setMandiOpen] = useState(false);
  const [farmerMarketRates, setFarmerMarketRates] = useState(marketRates);
  const [cropQuantities, setCropQuantities] = useState<Record<string, number>>({ onion: 50 });
  const [customCrop, setCustomCrop] = useState("");
  const [customCropQty, setCustomCropQty] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [storedReceipt, setStoredReceipt] = useState<StoredReceipt | null>(null);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [copiedFarmerId, setCopiedFarmerId] = useState(false);
  // यह identifier officer के farmer.bookingId से बिल्कुल समान होना MUST है, तभी receipt मिल पाएगी।
  const receiptKey = receiptStorageKey(farmerId);

  const transactionId = storedReceipt?.transactionId ?? "TXN206927145603";

  const handleCopyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedTxId(true);
      window.setTimeout(() => setCopiedTxId(false), 1200);
    } catch {
      setCopiedTxId(false);
    }
  };

  const handleCopyFarmerId = async () => {
    try {
      await navigator.clipboard.writeText(t("farmerIdValue"));
      setCopiedFarmerId(true);
      window.setTimeout(() => setCopiedFarmerId(false), 1200);
    } catch {
      setCopiedFarmerId(false);
    }
  };

  useEffect(() => {
    let active = true;
    const refreshMandiStatus = async () => {
      try {
        const response = await fetch(`/api/mandis/${DEFAULT_MANDI_ID}/daily-setup`, { cache: "no-store" });
        if (!response.ok) return;
        const record = await response.json() as { mandiOpen?: boolean; setupCompletedAt?: string | null };
        if (active) setMandiOpen(Boolean(record.setupCompletedAt && record.mandiOpen));
      } catch {
        if (active) setMandiOpen(false);
      }
    };

    void refreshMandiStatus();
    const intervalId = window.setInterval(() => void refreshMandiStatus(), 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const navigateToView = (view: ViewName) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    const syncMarketRates = (storedValue: string | null) => {
      if (!storedValue) {
        setFarmerMarketRates(marketRates);
        return;
      }

      try {
        const savedRates = JSON.parse(storedValue) as Array<{ crop?: string; value?: string }>;
        if (!Array.isArray(savedRates)) return;
        const prices = new Map<string, number>();
        for (const rate of savedRates) {
          const price = Number(rate?.value);
          if (typeof rate?.crop === "string" && Number.isFinite(price) && price >= 0) {
            prices.set(rate.crop, price);
          }
        }
        setFarmerMarketRates(marketRates.map((rate) => ({
          ...rate,
          price: prices.get(cropCatalog[rate.key]) ?? rate.price,
        })));
      } catch {
        // Keep the currently displayed rates when stored data is invalid.
      }
    };

    syncMarketRates(window.localStorage.getItem(STORAGE_KEYS.mspRates));
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.mspRates) syncMarketRates(event.newValue);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const readReceiptPhoto = (storedValue: string | null) => {
      try {
        const receipt = storedValue ? JSON.parse(storedValue) as StoredReceipt : null;
        setStoredReceipt(receipt);
        setReceiptPhoto(receipt?.photo ?? null);
      } catch {
        setStoredReceipt(null);
        setReceiptPhoto(null);
      }
    };

    if (currentView === "receipt" || currentView === "payment") readReceiptPhoto(window.localStorage.getItem(receiptKey));
    const handleReceiptStorage = (event: StorageEvent) => {
      // केवल इसी किसान की key बदलने पर J-Form की फोटो update होगी।
      if (event.key === receiptKey) readReceiptPhoto(event.newValue);
    };
    window.addEventListener("storage", handleReceiptStorage);

    return () => {
      window.removeEventListener("storage", handleReceiptStorage);
    };
  }, [currentView, receiptKey]);

  const handleDownloadReceipt = () => {
    let receipt = storedReceipt;
    try {
      const saved = window.localStorage.getItem(receiptKey);
      if (saved) receipt = JSON.parse(saved) as StoredReceipt;
    } catch {
      receipt = storedReceipt;
    }

    const escapeHtml = (value: unknown) => String(value ?? "—").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] ?? character);
    const amount = Number(receipt?.totalAmount ?? receipt?.amount ?? 90090);
    const number = (value: unknown) => Number(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
    const evidence = typeof receipt?.photo === "string" && /^data:image\/(?:jpeg|png|webp);base64,/i.test(receipt.photo)
      ? `<img class="evidence-photo" src="${receipt.photo}" alt="अधिकारी द्वारा अपलोड की गई कांटे की फोटो">`
      : `<p class="no-photo">अधिकारी की वेटब्रिज फोटो उपलब्ध नहीं है।</p>`;
    const qr = typeof receipt?.qrCode === "string" && /^data:image\/png;base64,/i.test(receipt.qrCode)
      ? `<img class="qr" src="${receipt.qrCode}" alt="रसीद सत्यापन QR code">`
      : `<p class="no-qr">Server verification QR जारी नहीं हुआ। यह रसीद verified नहीं है।</p>`;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>मंडी सेतु - भुगतान रसीद</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #17231d; font: 14px/1.5 Arial, "Noto Sans Devanagari", sans-serif; }
        .receipt { width: 100%; max-width: 780px; margin: 0 auto; padding: 22px; border: 1px solid #cfded4; border-radius: 12px; }
        header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; padding-bottom: 14px; border-bottom: 1px dashed #95aa9c; }
        h1 { margin: 0; font-size: 23px; line-height: 1.3; } .brand { margin: 0 0 3px; color: #1b7a4b; font-size: 15px; font-weight: 800; }
        .receipt-meta { text-align: right; font-size: 12px; } .receipt-meta strong { display: block; font-size: 14px; }
        h2 { margin: 16px 0 8px; font-size: 15px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px 18px; }
        .field { min-width: 0; padding: 4px 0; } .label { color: #52645a; font-size: 12px; } .value { margin-top: 2px; font-size: 14px; font-weight: 700; overflow-wrap: anywhere; }
        .total { margin: 16px 0; padding: 13px 16px; border: 1px solid #b5d7c2; border-radius: 10px; background: #eef8f1; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .total span { font-weight: 700; } .total strong { color: #155e38; font-size: 24px; }
        .statuses { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 14px; } .pill { border-radius: 999px; background: #eafaf1; color: #0d4d37; padding: 5px 10px; font-size: 12px; font-weight: 700; }
        .bottom { display: grid; grid-template-columns: 1fr 120px; align-items: center; gap: 14px; border-top: 1px dashed #95aa9c; padding-top: 12px; }
        .evidence-photo { display: block; width: 100%; max-height: 180px; object-fit: contain; border: 1px solid #d5ded8; border-radius: 7px; }
        .qr { width: 94px; height: 94px; display: block; margin: 0 auto; } .verify { text-align: center; color: #52645a; font-size: 12px; }
        .no-photo, .no-qr { color: #52645a; font-size: 12px; } .disclaimer { margin-top: 8px; font-size: 12px; color: #52645a; }
        footer { margin-top: 12px; padding-top: 9px; border-top: 1px solid #d5ded8; display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
        .print-action { display: block; margin: 18px auto 0; padding: 10px 16px; border: 0; border-radius: 8px; background: #1b7a4b; color: white; font-size: 14px; font-weight: 700; }
        @media print { .receipt { max-width: none; margin: 0; padding: 0; border: 0; } .print-action { display: none; } }
        @media (max-width: 580px) { .receipt { padding: 16px; } .grid { grid-template-columns: 1fr 1fr; } header { flex-wrap: wrap; } }
      </style></head><body><main class="receipt">
      <header><div><p class="brand">मंडी सेतु · भारत मंडी सेवा</p><h1>भुगतान रसीद</h1></div><div class="receipt-meta"><strong>रसीद नं.: ${escapeHtml(receipt?.receiptNumber ?? "जारी नहीं")}</strong><span>दिनांक-समय: ${escapeHtml(receipt?.issuedAt ? new Date(receipt.issuedAt).toLocaleString("hi-IN", { timeZone: "Asia/Kolkata" }) : receipt?.submittedAt ?? "—")}</span></div></header>
      <h2>किसान विवरण</h2><section class="grid"><div class="field"><div class="label">किसान का नाम</div><div class="value">${escapeHtml(receipt?.farmer ?? "राम कुमार")}</div></div><div class="field"><div class="label">किसान आईडी</div><div class="value">${escapeHtml(receipt?.bookingId ?? t("farmerIdValue"))}</div></div><div class="field"><div class="label">मंडी</div><div class="value">${escapeHtml(receipt?.mandiName ?? "आज़ादपुर मंडी")}</div></div></section>
      <h2>फसल एवं तौल विवरण</h2><section class="grid"><div class="field"><div class="label">फसल</div><div class="value">${escapeHtml(receipt?.commodity ?? "—")}</div></div><div class="field"><div class="label">ग्रेड</div><div class="value">${escapeHtml(receipt?.grade ?? "—")}</div></div><div class="field"><div class="label">वेटब्रिज तौल</div><div class="value">${number(receipt?.weightQuintals ?? receipt?.weight)} क्विंटल</div></div><div class="field"><div class="label">MSP दर / क्विंटल</div><div class="value">₹${number(receipt?.mspRate)}</div></div></section>
      <section class="total"><span>कुल भुगतान राशि</span><strong>₹${number(amount)}</strong></section>
      <section class="grid"><div class="field"><div class="label">भुगतान माध्यम</div><div class="value">${escapeHtml(receipt?.paymentMethod ?? "DBT")}</div></div><div class="field"><div class="label">लेनदेन आईडी</div><div class="value">${escapeHtml(receipt?.transactionId ?? transactionId)}</div></div></section>
      <div class="statuses"><span class="pill">✓ अनुरोध स्वीकृत</span><span class="pill">✓ राशि सुरक्षित</span><span class="pill">✓ DBT भुगतान</span></div>
      <section class="bottom"><div><h2>वेटब्रिज फोटो साक्ष्य</h2>${evidence}<p class="disclaimer">यह computer-generated रसीद है; हस्ताक्षर आवश्यक नहीं।</p></div><div class="verify">${qr}<span>सत्यापन के लिए scan करें</span></div></section>
      <footer><span>सहायता हेल्पलाइन: 1800-180-1551</span><span>${escapeHtml(receipt?.receiptNumber ?? "मंडी सेतु")}</span></footer>
      <button class="print-action" type="button" onclick="window.print()">प्रिंट करें / PDF में सेव करें</button>
      </main><script>window.addEventListener("load", () => { window.focus(); window.print(); });</script></body></html>`);
    printWindow.document.close();
  };

  const validMobile = mobile.replace(/\D/g, "").length === 10;
  const validOtp = mobileOtp.replace(/\D/g, "").length === 6;
  const validAadhaar = aadhaar.replace(/\D/g, "").length === 12;
  const validFarmerId = farmerId.trim().length > 5;
  const validIdentityOtp = identityOtp.replace(/\D/g, "").length === 6;

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
    navigateToView("home");
  };

  const sendIdentityOtp = () => {
    if (selectedMethod === "aadhaar" && !(validAadhaar && aadhaarConsent)) return;
    if (selectedMethod === "farmer" && !(validFarmerId && farmerConsent)) return;
    navigateToView("identityOtp");
  };

  const verifyIdentityOtp = () => {
    if (!validIdentityOtp) return;
    setIsLoggedIn(true);
    navigateToView("status");
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
    navigateToView("identity");
  };

  const viewTitle = currentView === "book"
    ? t("bookSlotTitle")
    : currentView === "status"
      ? t("liveTracking")
        : currentView === "quality"
          ? t("cropQualityTitle")
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
      quality: "home",
      payment: "home",
      profile: "home",
      receipt: "payment",
      identity: "book",
      identityOtp: "identity",
    };
    const destination = previousView[currentView];
    if (destination) navigateToView(destination);
  };

  const handleFarmerLogout = () => {
    setIsLoggedIn(false);
    router.replace("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-mark small">
              <Image src="/mandi-setu-logo.svg" alt="" width={36} height={36} className="brand-mark-image" />
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
            <Image src="/mandi-setu-logo.svg" alt="" width={36} height={36} className="brand-mark-image" />
          </div>
          <div>
            <div className="brand-name">{t("farmerName")}</div>
            <div className="brand-subtitle">{t("farmerIdValue")}</div>
          </div>
        </div>

        {currentView !== "home" && currentView !== "quality" && <h1 className="screen-title">{viewTitle}</h1>}

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
              <span className="live-pill" style={mandiOpen ? undefined : { background: "rgba(100, 116, 139, 0.1)", color: "var(--text-secondary)", borderColor: "rgba(100, 116, 139, 0.3)" }}>
                <span className="status-dot" style={mandiOpen ? undefined : { background: "#94a3b8" }} />
                {mandiOpen ? t("mandiOpen") : t("mandiClosed")}
              </span>
            </div>

            <div className="rate-header">
              <h2>{t("todayPrice")}</h2>
              <span>{t("perQuintal")}</span>
            </div>

            <div className="rate-grid">
              {farmerMarketRates.map((rate) => (
                <div key={rate.crop} className="rate-card">
                  <CropIcon crop={rate.key} />
                  <div className="rate-crop-name">{t(rate.key)}</div>
                  <div className="rate-price">₹{rate.price.toLocaleString("en-IN")}</div>
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
                <button className="primary-btn" onClick={() => navigateToView("book")}>{t("bookNewSlot")}</button>
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
              <button type="button" className="service-tile" onClick={() => navigateToView("book")}>
                <span className="tile-icon civic"><CalendarBlank size={18} /></span>
                <span>
                  <strong>{t("bookSlot")}</strong>
                  <small>{t("chooseMandiDate")}</small>
                </span>
                <CaretRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => navigateToView("status")}>
                <span className="tile-icon ok"><ShieldCheck size={18} /></span>
                <span>
                  <strong>{t("liveStatus")}</strong>
                  <small>{t("seeTokenQueue")}</small>
                </span>
                <CaretRight size={18} />
              </button>

              <button type="button" className="service-tile" onClick={() => navigateToView("payment")}>
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
                    <CropIcon crop={key} />
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
                    <p>{statusStepDescriptions[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === "quality" && <CropQualityPanel />}

        {currentView === "payment" && (
          <div className="panel-card payment-success-card">
            <div className="payment-success-top">
              <div className="payment-success-badge" aria-hidden="true">
                <CheckCircle size={30} weight="fill" />
              </div>
              <div className="payment-success-amount">₹{Number(storedReceipt?.totalAmount ?? storedReceipt?.amount ?? 90090).toLocaleString("en-IN")}</div>
              <div className="payment-success-status">
                <span className="payment-success-status-icon"><ShieldCheck size={14} weight="fill" aria-hidden="true" /></span>
                <span>भुगतान सफल</span>
              </div>
            </div>

            <div className="payment-success-list">
              <div className="payment-success-item">
                <span className="payment-success-icon" aria-hidden="true"><Check size={15} weight="bold" /></span>
                <div className="payment-success-copy">
                  <div className="payment-success-title">स्वीकृत</div>
                  <div className="payment-success-subtitle">भुगतान अनुरोध स्वीकृत हुआ</div>
                </div>
              </div>

              <div className="payment-success-item">
                <span className="payment-success-icon" aria-hidden="true"><Check size={15} weight="bold" /></span>
                <div className="payment-success-copy">
                  <div className="payment-success-title">राशि रोकी गई</div>
                  <div className="payment-success-subtitle">राशि अस्थायी रूप से सुरक्षित खाते में रोकी गई</div>
                </div>
              </div>

              <div className="payment-success-item">
                <span className="payment-success-icon" aria-hidden="true"><Check size={15} weight="bold" /></span>
                <div className="payment-success-copy">
                  <div className="payment-success-title">खाते में जमा</div>
                  <div className="payment-success-subtitle">राशि लाभार्थी के खाते में जमा हुई</div>
                </div>
              </div>
            </div>

            <div className="payment-success-footer">
              <div className="payment-success-account">
                <div>
                  <div className="payment-success-account-label">लेनदेन आईडी</div>
                  <div className="payment-success-account-value">{transactionId}</div>
                </div>
                <button
                  type="button"
                  className={`payment-success-copy-btn${copiedTxId ? " is-copied" : ""}`}
                  aria-label="Transaction ID copy"
                  onClick={handleCopyTransactionId}
                >
                  {copiedTxId ? <Check size={17} weight="bold" aria-hidden="true" /> : <Copy size={17} weight="regular" aria-hidden="true" />}
                </button>
              </div>

              <button type="button" className="payment-success-download-btn" aria-label="Download receipt" onClick={handleDownloadReceipt}>
                <DownloadSimple size={17} weight="bold" aria-hidden="true" />
                <span>रसीद डाउनलोड करें</span>
              </button>
            </div>
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
              <button type="button" className="icon-btn" aria-label={t("closeReceipt")} onClick={() => navigateToView("payment")}>×</button>
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
          <div className="panel-card profile-card max-w-2xl mx-auto">
            <div className="profile-language-switcher">
              <LanguageSwitcher />
            </div>
            <div className="profile-top">
              <div className="avatar">RK</div>
              <div>
                <h2>राम कुमार <span className="verified-pill"><Check size={14} weight="bold" aria-hidden="true" />{t("verified")}</span></h2>
              </div>
            </div>

            <button type="button" className="profile-id" onClick={handleCopyFarmerId} aria-label="किसान आईडी कॉपी करें">
              <span>{t("farmerIdLabel")}: {t("farmerIdValue")}</span>
              {copiedFarmerId ? <Check size={17} weight="bold" aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
            </button>

            <div className="profile-location">
              <MapPin size={16} aria-hidden="true" />
              {t("farmerLocation")}
            </div>

            <div className="security-box profile-bank-card">
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>{t("bankLinked")}</strong>
                <small>{t("bankName")}</small>
              </div>
            </div>

            <button type="button" className="profile-logout-btn" onClick={handleFarmerLogout}>
              <SignOut size={18} aria-hidden="true" />
              {t("closeAccount")}
            </button>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        <button type="button" className={currentView === "home" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("home")}>
          <House size={18} />
          <span>{t("home")}</span>
        </button>
        <button type="button" className={currentView === "book" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("book")}>
          <CalendarBlank size={18} />
          <span>{t("navBooking")}</span>
        </button>
        <button type="button" className={currentView === "status" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("status")}>
          <Check size={18} />
          <span>{t("status")}</span>
        </button>
        <button type="button" className={currentView === "quality" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("quality")}>
          <Leaf size={18} />
          <span>{t("cropQualityTab")}</span>
        </button>
        <button type="button" className={currentView === "payment" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("payment")}>
          <CreditCard size={18} />
          <span>{t("payments")}</span>
        </button>
        <button type="button" className={currentView === "profile" ? "nav-item active" : "nav-item"} onClick={() => navigateToView("profile")}>
          <User size={18} />
          <span>{t("profile")}</span>
        </button>
      </nav>

    </div>
  );
}
