"use client";

import { SpeakerHigh } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

export default function VoiceAssistantFab() {
  const pathname = usePathname();
  const isFarmerApp = pathname === "/farmer";

  return (
    <button
      className={`voice-assistant-fab${isFarmerApp ? " in-app" : ""}`}
      type="button"
      aria-label="आवाज़ सहायता खोलें"
      onClick={() => console.log("Voice assistant placeholder")}
    >
      <SpeakerHigh size={24} weight="bold" color="#fff" aria-hidden="true" />
    </button>
  );
}