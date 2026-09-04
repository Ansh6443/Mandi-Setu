"use client";

import { Translate } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-switcher">
      <Translate size={17} aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value as "hi" | "en")}
      >
        <option value="hi">{t("hindi")}</option>
        <option value="en">{t("english")}</option>
      </select>
    </label>
  );
}
