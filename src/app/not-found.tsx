"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <main>
      <h1>{t("pageNotFound")}</h1>
      <Link href="/">{t("goHome")}</Link>
    </main>
  );
}
