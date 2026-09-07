"use client";

import { useState } from "react";

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

interface SpeechRecognitionErrorEvent extends Event {
  error?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
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
  // SSR-safe session ID handling
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "farmer_default";
    const storedSessionId = localStorage.getItem("farmer_session_id");
    if (storedSessionId) return storedSessionId;

    const newSessionId = `farmer_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("farmer_session_id", newSessionId);
    return newSessionId;
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Tap to Speak");

  const startListening = () => {
    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapka browser voice recognition support nahi karta. Kripya Chrome ya Edge use karein.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("सुन रही हूँ... (Listening)");
    };

    recognition.onresult = async (event: SpeechRecognitionResultEvent) => {
      const userSpeech = event.results[0][0].transcript;
      setTranscript(userSpeech);
      setIsListening(false);
      await askAssistant(userSpeech);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus("आवाज़ समझ नहीं आई। दोबारा दबाएं।");
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSpeaking(false);
      setStatus("Tap to Speak");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus("Tap to Speak");
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus("Tap to Speak");
    };

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => voice.lang.toLowerCase() === "hi-in") ??
      voices.find((voice) => /swara|kalpana|google हिन्दी/i.test(voice.name));

    if (preferredVoice) utterance.voice = preferredVoice;

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const askAssistant = async (query: string) => {
    setIsLoading(true);
    setStatus("सोच रही हूँ... (Processing)");

    // URL resolution: hamesha /ask endpoint par point karega
    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
    const backendUrl = rawBase.endsWith("/ask")
      ? rawBase
      : `${rawBase.replace(/\/+$/, "")}/ask`;

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          query: query,
          session_id: sessionId,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        response?: string;
        text?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || `Voice assistant service returned ${res.status}.`);
      }

      const reply = data.reply || data.response || data.text || "उत्तर प्राप्त नहीं हुआ।";
      if (!reply) {
        throw new Error("Voice assistant returned an empty response.");
      }

      setResponse(reply);
      setStatus("Tap to Speak");
      speakResponse(reply);
    } catch (error) {
      console.error("Fetch error:", error);
      setResponse("सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।");
      setStatus("Tap to Speak");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Kisan Setu Sahayak</h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            minHeight: "100px",
            background: "#f9fafb",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        >
          {transcript && (
            <p style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>
              <strong>You:</strong> {transcript}
            </p>
          )}
          {isLoading && <p style={{ margin: 0, color: "#6b7280" }}>{status}</p>}
          {response && (
            <p style={{ margin: 0, color: "#065f46" }}>
              <strong>Sahayak:</strong> {response}
            </p>
          )}
          {!transcript && !isLoading && !response && !isSpeaking && (
            <p style={{ margin: 0, color: "#9ca3af" }}>बोलने के लिए माइक्रोफ़ोन दबाएँ।</p>
          )}
          {isSpeaking && <p style={{ margin: 0, color: "#065f46" }}>बोल रही हूँ... (Speaking)</p>}
        </div>

        <button
          onClick={startListening}
          disabled={isListening || isLoading || isSpeaking}
          className={isListening ? "voice-listening-pulse" : undefined}
          style={{
            padding: "0.75rem",
            backgroundColor: isListening || isSpeaking ? "#dc2626" : "#059669",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: isListening || isSpeaking ? "default" : "pointer",
          }}
        >
          {isListening ? "सुन रही हूँ... (Listening)" : isSpeaking ? "बोल रही हूँ... (Speaking)" : status}
        </button>
      </div>
    </div>
  );
}
