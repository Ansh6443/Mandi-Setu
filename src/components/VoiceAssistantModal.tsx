"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SpeechRecognitionResultEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export default function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startListening = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = async (event: SpeechRecognitionResultEvent) => {
      const userSpeech = event.results[0][0].transcript;
      setTranscript(userSpeech);
      setIsListening(false);
      await askAssistant(userSpeech);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const languageCode = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";
    utterance.lang = languageCode;
    utterance.rate = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) =>
      language === "hi"
        ? voice.lang.toLowerCase().includes("hi") || /swara|kalpana/i.test(voice.name)
        : voice.lang.toLowerCase().startsWith(languageCode.slice(0, 2)),
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  const askAssistant = async (query: string) => {
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";

    try {
      const res = await fetch(`${apiUrl}/api/voice/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          message: query,
          lang: language,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        response?: string;
        message?: string;
        text?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Voice assistant service returned ${res.status}.`);
      }

      const reply = data.reply || data.response || data.message || data.text;
      if (!reply) {
        throw new Error("Voice assistant returned an empty response.");
      }
      setResponse(reply);
      speakResponse(reply);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : "Voice assistant is unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "1rem"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "1.5rem",
        maxWidth: "420px",
        width: "100%",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Kisan Setu Sahayak</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{
          minHeight: "100px",
          background: "#f9fafb",
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "0.95rem"
        }}>
          {transcript && <p style={{ margin: "0 0 0.5rem 0", color: "#374151" }}><strong>You:</strong> {transcript}</p>}
          {isLoading && <p style={{ margin: 0, color: "#6b7280" }}>Gemini is thinking...</p>}
          {response && <p style={{ margin: 0, color: "#065f46" }}><strong>Sahayak:</strong> {response}</p>}
          {!transcript && !isLoading && !response && (
            <p style={{ margin: 0, color: "#9ca3af" }}>Tap the microphone to speak your query...</p>
          )}
        </div>

        <button
          onClick={startListening}
          disabled={isListening || isLoading}
          style={{
            padding: "0.75rem",
            backgroundColor: isListening ? "#dc2626" : "#059669",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: isListening ? "default" : "pointer"
          }}
        >
          {isListening ? "Listening..." : "Tap to Speak"}
        </button>
      </div>
    </div>
  );
}