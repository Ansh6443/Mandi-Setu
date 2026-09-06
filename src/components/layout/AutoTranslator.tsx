"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

// Stores the Hindi/source text for each DOM node across language changes.
const originalTextMap = new Map<Node, string>();

export default function AutoTranslator() {
  const { language } = useLanguage();
  const isTranslating = useRef(false);

  useEffect(() => {
    if (isTranslating.current) return;

    // Capture source text after React has rendered the Hindi/local dictionary.
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
      const currentText = node.textContent?.trim() || "";
      if (language !== "hi" && sourceText && currentText === sourceText) {
        targetNodes.push(node);
        stringsToSend.add(sourceText);
      }
      node = walker.nextNode();
    }

    if (stringsToSend.size === 0) return;

    isTranslating.current = true;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";
    const controller = new AbortController();

    fetch(`${apiUrl}/api/translate-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        texts: Array.from(stringsToSend),
        target_lang: language,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Translation request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const dict: Record<string, string> = data.translations || {};

        targetNodes.forEach((n) => {
          const original = originalTextMap.get(n)?.trim();
          const translated = original ? dict[original]?.trim() : "";
          if (original && translated && translated !== original) {
            const raw = originalTextMap.get(n)!;
            n.textContent = raw.replace(original, translated);
          }
        });
      })
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Auto-translation error:", err);
        }
      })
      .finally(() => {
        isTranslating.current = false;
      });

    return () => controller.abort();
  }, [language]);

  return null;
}