"use client";

import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert">
      <h1>{t("pageError")}</h1>
      <button type="button" onClick={() => reset()}>
        {t("tryAgain")}
      </button>
    </main>
  );
}
