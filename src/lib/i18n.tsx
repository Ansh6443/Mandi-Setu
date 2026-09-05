"use client";
import { createContext, startTransition, useContext, useEffect, useState } from "react";

// Aapki default dictionary (Jab tak backend connect na ho, yeh kaam aayegi)
const defaultTranslations: Record<string, Record<string, string>> = {
  hi: {
    language: "भाषा", hindi: "हिन्दी", english: "English", home: "होम", navBooking: "बुकिंग",
    status: "स्टेटस", payments: "भुगतान", profile: "प्रोफाइल", backHome: "होम",
    farmerAuthSubtitle: "मंडी बुकिंग और भुगतान", mobileVerification: "मोबाइल सत्यापन",
    startWithMobile: "मोबाइल नंबर से शुरू करें", mobileDescription: "आपका पंजीकृत मोबाइल नंबर सुरक्षित रूप से सत्यापन के लिए उपयोग किया जाएगा।",
    mobileNumber: "मोबाइल नंबर", mobilePlaceholder: "10 अंकों का मोबाइल नंबर",
    phoneTrust: "आपका नंबर सुरक्षित है और किसी के साथ साझा नहीं किया जाएगा",
    validNumber: "मोबाइल नंबर सही है", otpConsent: "मैं OTP सत्यापन के लिए सहमत हूँ।",
    sendOtp: "मोबाइल OTP भेजें", greeting: "नमस्कार, राम कुमार",
    dashboardIntro: "आज की मंडी गतिविधि और बुकिंग स्थिति देखें।", live: "Live",
    todayPrice: "आज का भाव", perQuintal: "प्रति क्विंटल", noBooking: "अभी कोई सक्रिय बुकिंग नहीं",
    bookPrompt: "अपनी फसल बेचने के लिए नज़दीकी मंडी में सुविधाजनक समय का स्लॉट अभी बुक करें।",
    bookNewSlot: "नया स्लॉट बुक करें", quickServices: "त्वरित सेवाएं", startOneTap: "एक टैप में शुरू करें",
    bookSlot: "स्लॉट बुक करें", chooseMandiDate: "मंडी और तारीख चुनें", liveStatus: "लाइव स्टेटस",
    seeTokenQueue: "टोकन और कतार देखें", trackPayment: "भुगतान ट्रैक", seeJForm: "J-Form और DBT देखें",
    help: "सहायता", callForHelp: "कॉल करके मदद पाएं", changeMobile: "मोबाइल नंबर बदलें",
    verifyMobileOtp: "मोबाइल OTP सत्यापित करें", otpSent: "OTP आपके मोबाइल नंबर पर भेजा गया है।",
    sixDigitOtp: "6 अंकों का OTP", verify: "सत्यापित करें", chooseIdentity: "अब पहचान चुनें",
    identityDescription: "मोबाइल सत्यापन सफल रहा। अपनी पहचान का तरीका चुनें।", aadhaarCard: "आधार कार्ड",
    aadhaarOtp: "आधार नंबर + OTP", farmerId: "किसान ID", farmerIdVerification: "किसान ID से सत्यापन",
    aadhaarNumber: "आधार नंबर", aadhaarConsent: "मैं आधार आधारित सत्यापन के लिए सहमत हूँ।",
    sendAadhaarOtp: "आधार OTP भेजें", farmerConsent: "मैं अपनी जानकारी साझा करने और सत्यापन के लिए सहमत हूँ।",
    sendFarmerOtp: "OTP भेजें", changeIdentity: "पहचान बदलें", verifyAadhaarOtp: "आधार OTP से सत्यापन करें",
    aadhaarKyc: "आधार KYC पूरा करें", kycDescription: "बुकिंग सुरक्षित करने के लिए आधार नंबर से सत्यापन करें।",
    backToBooking: "बुकिंग पर वापस जाएं", changeAadhaar: "आधार नंबर बदलें", nextBooking: "अगली बुकिंग",
    token: "टोकन", bookSlotTitle: "स्लॉट बुक करें", chooseMandi: "मंडी चुनें",
    chooseCrop: "फसल चुनें और मात्रा दर्ज करें", otherCrop: "अन्य फसल", cropName: "अपनी फसल का नाम लिखें",
    quintal: "क्विंटल", chooseDate: "तारीख चुनें (आगामी 7 दिन)", chooseTime: "समय चुनें",
    secureBooking: "सुरक्षित बुक करें (Book Now)", liveTracking: "लाइव ट्रैकिंग",
    estimatedWait: "अनुमानित प्रतीक्षा", slotConfirmed: "स्लॉट कन्फर्म। कृपया तय समय पर मंडी पहुँचें।",
    paymentNotice: "सभी भुगतान PFMS/DBT के माध्यम से सीधे बैंक खाते में भेजे जाते हैं।",
    paymentSuccessful: "भुगतान सफल", approved: "स्वीकृत", escrow: "राशि रोकी गई", deposited: "खाते में जमा",
    viewJForm: "डिजिटल J-Form देखें", digitalJForm: "डिजिटल J-Form", paymentComplete: "भुगतान पूर्ण",
    netPayment: "निवल भुगतान राशि", certifiedEvidence: "कांटे का प्रमाणित साक्ष्य",
    officerPhoto: "अधिकारी द्वारा अपलोड की गई कांटे की फोटो", noPhoto: "अधिकारी द्वारा अपलोड की गई फोटो उपलब्ध नहीं है",
    verified: "Verified", farmerIdLabel: "FARMER ID", bankLinked: "NPCI / बैंक लिंक सक्रिय",
    closeAccount: "खाता बंद करें (Logout)", registered: "रजिस्टर्ड", checkIn: "मंडी चेक-इन",
    qualityWeight: "क्वालिटी जाँच और वज़न", auctionApproved: "नीलामी / स्वीकृत", dbtPayment: "DBT भुगतान",
    services: "सुविधाएं", officer: "अधिकारी", openApp: "लॉगिन / ऐप खोलें", brand: "किसान साथी",
    brandSubtitle: "स्मार्ट मंडी प्रोक्योरमेंट पोर्टल", speak: "बोलकर सुनें",
    heroBadge: "PS 26032 • Ministry of Consumer Affairs, Food & Public Distribution",
    heroTitle: "बिना मंडी गए, अपनी बारी जानें।",
    heroSubtitle: "सरकारी मंडी में MSP पर बेचें — स्लॉट बुक करें, लाइव कतार देखें, सीधा भुगतान पाएं।",
    connectedMandis: "मंडियां जुड़ीं", waitReduction: "औसत प्रतीक्षा में कमी",
    availableLanguages: "भाषाएं उपलब्ध", prototypeEstimate: "(प्रोटोटाइप अनुमान)",
    farmerApp: "किसान ऐप खोलें (Farmer App)", officerPortal: "मंडी अधिकारी व्यू (Officer Portal)",
    liveCentres: "लाइव — आज के केंद्र", updating: "अपडेट हो रहा है",
    sameBoard: "एक ही बोर्ड को तीन तरीकों से पढ़ें: PWA ऐप, SMS या गेट पर लगा डिस्प्ले।",
    mainServices: "हमारी मुख्य सुविधाएं", smartFarming: "स्मार्ट खेती, स्मार्ट व्यापार",
    booking: "स्मार्ट स्लॉट बुकिंग", bookingDescription: "घर बैठे मंडी में अपनी फसल बेचने का दिन और समय चुनें। भीड़ से बचें और अपना समय बचाएं।",
    tracking: "लाइव स्टेटस ट्रैकिंग", trackingDescription: "मंडी गेट-पास से लेकर तौल और गुणवत्ता चेक तक हर कदम की लाइव अपडेट पाएं।",
    payment: "DBT व डिजिटल J-Form", paymentDescription: "नीलामी के तुरंत बाद सिस्टम जनरेटेड J-Form और सीधा बैंक खाते में भुगतान।",
    footer: "© 2026 भारत सरकार (प्रोटोटाइप)। सभी अधिकार सुरक्षित।"
  },
  en: {
    language: "Language", hindi: "हिन्दी", english: "English", home: "Home", navBooking: "Booking",
    status: "Status", payments: "Payments", profile: "Profile", backHome: "Home",
    farmerAuthSubtitle: "Mandi booking and payments", mobileVerification: "Mobile verification",
    startWithMobile: "Start with your mobile number", mobileDescription: "Your registered mobile number will be securely used for verification.",
    mobileNumber: "Mobile number", mobilePlaceholder: "10-digit mobile number",
    phoneTrust: "Your number is secure and will not be shared", validNumber: "Mobile number is valid",
    otpConsent: "I agree to OTP verification.", sendOtp: "Send mobile OTP",
    greeting: "Hello, Ram Kumar", dashboardIntro: "View today's mandi activity and booking status.",
    live: "Live", todayPrice: "Today's prices", perQuintal: "Per quintal", noBooking: "No active booking",
    bookPrompt: "Book a convenient slot at the nearest mandi to sell your crop.", bookNewSlot: "Book a new slot",
    quickServices: "Quick services", startOneTap: "Start in one tap", bookSlot: "Book a slot",
    chooseMandiDate: "Choose mandi and date", liveStatus: "Live status", seeTokenQueue: "View token and queue",
    trackPayment: "Track payment", seeJForm: "View J-Form and DBT", help: "Help", callForHelp: "Call for assistance",
    changeMobile: "Change mobile number", verifyMobileOtp: "Verify mobile OTP",
    otpSent: "The OTP has been sent to your registered mobile number.", sixDigitOtp: "6-digit OTP",
    verify: "Verify", chooseIdentity: "Choose your identity",
    identityDescription: "Mobile verification succeeded. Choose how you want to verify your identity.",
    aadhaarCard: "Aadhaar card", aadhaarOtp: "Aadhaar number + OTP", farmerId: "Farmer ID",
    farmerIdVerification: "Verify with Farmer ID", aadhaarNumber: "Aadhaar number",
    aadhaarConsent: "I agree to Aadhaar-based verification.", sendAadhaarOtp: "Send Aadhaar OTP",
    farmerConsent: "I agree to share my information for verification.", sendFarmerOtp: "Send OTP",
    changeIdentity: "Change identity", verifyAadhaarOtp: "Verify with Aadhaar OTP",
    aadhaarKyc: "Complete Aadhaar KYC", kycDescription: "Verify with your Aadhaar number to secure the booking.",
    backToBooking: "Back to booking", changeAadhaar: "Change Aadhaar number", nextBooking: "Next booking",
    token: "Token", bookSlotTitle: "Book a slot", chooseMandi: "Choose mandi",
    chooseCrop: "Choose crop and enter quantity", otherCrop: "Other crop", cropName: "Enter your crop name",
    quintal: "quintal", chooseDate: "Choose date (next 7 days)", chooseTime: "Choose time",
    secureBooking: "Confirm booking (Book Now)", liveTracking: "Live tracking", estimatedWait: "Estimated wait",
    slotConfirmed: "Slot confirmed. Please reach the mandi at the scheduled time.",
    paymentNotice: "All payments are sent directly to your bank account through PFMS/DBT.",
    paymentSuccessful: "Payment successful", approved: "Approved", escrow: "Escrow", deposited: "Deposited",
    viewJForm: "View digital J-Form", digitalJForm: "Digital J-Form", paymentComplete: "Payment complete",
    netPayment: "Net payment amount", certifiedEvidence: "Certified scale evidence",
    officerPhoto: "Scale photo uploaded by the officer", noPhoto: "No photo uploaded by the officer is available",
    verified: "Verified", farmerIdLabel: "FARMER ID", bankLinked: "NPCI / Bank link active",
    closeAccount: "Close account (Logout)", registered: "Registered", checkIn: "Mandi check-in",
    qualityWeight: "Quality check and weighing", auctionApproved: "Auction / approved", dbtPayment: "DBT payment",
    services: "Services", officer: "Officer", openApp: "Login / Open app", brand: "Kisan Saathi",
    brandSubtitle: "Smart mandi procurement portal", speak: "Listen aloud",
    heroBadge: "PS 26032 • Ministry of Consumer Affairs, Food & Public Distribution",
    heroTitle: "Know your turn, without visiting the mandi.",
    heroSubtitle: "Sell at MSP in a government mandi: book a slot, track the live queue, and get paid directly.",
    connectedMandis: "Connected mandis", waitReduction: "Average wait reduction",
    availableLanguages: "Languages available", prototypeEstimate: "(Prototype estimate)",
    farmerApp: "Open Farmer App", officerPortal: "Mandi Officer Portal",
    liveCentres: "LIVE — TODAY'S CENTRES", updating: "Updating",
    sameBoard: "One board, three ways to read it: the PWA app, SMS, or the physical display at the gate.",
    mainServices: "Our core services", smartFarming: "Smarter farming, smarter trade",
    booking: "Smart slot booking", bookingDescription: "Choose a day and time to sell your crop at the mandi from home. Skip the crowd and save time.",
    tracking: "Live status tracking", trackingDescription: "Get live updates at every step, from the mandi gate pass to weighing and quality checks.",
    payment: "DBT and digital J-Form", paymentDescription: "Receive a system-generated J-Form and direct bank payment immediately after the auction.",
    footer: "© 2026 Government of India (Prototype). All rights reserved."
  }
};

type LanguageContextValue = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<string>("hi");
  const [translations, setTranslations] = useState(defaultTranslations);

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem("kisan-setu-language");
      if (savedLanguage) startTransition(() => setLanguage(savedLanguage));
    } catch {
      // Keep the default language when storage is unavailable.
    }
  }, []);

  // AUTOMATIC BACKEND FETCH LOGIC
  useEffect(() => {
    try {
      window.localStorage.setItem("kisan-setu-language", language);
    } catch {
      // Continue rendering when storage is unavailable.
    }
    document.documentElement.lang = language;

    const controller = new AbortController();
    const fetchTranslation = async () => {
      // Agar backend URL nahi hai ya language pehle se default mein hai, toh fetch mat karo
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiUrl || defaultTranslations[language]) return;

      try {
        const response = await fetch(`${apiUrl}/api/translations?lang=${language}`, { signal: controller.signal });
        if (response.ok) {
          const newWords = await response.json();
          if (newWords && typeof newWords === "object" && !Array.isArray(newWords)) {
            setTranslations(prev => ({ ...prev, [language]: newWords }));
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          console.error("Backend translation API failed, falling back.");
        }
      }
    };
    fetchTranslation();

    return () => controller.abort();
  }, [language]);

  const t = (key: string) => {
    return translations[language]?.[key] || defaultTranslations.hi[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}