"use client";
import { Translate } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/storage-keys";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [langs, setLangs] = useState<Array<{ code: string; label: string }>>([
        { code: "hi", label: "हिन्दी" },
        { code: "en", label: "English" },
        { code: "pa", label: "ਪੰਜਾਬੀ" },
        { code: "bho", label: "भोजपुरी" },
        { code: "mr", label: "मराठी" },
        { code: "gu", label: "ગુજરાતી" },
        { code: "bn", label: "বাংলা" },
        { code: "te", label: "తెలుగు" },
        { code: "ta", label: "தமிழ்" },
        { code: "kn", label: "ಕನ್ನಡ" },
        { code: "ml", label: "മലയാളം" },
        { code: "or", label: "ଓଡ଼ିଆ" },
        { code: "as", label: "অসমীয়া" },
        { code: "ur", label: "اردو" },
        { code: "mai", label: "मैथिली" },
        { code: "raj", label: "राजस्थानी" },
        { code: "hr", label: "हरियाणवी" },
    ]);

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        try {
            window.localStorage.setItem(STORAGE_KEYS.language, newLanguage);
        } catch {
            // Continue with the in-memory language when storage is unavailable.
        }
        window.location.reload();
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchLanguages = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";
                if (!apiUrl) return;

                const response = await fetch(`${apiUrl}/api/languages`, { signal: controller.signal });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const backendLanguages = data.filter(
                            (item): item is { code: string; label: string } =>
                                typeof item?.code === "string" && typeof item?.label === "string",
                        );
                        if (backendLanguages.length > 0) setLangs(backendLanguages);
                    }
                }
            } catch {
                if (!controller.signal.aborted) {
                    console.log("Backend not connected yet, using local languages.");
                }
            }
        };
        fetchLanguages();

        return () => controller.abort();
    }, []);

    return (
        <label className="language-switcher flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:border-green-500 focus-within:ring-2 focus-within:ring-green-600 cursor-pointer transition-colors">
            <Translate size={20} className="text-green-700" aria-hidden="true" />
            <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-gray-800 text-sm font-medium outline-none cursor-pointer appearance-none pr-2"
            >
                {langs.map((l) => (
                    <option key={l.code} value={l.code}>
                        {l.label}
                    </option>
                ))}
            </select>
        </label>
    );
}