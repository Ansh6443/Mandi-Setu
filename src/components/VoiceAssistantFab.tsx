"use client";

import { SpeakerHigh } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function VoiceAssistantFab() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isFarmerApp = pathname === "/farmer";

  return (
    <button
      className={`voice-assistant-fab${isFarmerApp ? " in-app" : ""}`}
      type="button"
      aria-label={t("voiceHelp")}
      onClick={() => console.log("Voice assistant placeholder")}
    >
      <SpeakerHigh size={24} weight="bold" color="#fff" aria-hidden="true" />
    </button>
  );
}