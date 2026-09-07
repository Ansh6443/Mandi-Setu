"use client";
import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";

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
    netPaymentAmount: "निवल भुगतान राशि", certifiedEvidence: "कांटे का प्रमाणित साक्ष्य",
    officerPhoto: "अधिकारी द्वारा अपलोड की गई कांटे की फोटो", noPhoto: "अधिकारी द्वारा अपलोड की गई फोटो उपलब्ध नहीं है",
    verified: "Verified", farmerIdLabel: "FARMER ID", bankLinked: "NPCI / बैंक लिंक सक्रिय",
    closeAccount: "खाता बंद करें (Logout)", registered: "रजिस्टर्ड", checkIn: "मंडी चेक-इन",
    qualityWeight: "क्वालिटी जाँच और वज़न", auctionApproved: "नीलामी / स्वीकृत", dbtPayment: "DBT भुगतान",
    services: "सुविधाएं", officer: "अधिकारी", openApp: "किसान ऐप", brand: "मंडी सेतु",
    brandSubtitle: "स्मार्ट मंडी प्रोक्योरमेंट पोर्टल", speak: "बोलकर सुनें",
    heroBadge: "PS 26032 • Ministry of Consumer Affairs, Food & Public Distribution",
    heroTitle: "बिना मंडी गए, अपनी बारी जानें।",
    heroSubtitle: "सरकारी मंडी में MSP पर बेचें — स्लॉट बुक करें, लाइव कतार देखें, सीधा भुगतान पाएं।",
    connectedMandis: "मंडियां जुड़ीं", waitReduction: "औसत प्रतीक्षा में कमी",
    availableLanguages: "भाषाएं उपलब्ध", prototypeEstimate: "(प्रोटोटाइप अनुमान)",
    farmerApp: "किसान ऐप खोलें", officerPortal: "अधिकारी पोर्टल",
    liveCentres: "लाइव — आज के केंद्र", updating: "अपडेट हो रहा है",
    sameBoard: "एक ही बोर्ड को तीन तरीकों से पढ़ें: PWA ऐप, SMS या गेट पर लगा डिस्प्ले।",
    mainServices: "हमारी मुख्य सुविधाएं", smartFarming: "स्मार्ट खेती, स्मार्ट व्यापार",
    booking: "स्मार्ट स्लॉट बुकिंग", bookingDescription: "घर बैठे मंडी में अपनी फसल बेचने का दिन और समय चुनें। भीड़ से बचें और अपना समय बचाएं।",
    tracking: "लाइव स्टेटस ट्रैकिंग", trackingDescription: "मंडी गेट-पास से लेकर तौल और गुणवत्ता चेक तक हर कदम की लाइव अपडेट पाएं।",
    payment: "DBT व डिजिटल J-Form", paymentDescription: "नीलामी के तुरंत बाद सिस्टम जनरेटेड J-Form और सीधा बैंक खाते में भुगतान।",
    footer: "© 2026 भारत सरकार (प्रोटोटाइप)। सभी अधिकार सुरक्षित।",
    govIssue: "समस्या समाधान", govMinistry: "भारत सरकार | उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय",
    mainNavigation: "मुख्य नेविगेशन", mandiSetuHome: "मंडी सेतु होम", notifications: "सूचनाएं",
    farmerName: "राम कुमार", farmerIdValue: "MH-26032-4812", closeReceipt: "रसीद बंद करें",
    stopSpeaking: "बोलना बंद करें", speakPayment: "भुगतान विवरण सुनें", onion: "प्याज", wheat: "गेहूँ",
    potato: "आलू", tomato: "टमाटर", soybean: "सोयाबीन", today: "आज", tomorrow: "कल",
    dayAfter: "परसों", monday: "सोम", tuesday: "मंगल", wednesday: "बुध", thursday: "गुरु",
    august: "अगस्त", september: "सितंबर", gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी",
    kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी",
    available: "खाली", availableCount: "उपलब्ध", liveGate: "LIVE GATE #2", tokenNumber: "टोकन",
    minutesWait: "मिनट प्रतीक्षा", minWait: "मिनट प्रतीक्षा", pageError: "कुछ समस्या आ गई", tryAgain: "फिर कोशिश करें",
    voiceHelp: "आवाज़ सहायता खोलें", sosDefault: "तौल में गड़बड़ी? बोलकर शिकायत दर्ज करें", sosListening: "सुन रहा है...", sosSent: "शिकायत दर्ज",
    officerConsole: "अधिकारी कंसोल", officerConsoleVersion: "Officer Console v1.0", officerName: "सुनील पाटील",
    officerMandi: "आज़ादपुर मंडी", mainMenu: "मुख्य मेनू", viewFarmerApp: "किसान ऐप देखें",
    dashboard: "डैशबोर्ड", liveQueue: "लाइव कतार", liveWeighment: "लाइव तौल", weighmentPayment: "तौल एवं भुगतान", settings: "मंडी सेटिंग्स", reports: "रिपोर्ट",
    officerDashboard: "आज का डैशबोर्ड", todayMandi: "गुरुवार, 27 अगस्त 2026 · आज़ादपुर मंडी", todayCapacity: "आज की क्षमता", availableSlots: "कुल उपलब्ध स्लॉट",
    booked: "बुक किए गए", totalTokens: "आज के कुल टोकन", arrived: "पहुंचे (चेक-इन)", atGate: "गेट पर उपस्थित", complete: "पूर्ण", paid: "भुगतान हो चुका",
    averageWait: "औसत प्रतीक्षा", basedOnFarmers: "पिछले 50 किसानों पर आधारित", nextStep: "अगला कदम", callFarmer: "प्रतीक्षारत किसान को काउंटर पर बुलाएं",
    voiceAnnouncement: "हिंदी में वास्तविक ध्वनि उद्घोषणा (Web Speech API)", callNextToken: "अगला टोकन बुलाएं", noFarmerWaiting: "अभी कोई किसान प्रतीक्षा में नहीं है",
    tokenCalled: "टोकन #{token} — {name} को बुलाया गया", weighingStarted: "टोकन #{token} की तौल शुरू हुई", slotAssigned: "टोकन #{token} के लिए स्लॉट असाइन किया गया",
    queueOverview: "आज की कतार — एक नज़र में", fullList: "पूरी सूची", cropAndQuantity: "फसल एवं मात्रा", slotTime: "स्लॉट समय", action: "एक्शन",
    operationalSnapshot: "ऑपरेशनल स्नैपशॉट", gatePassIssued: "गेट पास जारी", activeFarmers: "सक्रिय किसान", todayPayment: "आज का भुगतान", pendingReview: "लंबित समीक्षा",
    manualIntervention: "मैनुअल हस्तक्षेप", weightVerification: "वज़न सत्यापन", qualityInspection: "गुणवत्ता निरीक्षण", high: "उच्च", medium: "मध्यम",
    searchQueue: "टोकन, नाम या फार्मर ID खोजें...", weeklyReport: "साप्ताहिक रिपोर्ट", servedFarmers: "पिछले 7 दिनों में सेवा प्राप्त किसान",
    totalFarmersWeek: "इस सप्ताह कुल किसान", totalPurchaseWeek: "इस सप्ताह कुल खरीद मूल्य", dailyFarmers: "दैनिक किसान संख्या", waitingAverage: "पिछले 50 किसानों के औसत पर आधारित प्रतीक्षा-समय के साथ",
    mandiSettings: "मंडी सेटिंग्स", settingsDescription: "क्षमता और आज की फसल दरें यहाँ से नियंत्रित करें", mandiStatus: "मंडी स्थिति", mandiOpen: "खुली है — किसान अभी बुकिंग कर सकते हैं", mandiClosed: "बंद है — किसान बुकिंग नहीं कर सकते",
    toggleMandiStatus: "मंडी स्थिति बदलें", totalCapacity: "आज की कुल क्षमता (स्लॉट)", cropRates: "आज की फसल दरें (₹ / क्विंटल)", rateDescription: "यह दरें तौल स्क्रीन में स्वतः दिखाई जाती हैं — यहाँ बदलाव से नई गणना पर असर पड़ेगा।", rateLabel: "दर", changeRate: "दर बदलनी है?", openSettings: "मंडी सेटिंग्स खोलें",
    crop: "फसल", actualWeight: "वास्तविक तौल (क्विंटल में)", enterActualWeight: "वास्तविक तौल दर्ज करें", estimatedAmount: "अनुमानित राशि (₹)", ratePerQuintal: "दर / क्विंटल (₹) — मंडी सेटिंग्स से",
    generateJForm: "J-Form जनरेट करें और DBT भेजें", submitted: "दर्ज किया गया", livePhoto: "लाइव फोटो लें", retakePhoto: "फिर से लें", takeScalePhoto: "स्केल की फ़ोटो लें", photoAlt: "कांटे की लाइव फ़ोटो",
    reasonPhotoUnavailable: "कारण बताएं (फ़ोटो उपलब्ध नहीं)", photoReasonPlaceholder: "जैसे: camera not working", recordedWithoutPhoto: "फ़ोटो के बिना दर्ज", submit: "जमा करें", takePhotoAndWeight: "फ़ोटो लें और वज़न दर्ज करें", correctInfo: "जानकारी सही है, बटन पर क्लिक करें",
    digitalPreview: "डिजिटल J-Form — पूर्वावलोकन", grossAmount: "सकल राशि", mandiTax: "मंडी टैक्स (1%)", netPayment: "निवल भुगतान",
    receiptToken: "टोकन T-114", farmerLocation: "पिंपलगांव बसवंत, नासिक (महाराष्ट्र)", bankName: "State Bank of India (SBI) ****4521", pageNotFound: "पेज नहीं मिला", goHome: "होम पेज पर जाएं", gpsVerified: "GPS सत्यापित", timeRecorded: "समय दर्ज",
    secureLogin: "सुरक्षित कर्मचारी लॉगिन", officerPortalTitle: "मंडी अधिकारी पोर्टल", officerLoginSubtitle: "कतार, तौल और भुगतान — एक ही डैशबोर्ड से प्रबंधित करें।", employeeId: "कर्मचारी आईडी (Employee ID)", assignedMandi: "तैनाती मंडी (Assigned Mandi)", securePin: "सुरक्षित पिन (6-अंक)", secureLoginButton: "सुरक्षित लॉगिन (Secure Login)", authorizedStaff: "केवल अधिकृत DoCA / मंडी बोर्ड कर्मचारियों के लिए", liveMandiActive: "मंडी खुली है — लाइव अपडेट सक्रिय", logout: "लॉग आउट", queueDescription: "आज बुक किए गए सभी किसान — रियल-टाइम स्टेटस"
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
    netPaymentAmount: "Net payment amount", certifiedEvidence: "Certified scale evidence",
    officerPhoto: "Scale photo uploaded by the officer", noPhoto: "No photo uploaded by the officer is available",
    verified: "Verified", farmerIdLabel: "FARMER ID", bankLinked: "NPCI / Bank link active",
    closeAccount: "Close account (Logout)", registered: "Registered", checkIn: "Mandi check-in",
    qualityWeight: "Quality check and weighing", auctionApproved: "Auction / approved", dbtPayment: "DBT payment",
    services: "Services", officer: "Officer", openApp: "Farmer App", brand: "Mandi Setu",
    brandSubtitle: "Smart mandi procurement portal", speak: "Listen aloud",
    heroBadge: "PS 26032 • Ministry of Consumer Affairs, Food & Public Distribution",
    heroTitle: "Know your turn, without visiting the mandi.",
    heroSubtitle: "Sell at MSP in a government mandi: book a slot, track the live queue, and get paid directly.",
    connectedMandis: "Connected mandis", waitReduction: "Average wait reduction",
    availableLanguages: "Languages available", prototypeEstimate: "(Prototype estimate)",
    farmerApp: "Open Farmer App", officerPortal: "Officer Portal",
    liveCentres: "LIVE — TODAY'S CENTRES", updating: "Updating",
    sameBoard: "One board, three ways to read it: the PWA app, SMS, or the physical display at the gate.",
    mainServices: "Our core services", smartFarming: "Smarter farming, smarter trade",
    booking: "Smart slot booking", bookingDescription: "Choose a day and time to sell your crop at the mandi from home. Skip the crowd and save time.",
    tracking: "Live status tracking", trackingDescription: "Get live updates at every step, from the mandi gate pass to weighing and quality checks.",
    payment: "DBT and digital J-Form", paymentDescription: "Receive a system-generated J-Form and direct bank payment immediately after the auction.",
    footer: "© 2026 Government of India (Prototype). All rights reserved.",
    secureLogin: "Secure employee login", officerPortalTitle: "Mandi officer portal", officerLoginSubtitle: "Manage queue, weighing, and payments from one dashboard.", employeeId: "Employee ID", assignedMandi: "Assigned Mandi", securePin: "Secure PIN (6 digits)", secureLoginButton: "Secure Login", authorizedStaff: "For authorized DoCA / mandi board employees only", liveMandiActive: "Mandi open — live updates active", logout: "Log out", queueDescription: "All farmers booked today — real-time status",
    govIssue: "Issue Resolution", govMinistry: "Government of India | Ministry of Consumer Affairs, Food & Public Distribution",
    mainNavigation: "Main navigation", mandiSetuHome: "Mandi Setu home", notifications: "Notifications", farmerName: "Ram Kumar", farmerIdValue: "MH-26032-4812", closeReceipt: "Close receipt", pageNotFound: "Page not found", goHome: "Go to home", gpsVerified: "GPS verified", timeRecorded: "Time recorded",
    stopSpeaking: "Stop speaking", speakPayment: "Speak payment details", onion: "Onion", wheat: "Wheat", potato: "Potato", tomato: "Tomato", soybean: "Soybean", today: "Today", tomorrow: "Tomorrow", dayAfter: "Day after", monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", august: "August", september: "September",
    gorakhpurMandi: "Gorakhpur Mandi", lucknowMandi: "Lucknow Dubagga Mandi", kanpurMandi: "Kanpur Nawabganj Mandi", varanasiMandi: "Varanasi Mandi Samiti", ayodhyaMandi: "Ayodhya Krishi Mandi", available: "available", availableCount: "available", liveGate: "LIVE GATE #2", tokenNumber: "Token", minutesWait: "min wait", minWait: "min wait", pageError: "Something went wrong", tryAgain: "Try again", voiceHelp: "Open voice assistance", sosDefault: "Issue with weighing? Register a complaint by voice", sosListening: "Listening...", sosSent: "Complaint registered",
    officerConsole: "Officer Console", officerConsoleVersion: "Officer Console v1.0", officerName: "Sunil Patil", officerMandi: "Azadpur Mandi", mainMenu: "Main menu", viewFarmerApp: "View farmer app", dashboard: "Dashboard", liveQueue: "Live queue", liveWeighment: "Live weighing", weighmentPayment: "Weighment and payment", settings: "Mandi settings", reports: "Reports", officerDashboard: "Today's dashboard", todayMandi: "Thursday, 27 August 2026 · Azadpur Mandi", todayCapacity: "Today's capacity", availableSlots: "Total available slots", booked: "Booked", totalTokens: "Total tokens today", arrived: "Arrived (check-in)", atGate: "Present at gate", complete: "Complete", paid: "Payment completed", averageWait: "Average wait", basedOnFarmers: "Based on the last 50 farmers", nextStep: "Next step", callFarmer: "Call the waiting farmer to the counter", voiceAnnouncement: "Real voice announcement in Hindi (Web Speech API)", callNextToken: "Call next token", noFarmerWaiting: "No farmer is waiting right now", tokenCalled: "Token #{token} — {name} was called", weighingStarted: "Weighing started for token #{token}", slotAssigned: "Slot assigned for token #{token}", queueOverview: "Today's queue — at a glance", fullList: "Full list", cropAndQuantity: "Crop and quantity", slotTime: "Slot time", action: "Action", operationalSnapshot: "Operational snapshot", gatePassIssued: "Gate passes issued", activeFarmers: "Active farmers", todayPayment: "Today's payment", pendingReview: "Pending review", manualIntervention: "Manual intervention", weightVerification: "Weight verification", qualityInspection: "Quality inspection", high: "High", medium: "Medium", searchQueue: "Search token, name or Farmer ID...", weeklyReport: "Weekly report", servedFarmers: "Farmers served in the last 7 days", totalFarmersWeek: "Total farmers this week", totalPurchaseWeek: "Total purchase value this week", dailyFarmers: "Daily farmer count", waitingAverage: "Wait time based on the average of the last 50 farmers", mandiSettings: "Mandi settings", settingsDescription: "Control capacity and today's crop rates here", mandiStatus: "Mandi status", mandiOpen: "Open — farmers can book now", mandiClosed: "Closed — farmers cannot book", toggleMandiStatus: "Toggle mandi status", totalCapacity: "Total capacity today (slots)", cropRates: "Today's crop rates (₹ / quintal)", rateDescription: "These rates appear automatically on the weighing screen — changes affect the next calculation.", rateLabel: "Rate", changeRate: "Want to change the rate?", openSettings: "Open mandi settings", crop: "Crop", actualWeight: "Actual weight (in quintals)", enterActualWeight: "Enter actual weight", estimatedAmount: "Estimated amount (₹)", ratePerQuintal: "Rate / quintal (₹) — from mandi settings", generateJForm: "Generate J-Form and send DBT", submitted: "Recorded", livePhoto: "Take live photo", retakePhoto: "Retake", takeScalePhoto: "Take scale photo", photoAlt: "Live scale photo", reasonPhotoUnavailable: "Reason (photo unavailable)", photoReasonPlaceholder: "e.g. camera not working", recordedWithoutPhoto: "Recorded without photo", submit: "Submit", takePhotoAndWeight: "Take photo and enter weight", correctInfo: "Information is correct, click the button", digitalPreview: "Digital J-Form — preview", grossAmount: "Gross amount", mandiTax: "Mandi tax (1%)", netPayment: "Net payment", bankName: "State Bank of India (SBI) ****4521"
  }
};

const regionalOverrides: Record<string, Record<string, string>> = {
  pa: {
    language: "ਭਾਸ਼ਾ", home: "ਮੁੱਖ ਪੰਨਾ", navBooking: "ਬੁਕਿੰਗ", status: "ਸਥਿਤੀ", payments: "ਭੁਗਤਾਨ", profile: "ਪ੍ਰੋਫਾਈਲ", services: "ਸੇਵਾਵਾਂ", officer: "ਅਧਿਕਾਰੀ", openApp: "ਕਿਸਾਨ ਐਪ", farmerApp: "ਕਿਸਾਨ ਐਪ ਖੋਲ੍ਹੋ", officerPortal: "ਅਧਿਕਾਰੀ ਪੋਰਟਲ", liveTracking: "ਲਾਈਵ ਟ੍ਰੈਕਿੰਗ", registered: "ਰਜਿਸਟਰਡ", checkIn: "ਮੰਡੀ ਚੈੱਕ-ਇਨ", qualityWeight: "ਗੁਣਵੱਤਾ ਜਾਂਚ ਅਤੇ ਤੋਲ", auctionApproved: "ਨਿਲਾਮੀ / ਮਨਜ਼ੂਰ", dbtPayment: "DBT ਭੁਗਤਾਨ", estimatedWait: "ਅਨੁਮਾਨਿਤ ਉਡੀਕ", paymentSuccessful: "ਭੁਗਤਾਨ ਸਫਲ", approved: "ਮਨਜ਼ੂਰ", deposited: "ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾ", bookSlotTitle: "ਸਲਾਟ ਬੁੱਕ ਕਰੋ", chooseMandi: "ਮੰਡੀ ਚੁਣੋ", chooseCrop: "ਫਸਲ ਚੁਣੋ ਅਤੇ ਮਾਤਰਾ ਦਰਜ ਕਰੋ", chooseDate: "ਤਾਰੀਖ ਚੁਣੋ", chooseTime: "ਸਮਾਂ ਚੁਣੋ", secureBooking: "ਬੁਕਿੰਗ ਪੱਕੀ ਕਰੋ", quickServices: "ਤੁਰੰਤ ਸੇਵਾਵਾਂ", help: "ਮਦਦ", callForHelp: "ਮਦਦ ਲਈ ਕਾਲ ਕਰੋ", live: "ਲਾਈਵ", todayPrice: "ਅੱਜ ਦੇ ਭਾਅ", noBooking: "ਕੋਈ ਸਰਗਰਮ ਬੁਕਿੰਗ ਨਹੀਂ", bookNewSlot: "ਨਵਾਂ ਸਲਾਟ ਬੁੱਕ ਕਰੋ", footer: "© 2026 ਭਾਰਤ ਸਰਕਾਰ। ਸਾਰੇ ਅਧਿਕਾਰ ਰਾਖਵੇਂ ਹਨ।", onion: "ਪਿਆਜ਼", wheat: "ਕਣਕ", potato: "ਆਲੂ", tomato: "ਟਮਾਟਰ", soybean: "ਸੋਇਆਬੀਨ"
  },
  bho: {
    language: "भाषा", home: "होम", navBooking: "बुकिंग", status: "स्थिति", payments: "भुगतान", profile: "प्रोफाइल", services: "सुविधा", officer: "अधिकारी", openApp: "किसान ऐप", farmerApp: "किसान ऐप खोलीं", officerPortal: "अधिकारी पोर्टल", liveTracking: "लाइव ट्रैकिंग", registered: "रजिस्टर", checkIn: "मंडी चेक-इन", qualityWeight: "गुणवत्ता जांच आ तौल", auctionApproved: "नीलामी / मंजूर", dbtPayment: "DBT भुगतान", estimatedWait: "अनुमानित इंतजार", paymentSuccessful: "भुगतान सफल", approved: "मंजूर", deposited: "खाता में जमा", bookSlotTitle: "स्लॉट बुक करीं", chooseMandi: "मंडी चुनीं", chooseCrop: "फसल चुनीं आ मात्रा लिखीं", chooseDate: "तारीख चुनीं", chooseTime: "समय चुनीं", secureBooking: "बुकिंग पक्का करीं", quickServices: "जल्दी सेवा", help: "मदद", callForHelp: "मदद खातिर फोन करीं", live: "लाइव", todayPrice: "आज के भाव", noBooking: "कवनो चालू बुकिंग नइखे", bookNewSlot: "नया स्लॉट बुक करीं", footer: "© 2026 भारत सरकार। सभे अधिकार सुरक्षित।", onion: "प्याज", wheat: "गेहूँ", potato: "आलू", tomato: "टमाटर", soybean: "सोयाबीन"
  },
  mr: {
    language: "भाषा", home: "मुख्यपृष्ठ", navBooking: "बुकिंग", status: "स्थिती", payments: "पेमेंट", profile: "प्रोफाइल", services: "सेवा", officer: "अधिकारी", openApp: "शेतकरी अॅप", farmerApp: "शेतकरी अॅप उघडा", officerPortal: "अधिकारी पोर्टल", liveTracking: "थेट ट्रॅकिंग", registered: "नोंदणी", checkIn: "मंडी चेक-इन", qualityWeight: "गुणवत्ता तपासणी आणि वजन", auctionApproved: "लिलाव / मंजूर", dbtPayment: "DBT पेमेंट", estimatedWait: "अंदाजे प्रतीक्षा", paymentSuccessful: "पेमेंट यशस्वी", approved: "मंजूर", deposited: "खात्यात जमा", bookSlotTitle: "स्लॉट बुक करा", chooseMandi: "मंडी निवडा", chooseCrop: "पीक आणि प्रमाण निवडा", chooseDate: "तारीख निवडा", chooseTime: "वेळ निवडा", secureBooking: "बुकिंग निश्चित करा", quickServices: "जलद सेवा", help: "मदत", callForHelp: "मदतीसाठी कॉल करा", live: "थेट", todayPrice: "आजचे भाव", noBooking: "सक्रिय बुकिंग नाही", bookNewSlot: "नवीन स्लॉट बुक करा", footer: "© 2026 भारत सरकार. सर्व हक्क राखीव.", onion: "कांदा", wheat: "गहू", potato: "बटाटा", tomato: "टोमॅटो", soybean: "सोयाबीन"
  },
  gu: {
    language: "ભાષા", home: "હોમ", navBooking: "બુકિંગ", status: "સ્થિતિ", payments: "ચુકવણી", profile: "પ્રોફાઇલ", services: "સુવિધાઓ", officer: "અધિકારી", openApp: "ખેડૂત એપ", farmerApp: "ખેડૂત એપ ખોલો", officerPortal: "અધિકારી પોર્ટલ", liveTracking: "લાઇવ ટ્રેકિંગ", registered: "નોંધાયેલ", checkIn: "મંડી ચેક-ઇન", qualityWeight: "ગુણવત્તા તપાસ અને વજન", auctionApproved: "હરાજી / મંજૂર", dbtPayment: "DBT ચુકવણી", estimatedWait: "અંદાજિત રાહ", paymentSuccessful: "ચુકવણી સફળ", approved: "મંજૂર", deposited: "ખાતામાં જમા", bookSlotTitle: "સ્લોટ બુક કરો", chooseMandi: "મંડી પસંદ કરો", chooseCrop: "પાક અને જથ્થો પસંદ કરો", chooseDate: "તારીખ પસંદ કરો", chooseTime: "સમય પસંદ કરો", secureBooking: "બુકિંગ કન્ફર્મ કરો", quickServices: "ઝડપી સેવાઓ", help: "મદદ", callForHelp: "મદદ માટે કૉલ કરો", live: "લાઇવ", todayPrice: "આજના ભાવ", noBooking: "કોઈ સક્રિય બુકિંગ નથી", bookNewSlot: "નવો સ્લોટ બુક કરો", footer: "© 2026 ભારત સરકાર. બધા અધિકારો સુરક્ષિત.", onion: "ડુંગળી", wheat: "ઘઉં", potato: "બટાકા", tomato: "ટામેટા", soybean: "સોયાબીન"
  },
  bn: {
    language: "ভাষা", home: "হোম", navBooking: "বুকিং", status: "স্থিতি", payments: "পেমেন্ট", profile: "প্রোফাইল", services: "পরিষেবা", officer: "অফিসার", openApp: "কৃষক অ্যাপ", farmerApp: "কৃষক অ্যাপ খুলুন", officerPortal: "অফিসার পোর্টাল", liveTracking: "লাইভ ট্র্যাকিং", registered: "নিবন্ধিত", checkIn: "মন্ডি চেক-ইন", qualityWeight: "গুণমান পরীক্ষা ও ওজন", auctionApproved: "নিলাম / অনুমোদিত", dbtPayment: "DBT পেমেন্ট", estimatedWait: "আনুমানিক অপেক্ষা", paymentSuccessful: "পেমেন্ট সফল", approved: "অনুমোদিত", deposited: "অ্যাকাউন্টে জমা", bookSlotTitle: "স্লট বুক করুন", chooseMandi: "মন্ডি বেছে নিন", chooseCrop: "ফসল ও পরিমাণ বেছে নিন", chooseDate: "তারিখ বেছে নিন", chooseTime: "সময় বেছে নিন", secureBooking: "বুকিং নিশ্চিত করুন", quickServices: "দ্রুত পরিষেবা", help: "সাহায্য", callForHelp: "সাহায্যের জন্য কল করুন", live: "লাইভ", todayPrice: "আজকের দাম", noBooking: "কোনও সক্রিয় বুকিং নেই", bookNewSlot: "নতুন স্লট বুক করুন", footer: "© 2026 ভারত সরকার। সর্বস্বত্ব সংরক্ষিত।", onion: "পেঁয়াজ", wheat: "গম", potato: "আলু", tomato: "টমেটো", soybean: "সয়াবিন"
  },
  te: { language: "భాష", home: "హోమ్", navBooking: "బుకింగ్", status: "స్థితి", payments: "చెల్లింపు", profile: "ప్రొఫైల్", services: "సేవలు", officer: "అధికారి", openApp: "రైతు యాప్", farmerApp: "రైతు యాప్ తెరవండి", officerPortal: "అధికారి పోర్టల్", liveTracking: "లైవ్ ట్రాకింగ్", registered: "నమోదైంది", checkIn: "మండి చెక్-ఇన్", qualityWeight: "నాణ్యత తనిఖీ మరియు తూకం", auctionApproved: "వేలం / ఆమోదం", dbtPayment: "DBT చెల్లింపు", estimatedWait: "అంచనా నిరీక్షణ", paymentSuccessful: "చెల్లింపు విజయవంతం", approved: "ఆమోదించబడింది", deposited: "ఖాతాలో జమ", bookSlotTitle: "స్లాట్ బుక్ చేయండి", chooseMandi: "మండిని ఎంచుకోండి", chooseCrop: "పంట మరియు పరిమాణం ఎంచుకోండి", chooseDate: "తేదీ ఎంచుకోండి", chooseTime: "సమయం ఎంచుకోండి", secureBooking: "బుకింగ్ నిర్ధారించండి", quickServices: "త్వరిత సేవలు", help: "సహాయం", callForHelp: "సహాయం కోసం కాల్ చేయండి", live: "లైవ్", todayPrice: "నేటి ధరలు", noBooking: "క్రియాశీల బుకింగ్ లేదు", bookNewSlot: "కొత్త స్లాట్ బుక్ చేయండి", onion: "ఉల్లి", wheat: "గోధుమ", potato: "బంగాళాదుంప", tomato: "టమాటా", soybean: "సోయాబీన్" },
  ta: { language: "மொழி", home: "முகப்பு", navBooking: "முன்பதிவு", status: "நிலை", payments: "கட்டணம்", profile: "சுயவிவரம்", services: "சேவைகள்", officer: "அதிகாரி", openApp: "விவசாயி செயலி", farmerApp: "விவசாயி செயலியைத் திறக்கவும்", officerPortal: "அதிகாரி தளம்", liveTracking: "நேரடி கண்காணிப்பு", registered: "பதிவு செய்யப்பட்டது", checkIn: "மண்டி செக்-இன்", qualityWeight: "தரச் சோதனை மற்றும் எடை", auctionApproved: "ஏலம் / அங்கீகரிக்கப்பட்டது", dbtPayment: "DBT கட்டணம்", estimatedWait: "மதிப்பிடப்பட்ட காத்திருப்பு", paymentSuccessful: "கட்டணம் வெற்றி", approved: "அங்கீகரிக்கப்பட்டது", deposited: "கணக்கில் செலுத்தப்பட்டது", bookSlotTitle: "நேரத்தை முன்பதிவு செய்யவும்", chooseMandi: "மண்டியைத் தேர்ந்தெடுக்கவும்", chooseCrop: "பயிர் மற்றும் அளவைத் தேர்ந்தெடுக்கவும்", chooseDate: "தேதியைத் தேர்ந்தெடுக்கவும்", chooseTime: "நேரத்தைத் தேர்ந்தெடுக்கவும்", secureBooking: "முன்பதிவை உறுதி செய்யவும்", quickServices: "விரைவு சேவைகள்", help: "உதவி", callForHelp: "உதவிக்கு அழைக்கவும்", live: "நேரலை", todayPrice: "இன்றைய விலைகள்", noBooking: "செயலில் முன்பதிவு இல்லை", bookNewSlot: "புதிய நேரத்தை முன்பதிவு செய்யவும்", onion: "வெங்காயம்", wheat: "கோதுமை", potato: "உருளைக்கிழங்கு", tomato: "தக்காளி", soybean: "சோயாபீன்" },
  kn: { language: "ಭಾಷೆ", home: "ಮುಖಪುಟ", navBooking: "ಬುಕಿಂಗ್", status: "ಸ್ಥಿತಿ", payments: "ಪಾವತಿ", profile: "ಪ್ರೊಫೈಲ್", services: "ಸೇವೆಗಳು", officer: "ಅಧಿಕಾರಿ", openApp: "ರೈತ ಅಪ್ಲಿಕೇಶನ್", farmerApp: "ರೈತ ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ", officerPortal: "ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್", liveTracking: "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್", registered: "ನೋಂದಾಯಿಸಲಾಗಿದೆ", checkIn: "ಮಂಡಿ ಚೆಕ್-ಇನ್", qualityWeight: "ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಮತ್ತು ತೂಕ", auctionApproved: "ಹರಾಜು / ಅನುಮೋದನೆ", dbtPayment: "DBT ಪಾವತಿ", estimatedWait: "ಅಂದಾಜು ಕಾಯುವಿಕೆ", paymentSuccessful: "ಪಾವತಿ ಯಶಸ್ವಿ", approved: "ಅನುಮೋದಿಸಲಾಗಿದೆ", deposited: "ಖಾತೆಗೆ ಜಮಾ", bookSlotTitle: "ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ", chooseMandi: "ಮಂಡಿ ಆಯ್ಕೆಮಾಡಿ", chooseCrop: "ಬೆಳೆ ಮತ್ತು ಪ್ರಮಾಣ ಆಯ್ಕೆಮಾಡಿ", chooseDate: "ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ", chooseTime: "ಸಮಯ ಆಯ್ಕೆಮಾಡಿ", secureBooking: "ಬುಕಿಂಗ್ ಖಚಿತಪಡಿಸಿ", quickServices: "ತ್ವರಿತ ಸೇವೆಗಳು", help: "ಸಹಾಯ", callForHelp: "ಸಹಾಯಕ್ಕಾಗಿ ಕರೆ ಮಾಡಿ", live: "ಲೈವ್", todayPrice: "ಇಂದಿನ ಬೆಲೆಗಳು", noBooking: "ಸಕ್ರಿಯ ಬುಕಿಂಗ್ ಇಲ್ಲ", bookNewSlot: "ಹೊಸ ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ", onion: "ಈರುಳ್ಳಿ", wheat: "ಗೋಧಿ", potato: "ಆಲೂಗಡ್ಡೆ", tomato: "ಟೊಮೇಟೊ", soybean: "ಸೋಯಾಬೀನ್" },
  ml: { language: "ഭാഷ", home: "ഹോം", navBooking: "ബുക്കിംഗ്", status: "സ്ഥിതി", payments: "പേയ്മെന്റ്", profile: "പ്രൊഫൈൽ", services: "സേവനങ്ങൾ", officer: "ഉദ്യോഗസ്ഥൻ", openApp: "കർഷക ആപ്പ്", farmerApp: "കർഷക ആപ്പ് തുറക്കുക", officerPortal: "ഉദ്യോഗസ്ഥ പോർട്ടൽ", liveTracking: "ലൈവ് ട്രാക്കിംഗ്", registered: "രജിസ്റ്റർ ചെയ്തു", checkIn: "മണ്ടി ചെക്ക്-ഇൻ", qualityWeight: "ഗുണനിലവാര പരിശോധനയും തൂക്കവും", auctionApproved: "ലേലം / അംഗീകരിച്ചു", dbtPayment: "DBT പേയ്മെന്റ്", estimatedWait: "കണക്കാക്കിയ കാത്തിരിപ്പ്", paymentSuccessful: "പേയ്മെന്റ് വിജയിച്ചു", approved: "അംഗീകരിച്ചു", deposited: "അക്കൗണ്ടിൽ നിക്ഷേപിച്ചു", bookSlotTitle: "സ്ലോട്ട് ബുക്ക് ചെയ്യുക", chooseMandi: "മണ്ടി തിരഞ്ഞെടുക്കുക", chooseCrop: "വിളയും അളവും തിരഞ്ഞെടുക്കുക", chooseDate: "തീയതി തിരഞ്ഞെടുക്കുക", chooseTime: "സമയം തിരഞ്ഞെടുക്കുക", secureBooking: "ബുക്കിംഗ് സ്ഥിരീകരിക്കുക", quickServices: "ദ്രുത സേവനങ്ങൾ", help: "സഹായം", callForHelp: "സഹായത്തിനായി വിളിക്കുക", live: "ലൈവ്", todayPrice: "ഇന്നത്തെ വിലകൾ", noBooking: "സജീവ ബുക്കിംഗ് ഇല്ല", bookNewSlot: "പുതിയ സ്ലോട്ട് ബുക്ക് ചെയ്യുക", onion: "ഉള്ളി", wheat: "ഗോതമ്പ്", potato: "ഉരുളക്കിഴങ്ങ്", tomato: "തക്കാളി", soybean: "സോയാബീൻ" },
  or: { language: "ଭାଷା", home: "ମୂଳପୃଷ୍ଠା", navBooking: "ବୁକିଂ", status: "ସ୍ଥିତି", payments: "ଦେୟ", profile: "ପ୍ରୋଫାଇଲ", services: "ସେବା", officer: "ଅଧିକାରୀ", openApp: "ଚାଷୀ ଆପ୍", farmerApp: "ଚାଷୀ ଆପ୍ ଖୋଲନ୍ତୁ", officerPortal: "ଅଧିକାରୀ ପୋର୍ଟାଲ", liveTracking: "ଲାଇଭ୍ ଟ୍ରାକିଂ", registered: "ପଞ୍ଜୀକୃତ", checkIn: "ମଣ୍ଡି ଚେକ୍-ଇନ୍", qualityWeight: "ଗୁଣବତ୍ତା ଯାଞ୍ଚ ଏବଂ ଓଜନ", auctionApproved: "ନିଲାମ / ଅନୁମୋଦିତ", dbtPayment: "DBT ଦେୟ", estimatedWait: "ଆନୁମାନିକ ଅପେକ୍ଷା", paymentSuccessful: "ଦେୟ ସଫଳ", approved: "ଅନୁମୋଦିତ", deposited: "ଖାତାରେ ଜମା", bookSlotTitle: "ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ", chooseMandi: "ମଣ୍ଡି ବାଛନ୍ତୁ", chooseCrop: "ଫସଲ ଏବଂ ପରିମାଣ ବାଛନ୍ତୁ", chooseDate: "ତାରିଖ ବାଛନ୍ତୁ", chooseTime: "ସମୟ ବାଛନ୍ତୁ", secureBooking: "ବୁକିଂ ନିଶ୍ଚିତ କରନ୍ତୁ", quickServices: "ତ୍ୱରିତ ସେବା", help: "ସାହାଯ୍ୟ", callForHelp: "ସାହାଯ୍ୟ ପାଇଁ ଫୋନ୍ କରନ୍ତୁ", live: "ଲାଇଭ୍", todayPrice: "ଆଜିର ଦର", noBooking: "କୌଣସି ସକ୍ରିୟ ବୁକିଂ ନାହିଁ", bookNewSlot: "ନୂଆ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ", onion: "ପିଆଜ", wheat: "ଗହମ", potato: "ଆଳୁ", tomato: "ଟମାଟୋ", soybean: "ସୋୟାବିନ୍" },
  as: { language: "ভাষা", home: "মুখ্য পৃষ্ঠা", navBooking: "বুকিং", status: "স্থিতি", payments: "পেমেণ্ট", profile: "প্ৰফাইল", services: "সেৱা", officer: "বিষয়া", openApp: "কৃষক এপ", farmerApp: "কৃষক এপ খোলক", officerPortal: "বিষয়া প’ৰ্টেল", liveTracking: "লাইভ ট্ৰেকিং", registered: "পঞ্জীয়নভুক্ত", checkIn: "মণ্ডী চেক-ইন", qualityWeight: "গুণগত পৰীক্ষা আৰু ওজন", auctionApproved: "নিলাম / অনুমোদিত", dbtPayment: "DBT পেমেণ্ট", estimatedWait: "আনুমানিক অপেক্ষা", paymentSuccessful: "পেমেণ্ট সফল", approved: "অনুমোদিত", deposited: "একাউণ্টত জমা", bookSlotTitle: "স্লট বুক কৰক", chooseMandi: "মণ্ডী বাছক", chooseCrop: "শস্য আৰু পৰিমাণ বাছক", chooseDate: "তাৰিখ বাছক", chooseTime: "সময় বাছক", secureBooking: "বুকিং নিশ্চিত কৰক", quickServices: "দ্ৰুত সেৱা", help: "সহায়", callForHelp: "সহায়ৰ বাবে ফোন কৰক", live: "লাইভ", todayPrice: "আজিৰ দাম", noBooking: "কোনো সক্ৰিয় বুকিং নাই", bookNewSlot: "নতুন স্লট বুক কৰক", onion: "পিঁয়াজ", wheat: "ঘেঁহু", potato: "আলু", tomato: "বিলাহী", soybean: "সোয়াবিন" },
  ur: { language: "زبان", home: "ہوم", navBooking: "بکنگ", status: "حیثیت", payments: "ادائیگی", profile: "پروفائل", services: "خدمات", officer: "افسر", openApp: "کسان ایپ", farmerApp: "کسان ایپ کھولیں", officerPortal: "افسر پورٹل", liveTracking: "براہ راست ٹریکنگ", registered: "رجسٹرڈ", checkIn: "منڈی چیک اِن", qualityWeight: "معیار کی جانچ اور وزن", auctionApproved: "نیلامی / منظور شدہ", dbtPayment: "DBT ادائیگی", estimatedWait: "متوقع انتظار", paymentSuccessful: "ادائیگی کامیاب", approved: "منظور شدہ", deposited: "اکاؤنٹ میں جمع", bookSlotTitle: "سلاٹ بک کریں", chooseMandi: "منڈی منتخب کریں", chooseCrop: "فصل اور مقدار منتخب کریں", chooseDate: "تاریخ منتخب کریں", chooseTime: "وقت منتخب کریں", secureBooking: "بکنگ کی تصدیق کریں", quickServices: "فوری خدمات", help: "مدد", callForHelp: "مدد کے لیے کال کریں", live: "براہ راست", todayPrice: "آج کی قیمتیں", noBooking: "کوئی فعال بکنگ نہیں", bookNewSlot: "نیا سلاٹ بک کریں", onion: "پیاز", wheat: "گندم", potato: "آلو", tomato: "ٹماٹر", soybean: "سویا بین" },
  mai: { language: "भाषा", home: "घर", navBooking: "बुकिंग", status: "स्थिति", payments: "भुगतान", profile: "प्रोफाइल", services: "सेवा", officer: "अधिकारी", openApp: "किसान ऐप", farmerApp: "किसान ऐप खोलू", officerPortal: "अधिकारी पोर्टल", liveTracking: "लाइव ट्रैकिंग", registered: "पंजीकृत", checkIn: "मंडी चेक-इन", qualityWeight: "गुणवत्ता जांच आ वजन", auctionApproved: "नीलामी / स्वीकृत", dbtPayment: "DBT भुगतान", estimatedWait: "अनुमानित प्रतीक्षा", paymentSuccessful: "भुगतान सफल", approved: "स्वीकृत", deposited: "खाता में जमा", bookSlotTitle: "स्लॉट बुक करू", chooseMandi: "मंडी चुनू", chooseCrop: "फसल आ मात्रा चुनू", chooseDate: "तारीख चुनू", chooseTime: "समय चुनू", secureBooking: "बुकिंग निश्चित करू", quickServices: "त्वरित सेवा", help: "सहायता", callForHelp: "सहायता लेल फोन करू", live: "लाइव", todayPrice: "आजक भाव", noBooking: "कोनो सक्रिय बुकिंग नहि", bookNewSlot: "नव स्लॉट बुक करू", onion: "प्याज", wheat: "गेहूँ", potato: "आलू", tomato: "टमाटर", soybean: "सोयाबीन" }
};

const landingOverrides: Record<string, Record<string, string>> = {
  pa: { heroTitle: "ਮੰਡੀ ਗਏ ਬਿਨਾਂ ਆਪਣੀ ਵਾਰੀ ਜਾਣੋ।", heroSubtitle: "ਸਰਕਾਰੀ ਮੰਡੀ ਵਿੱਚ MSP ਤੇ ਵੇਚੋ — ਸਲਾਟ ਬੁੱਕ ਕਰੋ, ਲਾਈਵ ਕਤਾਰ ਵੇਖੋ ਅਤੇ ਸਿੱਧਾ ਭੁਗਤਾਨ ਪਾਓ।", connectedMandis: "ਜੁੜੀਆਂ ਮੰਡੀਆਂ", waitReduction: "ਔਸਤ ਉਡੀਕ ਵਿੱਚ ਕਮੀ", availableLanguages: "ਉਪਲਬਧ ਭਾਸ਼ਾਵਾਂ", mainServices: "ਸਾਡੀਆਂ ਮੁੱਖ ਸੇਵਾਵਾਂ", smartFarming: "ਸਮਾਰਟ ਖੇਤੀ, ਸਮਾਰਟ ਵਪਾਰ", booking: "ਸਮਾਰਟ ਸਲਾਟ ਬੁਕਿੰਗ", bookingDescription: "ਘਰ ਬੈਠੇ ਮੰਡੀ ਵਿੱਚ ਫਸਲ ਵੇਚਣ ਦਾ ਦਿਨ ਅਤੇ ਸਮਾਂ ਚੁਣੋ।", tracking: "ਲਾਈਵ ਸਥਿਤੀ ਟ੍ਰੈਕਿੰਗ", trackingDescription: "ਮੰਡੀ ਗੇਟ ਤੋਂ ਤੋਲ ਅਤੇ ਗੁਣਵੱਤਾ ਜਾਂਚ ਤੱਕ ਹਰ ਕਦਮ ਦੀ ਜਾਣਕਾਰੀ ਪਾਓ।", payment: "DBT ਅਤੇ ਡਿਜ਼ਿਟਲ J-Form", paymentDescription: "ਨੀਲਾਮੀ ਤੋਂ ਬਾਅਦ ਸਿੱਧਾ ਬੈਂਕ ਭੁਗਤਾਨ ਪਾਓ।", liveCentres: "ਲਾਈਵ — ਅੱਜ ਦੇ ਕੇਂਦਰ", updating: "ਅੱਪਡੇਟ ਹੋ ਰਿਹਾ ਹੈ", sameBoard: "ਇੱਕੋ ਬੋਰਡ ਨੂੰ PWA, SMS ਜਾਂ ਗੇਟ ਡਿਸਪਲੇਅ ਰਾਹੀਂ ਪੜ੍ਹੋ।" },
  bho: { heroTitle: "मंडी गइल बिना आपन बारी जानीं।", heroSubtitle: "सरकारी मंडी में MSP पर बेचीं — स्लॉट बुक करीं, लाइव कतार देखीं आ सीधा भुगतान पाईं।", connectedMandis: "जुड़ल मंडी", waitReduction: "औसत इंतजार में कमी", availableLanguages: "उपलब्ध भाषा", mainServices: "हमार मुख्य सुविधा", smartFarming: "स्मार्ट खेती, स्मार्ट कारोबार", booking: "स्मार्ट स्लॉट बुकिंग", bookingDescription: "घर बइठे मंडी में फसल बेचे के दिन आ समय चुनीं।", tracking: "लाइव स्थिति ट्रैकिंग", trackingDescription: "मंडी गेट से तौल आ गुणवत्ता जांच तक हर कदम के अपडेट पाईं।", payment: "DBT आ डिजिटल J-Form", paymentDescription: "नीलामी के बाद सीधा बैंक भुगतान पाईं।", liveCentres: "लाइव — आज के केंद्र", updating: "अपडेट हो रहल बा", sameBoard: "PWA ऐप, SMS या गेट डिस्प्ले से एके बोर्ड पढ़ीं।" },
  mr: { heroTitle: "मंडीत न जाता आपली पाळी जाणून घ्या.", heroSubtitle: "सरकारी मंडीत MSP वर विक्री करा — स्लॉट बुक करा, थेट रांग पहा आणि थेट पैसे मिळवा.", connectedMandis: "जोडलेल्या मंड्या", waitReduction: "सरासरी प्रतीक्षा कमी", availableLanguages: "उपलब्ध भाषा", mainServices: "आमच्या मुख्य सेवा", smartFarming: "स्मार्ट शेती, स्मार्ट व्यापार", booking: "स्मार्ट स्लॉट बुकिंग", bookingDescription: "घरबसल्या मंडीत पीक विक्रीचा दिवस आणि वेळ निवडा.", tracking: "थेट स्थिती ट्रॅकिंग", trackingDescription: "मंडी गेटपासून वजन आणि गुणवत्ता तपासणीपर्यंत प्रत्येक अपडेट मिळवा.", payment: "DBT आणि डिजिटल J-Form", paymentDescription: "लिलावानंतर थेट बँक खात्यात पैसे मिळवा.", liveCentres: "थेट — आजची केंद्रे", updating: "अपडेट होत आहे", sameBoard: "PWA अॅप, SMS किंवा गेटवरील डिस्प्लेमधून एकच बोर्ड वाचा." },
  gu: { heroTitle: "મંડી ગયા વગર તમારી વારી જાણો.", heroSubtitle: "સરકારી મંડીમાં MSP પર વેચો — સ્લોટ બુક કરો, લાઇવ કતાર જુઓ અને સીધી ચુકવણી મેળવો.", connectedMandis: "જોડાયેલી મંડીઓ", waitReduction: "સરેરાશ રાહતમાં ઘટાડો", availableLanguages: "ઉપલબ્ધ ભાષાઓ", mainServices: "અમારી મુખ્ય સેવાઓ", smartFarming: "સ્માર્ટ ખેતી, સ્માર્ટ વેપાર", booking: "સ્માર્ટ સ્લોટ બુકિંગ", bookingDescription: "ઘરે બેઠા મંડીમાં પાક વેચવાનો દિવસ અને સમય પસંદ કરો.", tracking: "લાઇવ સ્થિતિ ટ્રેકિંગ", trackingDescription: "મંડી ગેટથી વજન અને ગુણવત્તા તપાસ સુધી દરેક અપડેટ મેળવો.", payment: "DBT અને ડિજિટલ J-Form", paymentDescription: "હરાજી પછી સીધી બેંક ચુકવણી મેળવો.", liveCentres: "લાઇવ — આજના કેન્દ્રો", updating: "અપડેટ થઈ રહ્યું છે", sameBoard: "PWA એપ, SMS અથવા ગેટ ડિસ્પ્લે પરથી એક જ બોર્ડ વાંચો." },
  bn: { heroTitle: "মন্ডিতে না গিয়েই আপনার পালা জানুন।", heroSubtitle: "সরকারি মন্ডিতে MSP-তে বিক্রি করুন — স্লট বুক করুন, লাইভ সারি দেখুন এবং সরাসরি পেমেন্ট পান।", connectedMandis: "সংযুক্ত মন্ডি", waitReduction: "গড় অপেক্ষা কমেছে", availableLanguages: "উপলব্ধ ভাষা", mainServices: "আমাদের প্রধান পরিষেবা", smartFarming: "স্মার্ট কৃষি, স্মার্ট বাণিজ্য", booking: "স্মার্ট স্লট বুকিং", bookingDescription: "বাড়ি থেকে মন্ডিতে ফসল বিক্রির দিন ও সময় বেছে নিন।", tracking: "লাইভ স্ট্যাটাস ট্র্যাকিং", trackingDescription: "মন্ডি গেট থেকে ওজন ও গুণমান পরীক্ষা পর্যন্ত সব আপডেট পান।", payment: "DBT ও ডিজিটাল J-Form", paymentDescription: "নিলামের পর সরাসরি ব্যাঙ্ক পেমেন্ট পান।", liveCentres: "লাইভ — আজকের কেন্দ্র", updating: "আপডেট হচ্ছে", sameBoard: "PWA অ্যাপ, SMS বা গেটের ডিসপ্লে থেকে একই বোর্ড পড়ুন." },
  te: { heroTitle: "మండికి వెళ్లకుండానే మీ వంతు తెలుసుకోండి.", heroSubtitle: "ప్రభుత్వ మండిలో MSPకు అమ్మండి — స్లాట్ బుక్ చేసి, లైవ్ క్యూ చూసి, నేరుగా చెల్లింపు పొందండి.", connectedMandis: "కనెక్ట్ అయిన మండీలు", waitReduction: "సగటు నిరీక్షణ తగ్గింపు", availableLanguages: "అందుబాటులో ఉన్న భాషలు", mainServices: "మా ప్రధాన సేవలు", smartFarming: "స్మార్ట్ వ్యవసాయం, స్మార్ట్ వ్యాపారం", booking: "స్మార్ట్ స్లాట్ బుకింగ్", bookingDescription: "ఇంటి నుంచే పంట అమ్మే రోజు మరియు సమయాన్ని ఎంచుకోండి.", tracking: "లైవ్ స్థితి ట్రాకింగ్", trackingDescription: "మండి గేట్ నుంచి తూకం మరియు నాణ్యత తనిఖీ వరకు ప్రతి నవీకరణ పొందండి.", payment: "DBT మరియు డిజిటల్ J-Form", paymentDescription: "వేలం తర్వాత నేరుగా బ్యాంక్ చెల్లింపు పొందండి.", liveCentres: "లైవ్ — నేటి కేంద్రాలు", updating: "నవీకరిస్తోంది", sameBoard: "PWA యాప్, SMS లేదా గేట్ డిస్ప్లేలో అదే బోర్డును చూడండి." },
  ta: { heroTitle: "மண்டிக்குச் செல்லாமல் உங்கள் வரிசையை அறியுங்கள்.", heroSubtitle: "அரசு மண்டியில் MSP விலையில் விற்கவும் — நேரத்தை முன்பதிவு செய்து, நேரடி வரிசையைப் பார்த்து, நேரடி பணம் பெறவும்.", connectedMandis: "இணைக்கப்பட்ட மண்டிகள்", waitReduction: "சராசரி காத்திருப்பு குறைவு", availableLanguages: "கிடைக்கும் மொழிகள்", mainServices: "எங்கள் முக்கிய சேவைகள்", smartFarming: "சிறந்த விவசாயம், சிறந்த வணிகம்", booking: "ஸ்மார்ட் நேர முன்பதிவு", bookingDescription: "வீட்டிலிருந்தே பயிர் விற்பனை நாளையும் நேரத்தையும் தேர்ந்தெடுக்கவும்.", tracking: "நேரடி நிலை கண்காணிப்பு", trackingDescription: "மண்டி வாயிலிலிருந்து எடை மற்றும் தரச் சோதனை வரை அனைத்து தகவல்களையும் பெறுங்கள்.", payment: "DBT மற்றும் டிஜிட்டல் J-Form", paymentDescription: "ஏலத்திற்குப் பிறகு நேரடி வங்கி கட்டணம் பெறுங்கள்.", liveCentres: "நேரலை — இன்றைய மையங்கள்", updating: "புதுப்பிக்கப்படுகிறது", sameBoard: "PWA செயலி, SMS அல்லது வாயில் காட்சிப்பலகை மூலம் ஒரே பலகையைப் பாருங்கள்." },
  kn: { heroTitle: "ಮಂಡಿಗೆ ಹೋಗದೆ ನಿಮ್ಮ ಸರದಿಯನ್ನು ತಿಳಿಯಿರಿ.", heroSubtitle: "ಸರ್ಕಾರಿ ಮಂಡಿಯಲ್ಲಿ MSP ದರದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ — ಸ್ಲಾಟ್ ಬುಕ್ ಮಾಡಿ, ಲೈವ್ ಸರದಿ ನೋಡಿ ಮತ್ತು ನೇರ ಪಾವತಿ ಪಡೆಯಿರಿ.", connectedMandis: "ಸಂಪರ್ಕಿತ ಮಂಡಿಗಳು", waitReduction: "ಸರಾಸರಿ ಕಾಯುವಿಕೆ ಕಡಿತ", availableLanguages: "ಲಭ್ಯವಿರುವ ಭಾಷೆಗಳು", mainServices: "ನಮ್ಮ ಪ್ರಮುಖ ಸೇವೆಗಳು", smartFarming: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ, ಸ್ಮಾರ್ಟ್ ವ್ಯಾಪಾರ", booking: "ಸ್ಮಾರ್ಟ್ ಸ್ಲಾಟ್ ಬುಕಿಂಗ್", bookingDescription: "ಮನೆಯಿಂದಲೇ ಬೆಳೆ ಮಾರಾಟದ ದಿನ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆಮಾಡಿ.", tracking: "ಲೈವ್ ಸ್ಥಿತಿ ಟ್ರ್ಯಾಕಿಂಗ್", trackingDescription: "ಮಂಡಿ ಗೇಟ್‌ನಿಂದ ತೂಕ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆಯವರೆಗೆ ಎಲ್ಲ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.", payment: "DBT ಮತ್ತು ಡಿಜಿಟಲ್ J-Form", paymentDescription: "ಹರಾಜಿನ ನಂತರ ನೇರ ಬ್ಯಾಂಕ್ ಪಾವತಿ ಪಡೆಯಿರಿ.", liveCentres: "ಲೈವ್ — ಇಂದಿನ ಕೇಂದ್ರಗಳು", updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ", sameBoard: "PWA ಅಪ್ಲಿಕೇಶನ್, SMS ಅಥವಾ ಗೇಟ್ ಡಿಸ್ಪ್ಲೇಯಿಂದ ಒಂದೇ ಬೋರ್ಡ್ ನೋಡಿ." },
  ml: { heroTitle: "മണ്ടിയിൽ പോകാതെ നിങ്ങളുടെ ഊഴം അറിയുക.", heroSubtitle: "സർക്കാർ മണ്ടിയിൽ MSP-യിൽ വിൽക്കുക — സ്ലോട്ട് ബുക്ക് ചെയ്ത്, ലൈവ് ക്യൂ കണ്ട്, നേരിട്ട് പണം നേടുക.", connectedMandis: "ബന്ധിപ്പിച്ച മണ്ടികൾ", waitReduction: "ശരാശരി കാത്തിരിപ്പ് കുറവ്", availableLanguages: "ലഭ്യമായ ഭാഷകൾ", mainServices: "ഞങ്ങളുടെ പ്രധാന സേവനങ്ങൾ", smartFarming: "സ്മാർട്ട് കൃഷി, സ്മാർട്ട് വ്യാപാരം", booking: "സ്മാർട്ട് സ്ലോട്ട് ബുക്കിംഗ്", bookingDescription: "വീട്ടിൽ നിന്ന് വിള വിൽക്കുന്ന ദിവസവും സമയവും തിരഞ്ഞെടുക്കുക.", tracking: "ലൈവ് സ്റ്റാറ്റസ് ട്രാക്കിംഗ്", trackingDescription: "മണ്ടി ഗേറ്റ് മുതൽ തൂക്കവും ഗുണനിലവാര പരിശോധനയും വരെ എല്ലാ അപ്ഡേറ്റുകളും നേടുക.", payment: "DBTയും ഡിജിറ്റൽ J-Formയും", paymentDescription: "ലേലത്തിന് ശേഷം നേരിട്ട് ബാങ്ക് പേയ്മെന്റ് നേടുക.", liveCentres: "ലൈവ് — ഇന്നത്തെ കേന്ദ്രങ്ങൾ", updating: "അപ്ഡേറ്റ് ചെയ്യുന്നു", sameBoard: "PWA ആപ്പ്, SMS അല്ലെങ്കിൽ ഗേറ്റ് ഡിസ്പ്ലേ വഴി ഒരേ ബോർഡ് വായിക്കുക." },
  or: { heroTitle: "ମଣ୍ଡି ନଯାଇ ନିଜ ପାଳି ଜାଣନ୍ତୁ।", heroSubtitle: "ସରକାରୀ ମଣ୍ଡିରେ MSP ଦରରେ ବିକ୍ରି କରନ୍ତୁ — ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ, ଲାଇଭ୍ ଧାଡ଼ି ଦେଖନ୍ତୁ ଏବଂ ସିଧା ଦେୟ ପାଆନ୍ତୁ।", connectedMandis: "ସଂଯୁକ୍ତ ମଣ୍ଡି", waitReduction: "ହାରାହାରି ଅପେକ୍ଷା କମିଲା", availableLanguages: "ଉପଲବ୍ଧ ଭାଷା", mainServices: "ଆମର ମୁଖ୍ୟ ସେବା", smartFarming: "ସ୍ମାର୍ଟ ଚାଷ, ସ୍ମାର୍ଟ ବ୍ୟବସାୟ", booking: "ସ୍ମାର୍ଟ ସ୍ଲଟ୍ ବୁକିଂ", bookingDescription: "ଘରୁ ଫସଲ ବିକ୍ରିର ଦିନ ଓ ସମୟ ବାଛନ୍ତୁ।", tracking: "ଲାଇଭ୍ ସ୍ଥିତି ଟ୍ରାକିଂ", trackingDescription: "ମଣ୍ଡି ଗେଟ୍ ଠାରୁ ଓଜନ ଏବଂ ଗୁଣବତ୍ତା ଯାଞ୍ଚ ପର୍ଯ୍ୟନ୍ତ ଅପଡେଟ୍ ପାଆନ୍ତୁ।", payment: "DBT ଏବଂ ଡିଜିଟାଲ୍ J-Form", paymentDescription: "ନିଲାମ ପରେ ସିଧା ବ୍ୟାଙ୍କ ଦେୟ ପାଆନ୍ତୁ।", liveCentres: "ଲାଇଭ୍ — ଆଜିର କେନ୍ଦ୍ର", updating: "ଅପଡେଟ୍ ହେଉଛି", sameBoard: "PWA ଆପ୍, SMS କିମ୍ବା ଗେଟ୍ ଡିସପ୍ଲେରୁ ଏକେ ବୋର୍ଡ ପଢ଼ନ୍ତୁ।" },
  as: { heroTitle: "মণ্ডীলৈ নোযোৱাকৈ আপোনাৰ পালি জানক।", heroSubtitle: "চৰকাৰী মণ্ডীত MSP-ত বিক্ৰী কৰক — স্লট বুক কৰক, লাইভ শাৰী চাওক আৰু পোনপটীয়া পেমেণ্ট পাওক।", connectedMandis: "সংযুক্ত মণ্ডী", waitReduction: "গড় অপেক্ষা হ্ৰাস", availableLanguages: "উপলব্ধ ভাষা", mainServices: "আমাৰ মুখ্য সেৱা", smartFarming: "স্মাৰ্ট কৃষি, স্মাৰ্ট বাণিজ্য", booking: "স্মাৰ্ট স্লট বুকিং", bookingDescription: "ঘৰৰ পৰাই শস্য বিক্ৰীৰ দিন আৰু সময় বাছক।", tracking: "লাইভ স্থিতি ট্ৰেকিং", trackingDescription: "মণ্ডী গেটৰ পৰা ওজন আৰু গুণগত পৰীক্ষালৈকে প্ৰতিটো আপডেট পাওক।", payment: "DBT আৰু ডিজিটেল J-Form", paymentDescription: "নিলামৰ পিছত পোনপটীয়া বেংক পেমেণ্ট পাওক।", liveCentres: "লাইভ — আজিৰ কেন্দ্ৰ", updating: "আপডেট হৈ আছে", sameBoard: "PWA এপ, SMS বা গেট ডিছপ্লেৰ পৰা একেটা ব’ৰ্ড পঢ়ক।" },
  ur: { heroTitle: "منڈی جائے بغیر اپنی باری جانیں۔", heroSubtitle: "سرکاری منڈی میں MSP پر فروخت کریں — سلاٹ بک کریں، لائیو قطار دیکھیں اور براہ راست ادائیگی حاصل کریں۔", connectedMandis: "منسلک منڈیاں", waitReduction: "اوسط انتظار میں کمی", availableLanguages: "دستیاب زبانیں", mainServices: "ہماری اہم خدمات", smartFarming: "اسمارٹ زراعت، اسمارٹ تجارت", booking: "اسمارٹ سلاٹ بکنگ", bookingDescription: "گھر سے فصل فروخت کرنے کا دن اور وقت منتخب کریں۔", tracking: "براہ راست صورتحال کی نگرانی", trackingDescription: "منڈی گیٹ سے وزن اور معیار کی جانچ تک ہر اپ ڈیٹ حاصل کریں۔", payment: "DBT اور ڈیجیٹل J-Form", paymentDescription: "نیلامی کے بعد براہ راست بینک ادائیگی حاصل کریں۔", liveCentres: "لائیو — آج کے مراکز", updating: "اپ ڈیٹ ہو رہا ہے", sameBoard: "PWA ایپ، SMS یا گیٹ ڈسپلے سے ایک ہی بورڈ پڑھیں۔" },
  mai: { heroTitle: "मंडी नहि जाइ अपन पारी जानू।", heroSubtitle: "सरकारी मंडी में MSP पर बेचू — स्लॉट बुक करू, लाइव कतार देखू आ सीधा भुगतान पाउ।", connectedMandis: "जुड़ल मंडी", waitReduction: "औसत प्रतीक्षा में कमी", availableLanguages: "उपलब्ध भाषा", mainServices: "हमर मुख्य सुविधा", smartFarming: "स्मार्ट खेती, स्मार्ट व्यापार", booking: "स्मार्ट स्लॉट बुकिंग", bookingDescription: "घर सँ फसल बेचबाक दिन आ समय चुनू।", tracking: "लाइव स्थिति ट्रैकिंग", trackingDescription: "मंडी गेट सँ तौल आ गुणवत्ता जांच धरि सभ अपडेट पाउ।", payment: "DBT आ डिजिटल J-Form", paymentDescription: "नीलामीक बाद सीधा बैंक भुगतान पाउ।", liveCentres: "लाइव — आजुक केंद्र", updating: "अपडेट भऽ रहल अछि", sameBoard: "PWA ऐप, SMS वा गेट डिस्प्ले सँ एके बोर्ड पढ़ू।" }
};

const mandiNameTranslations: Record<string, Record<string, string>> = {
  hi: { gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी", kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी", minWait: "मिनट प्रतीक्षा" },
  en: { gorakhpurMandi: "Gorakhpur Mandi", lucknowMandi: "Lucknow Dubagga Mandi", kanpurMandi: "Kanpur Nawabganj Mandi", varanasiMandi: "Varanasi Mandi Samiti", ayodhyaMandi: "Ayodhya Krishi Mandi", minWait: "min wait" },
  pa: { gorakhpurMandi: "ਗੋਰਖਪੁਰ ਮੰਡੀ", lucknowMandi: "ਲਖਨੌ ਦੁਬਗ਼ਾ ਮੰਡੀ", kanpurMandi: "ਕਾਨਪੁਰ ਨਵਾਬਗੰਜ ਮੰਡੀ", varanasiMandi: "ਵਾਰਾਨਸੀ ਮੰਡੀ ਸਮੀਤ", ayodhyaMandi: "ਅਯੋਧਿਆ ਖੇਤੀ ਮੰਡੀ", minWait: "ਮਿੰਟ ਉਡੀਕ" },
  bho: { gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी", kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी", minWait: "मिनट इंतजार" },
  mr: { gorakhpurMandi: "गोरखपूर मंडी", lucknowMandi: "लखनौ दुबग्गा मंडी", kanpurMandi: "कानपूर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिती", ayodhyaMandi: "अयोध्या कृषी मंडी", minWait: "मिनिटे प्रतीक्षा" },
  gu: { gorakhpurMandi: "ગોરખપુર મંડી", lucknowMandi: "લખનૌ દુબગા મંડી", kanpurMandi: "કાનપુર નવાબગંજ મંડી", varanasiMandi: "વારાણસી મંડી સમિતિ", ayodhyaMandi: "અયોધ્યા કૃષિ મંડી", minWait: "મિનિટ રાહ" },
  bn: { gorakhpurMandi: "গোরখপুর মন্ডি", lucknowMandi: "লখনউ দুবগ্গা মন্ডি", kanpurMandi: "কানপুর নবাবগঞ্জ মন্ডি", varanasiMandi: "বারাণসী মন্ডি কমিটি", ayodhyaMandi: "অযোধ্যা কৃষি মন্ডি", minWait: "মিনিট অপেক্ষা" },
  te: { gorakhpurMandi: "గోరఖ్‌పూర్ మండి", lucknowMandi: "లక్నో దుబగ్గ మండి", kanpurMandi: "కాన్పూర్ నవాబ్‌గంజ్ మండి", varanasiMandi: "వారణాసి మండీ సమితి", ayodhyaMandi: "అయోధ్య క్రిషి మండి", minWait: "నిమిషాల నిరీక్షణ" },
  ta: { gorakhpurMandi: "கோரக்பூர் மண்டி", lucknowMandi: "லக்னோ துபக்கா மண்டி", kanpurMandi: "கான்பூர் நவாப்கஞ்ச் மண்டி", varanasiMandi: "வாரணாசி மண்டி சபை", ayodhyaMandi: "அயோத்தா க்ருஷி மண்டி", minWait: "நிமிட காத்திருப்பு" },
  kn: { gorakhpurMandi: "ಗೋರಖ್ಪುರ ಮಂಟಿ", lucknowMandi: "ಲಖ್ನೌ ದುಬಗಾ ಮಂಟಿ", kanpurMandi: "ಕಾನ್ಪುರ ನವಾಬ್ಗಂಜ್ ಮಂಟಿ", varanasiMandi: "ವಾರಾಣಸಿ ಮಂಟಿ ಸಮಿತಿ", ayodhyaMandi: "ಅಯೋಧ್ಯ ಕೃಷಿ ಮಂಟಿ", minWait: "ನಿಮಿಷ ಕಾಯುವಿಕೆ" },
  ml: { gorakhpurMandi: "ഗോരഖ്പൂർ മൺഡി", lucknowMandi: "ലഖ്നൗ ദുബഗ്ഗാ മൺഡി", kanpurMandi: "കാൻപുര് നവാബ്‌ഗഞ്ച് മൺഡി", varanasiMandi: "വാരാണസി മൺഡി സമിതി", ayodhyaMandi: "അയോധ്യ കൃഷി മൺഡി", minWait: "മിനിറ്റ് കാത്തിരിപ്പ്" },
  or: { gorakhpurMandi: "ଗୋରଖପୁର ମଣ୍ଡି", lucknowMandi: "ଲକ୍ନୌ ଦୁବଗ୍ଗା ମଣ୍ଡି", kanpurMandi: "କାନପୁର ନବାବଗଞ୍ଜ ମଣ୍ଡି", varanasiMandi: "ବାରାଣସୀ ମଣ୍ଡି ସମିତି", ayodhyaMandi: "ଅୟୋଧ୍ୟା କୃଷି ମଣ୍ଡି", minWait: "ମିନିଟ୍ ଅପେକ୍ଷା" },
  as: { gorakhpurMandi: "গৰখপুর মণ্ডি", lucknowMandi: "লখনউ দুবগ্গা মণ্ডি", kanpurMandi: "কানপুৰ নবাবগঞ্জ মণ্ডি", varanasiMandi: "বারাণসী মণ্ডী সমিতি", ayodhyaMandi: "অযোধ্যা কৃষি মণ্ডি", minWait: "মিনিট অপেক্ষা" },
  ur: { gorakhpurMandi: "گورکھپور منڈی", lucknowMandi: "لکھنؤ دوبگّا منڈی", kanpurMandi: "کانپور نواب گنج منڈی", varanasiMandi: "وارانسی منڈی کمیٹی", ayodhyaMandi: "ایودھیا کِشی منڈی", minWait: "منٹ انتظار" },
  mai: { gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी", kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी", minWait: "मिनट प्रतीक्षा" },
  raj: { gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी", kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी", minWait: "मिनट प्रतीक्षा" },
  hr: { gorakhpurMandi: "गोरखपुर मंडी", lucknowMandi: "लखनऊ दुबग्गा मंडी", kanpurMandi: "कानपुर नवाबगंज मंडी", varanasiMandi: "वाराणसी मंडी समिति", ayodhyaMandi: "अयोध्या कृषि मंडी", minWait: "मिनट प्रतीक्षा" },
};

for (const [code, overrides] of Object.entries(regionalOverrides)) {
  defaultTranslations[code] = {
    ...defaultTranslations.en,
    ...overrides,
    ...landingOverrides[code],
    ...(mandiNameTranslations[code] ?? {}),
  };
}
defaultTranslations.raj = { ...defaultTranslations.hi, ...(mandiNameTranslations.raj ?? {}) };
defaultTranslations.hr = { ...defaultTranslations.hi, ...(mandiNameTranslations.hr ?? {}) };

export function getFallbackTranslation(text: string, language: string): string | null {
  if (!text || language === "en") return text || null;

  const targetMap = defaultTranslations[language];
  if (!targetMap) return null;

  const englishValueToKey = Object.entries(defaultTranslations.en).find(([, value]) => value === text);
  if (englishValueToKey) {
    const translated = targetMap[englishValueToKey[0]];
    return translated || null;
  }

  const exactMatch = Object.entries(targetMap).find(([, value]) => value === text);
  return exactMatch ? exactMatch[1] : null;
}

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
      const savedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);
      if (savedLanguage) startTransition(() => setLanguage(savedLanguage));
    } catch {
      // Keep the default language when storage is unavailable.
    }
  }, []);

  // AUTOMATIC BACKEND FETCH LOGIC
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, language);
    } catch {
      // Continue rendering when storage is unavailable.
    }
    document.documentElement.lang = language;

    const controller = new AbortController();
    const fetchTranslation = async () => {
      if (defaultTranslations[language]) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";
      try {
        const response = await fetch(`${apiUrl}/api/translations?lang=${encodeURIComponent(language)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const newWords = await response.json();
        if (newWords && typeof newWords === "object" && !Array.isArray(newWords)) {
          setTranslations(prev => ({ ...prev, [language]: newWords }));
        }
      } catch {
        // Keep the Hindi dictionary until the backend translation is available.
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