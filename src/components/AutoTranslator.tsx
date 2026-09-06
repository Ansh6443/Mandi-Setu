"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

// Stores original text so switching back to Hindi works instantly
const originalTextMap = new WeakMap<Node, string>();

export default function AutoTranslator() {
  const { language } = useLanguage();
  const isTranslating = useRef(false);

  useEffect(() => {
    // If language is Hindi, revert all text back to original
    if (language === "hi") {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (originalTextMap.has(node)) {
          node.textContent = originalTextMap.get(node)!;
        }
        node = walker.nextNode();
      }
      return;
    }

    if (isTranslating.current) return;

    // Scan the DOM for visible text elements
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parentTag = node.parentElement?.tagName.toLowerCase();
          if (["script", "style", "noscript", "textarea", "input", "code"].includes(parentTag || "")) {
            return NodeFilter.FILTER_REJECT;
          }

          // Do not translate the language selector itself
          if (node.parentElement?.closest(".language-switcher")) {
            return NodeFilter.FILTER_REJECT;
          }

          const raw = originalTextMap.get(node) || node.textContent || "";
          const trimmed = raw.trim();

          // Skip empty strings, single characters, numbers, and queue tokens like "T - 114"
          if (!trimmed || trimmed.length < 2 || !isNaN(Number(trimmed)) || /^T\s*-\s*\d+$/i.test(trimmed)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const targetNodes: Node[] = [];
    const stringsToSend = new Set<string>();

    let node = walker.nextNode();
    while (node) {
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.textContent || "");
      }
      const sourceText = originalTextMap.get(node)!.trim();
      if (sourceText) {
        targetNodes.push(node);
        stringsToSend.add(sourceText);
      }
      node = walker.nextNode();
    }

    if (stringsToSend.size === 0) return;

    isTranslating.current = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";

    // Send visible texts to your Gemini backend endpoint
    fetch(`${apiUrl}/api/translate-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: Array.from(stringsToSend),
        target_lang: language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const dict: Record<string, string> = data.translations || {};

        // Replace each node's text with Gemini's translated text
        targetNodes.forEach((n) => {
          const original = originalTextMap.get(n)?.trim();
          if (original && dict[original]) {
            const raw = originalTextMap.get(n)!;
            n.textContent = raw.replace(original, dict[original]);
          }
        });
      })
      .catch((err) => console.error("Auto-translation error:", err))
      .finally(() => {
        isTranslating.current = false;
      });
  }, [language]);

  return null;
}
