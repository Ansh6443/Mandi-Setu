"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<HTMLInputElement | HTMLTextAreaElement, string>();

export default function AutoTranslator() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const isTranslating = useRef(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      isTranslating.current = false;

      // If Hindi, restore original text
      if (language === "hi") {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          if (originalTextMap.has(node)) {
            node.textContent = originalTextMap.get(node)!;
          }
          node = walker.nextNode();
        }
        document.querySelectorAll("input, textarea").forEach((el) => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if (originalPlaceholderMap.has(input)) {
            input.placeholder = originalPlaceholderMap.get(input)!;
          }
        });
        return;
      }

      const translateDOM = () => {
        if (isTranslating.current) return;

        const targetNodes: Node[] = [];
        const targetInputs: (HTMLInputElement | HTMLTextAreaElement)[] = [];
        const stringsToSend = new Set<string>();

        // 1. Text nodes across the current page
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parentTag = node.parentElement?.tagName.toLowerCase();
              if (["script", "style", "noscript", "code"].includes(parentTag || "")) {
                return NodeFilter.FILTER_REJECT;
              }
              if (node.parentElement?.closest(".language-switcher") || node.parentElement?.closest("[data-no-translate]")) {
                return NodeFilter.FILTER_REJECT;
              }

              const raw = originalTextMap.get(node) || node.textContent || "";
              const text = raw.trim();

              if (!text || text.length < 2 || !isNaN(Number(text)) || /^T\s*-\s*\d+$/i.test(text)) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          }
        );

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

        // 2. Input box placeholders (Mobile number, Search boxes)
        document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if (!originalPlaceholderMap.has(input)) {
            originalPlaceholderMap.set(input, input.placeholder);
          }
          const pText = originalPlaceholderMap.get(input)!.trim();
          if (pText && pText.length > 1 && isNaN(Number(pText))) {
            targetInputs.push(input);
            stringsToSend.add(pText);
          }
        });

        if (stringsToSend.size === 0) return;

        isTranslating.current = true;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kisan-q-backend.onrender.com";

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

            // Apply to regular text
            targetNodes.forEach((n) => {
              const original = originalTextMap.get(n)?.trim();
              if (original && dict[original]) {
                const raw = originalTextMap.get(n)!;
                n.textContent = raw.replace(original, dict[original]);
              }
            });

            // Apply to input placeholders
            targetInputs.forEach((inp) => {
              const original = originalPlaceholderMap.get(inp)?.trim();
              if (original && dict[original]) {
                inp.placeholder = dict[original];
              }
            });
          })
          .catch((err) => console.error("AutoTranslator error:", err))
          .finally(() => {
            isTranslating.current = false;
          });
      };

      // Run on route change
      const timer = setTimeout(translateDOM, 100);

      // Run when new cards/tokens appear dynamically
      const observer = new MutationObserver(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(translateDOM, 350);
      });

      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        clearTimeout(timer);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        observer.disconnect();
      };
    }, [language, pathname]);

    return null;

  useEffect(() => {
    // Revert back to original base text if user picks Hindi
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

    const translateDOM = () => {
      if (isTranslating.current) return;

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parentTag = node.parentElement?.tagName.toLowerCase();
            if (["script", "style", "noscript", "textarea", "input", "code"].includes(parentTag || "")) {
              return NodeFilter.FILTER_REJECT;
            }

            if (node.parentElement?.closest(".language-switcher") || node.parentElement?.closest("[data-no-translate]")) {
              return NodeFilter.FILTER_REJECT;
            }

            const raw = originalTextMap.get(node) || node.textContent || "";
            const trimmed = raw.trim();

            // Ignore single characters, pure numbers, and token IDs (e.g. T-102)
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
    };

    // Initial scan on route or language change
    translateDOM();

    // Watch for dynamic DOM additions (e.g. data cards, tables loading asynchronously)
    const observer = new MutationObserver(() => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        translateDOM();
      }, 400);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [language, pathname]); // Re-runs on both language changes AND page navigation

  return null;
}