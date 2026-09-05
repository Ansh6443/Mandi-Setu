"use client";

import { Microphone, Warning } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

type SosState = "default" | "listening" | "sent";

export default function VoiceSOSButton() {
  const [sosState, setSosState] = useState<SosState>("default");
  const sentTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (sentTimeout.current !== null) window.clearTimeout(sentTimeout.current);
  }, []);

  function handleClick() {
    if (sosState === "default") {
      setSosState("listening");
      sentTimeout.current = window.setTimeout(() => setSosState("sent"), 1500);
      return;
    }

    if (sosState === "sent") {
      setSosState("default");
    }
  }

  const content = {
    default: "तौल में गड़बड़ी? बोलकर शिकायत दर्ज करें",
    listening: "सुन रहा है...",
    sent: "शिकायत दर्ज",
  }[sosState];

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 font-bold text-white shadow-md transition-all duration-200 active:scale-95"
    >
      {sosState === "listening" ? (
        <Microphone size={22} aria-hidden="true" />
      ) : (
        <Warning size={22} aria-hidden="true" />
      )}
      <span>{content}</span>
    </button>
  );
}
