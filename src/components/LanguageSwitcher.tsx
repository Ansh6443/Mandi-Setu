"use client";
import { Translate } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n"; 

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    
    // Default fallback (Bina backend ke yeh dikhega)
    const [langs, setLangs] = useState([
        { code: "hi", label: "हिन्दी" },
        { code: "en", label: "English" }
    ]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchLanguages = async () => {
            try {
                // Apna aap backend URL uthayega Vercel se
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                if (!apiUrl) return;

                const response = await fetch(`${apiUrl}/api/languages`, { signal: controller.signal });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const supportedLanguages = data.filter(
                            (item): item is { code: string; label: string } =>
                                typeof item?.code === "string" &&
                                typeof item?.label === "string" &&
                                ["hi", "en"].includes(item.code),
                        );
                        if (supportedLanguages.length > 0) {
                            setLangs(supportedLanguages);
                        }
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
                onChange={(e) => setLanguage(e.target.value)}
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