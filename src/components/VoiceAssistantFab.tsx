"use client";

import { useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import VoiceAssistantModal from "@/components/VoiceAssistantModal";

export default function VoiceAssistantFab() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isFarmerApp = pathname === "/farmer";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`voice-assistant-fab${isFarmerApp ? " in-app" : ""}`}
        type="button"
        aria-label={t("voiceHelp") || "Voice Assistant"}
        onClick={() => setIsOpen(true)}
      >
        <SpeakerHigh size={24} weight="bold" color="#fff" aria-hidden="true" />
      </button>

      {isOpen && (
        <VoiceAssistantModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}