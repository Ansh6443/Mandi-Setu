"use client";

import QueueTable from "@/components/officer/QueueTable";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function QueuePage() {
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  return (
    <main className="min-h-full bg-[#f4f9f4] p-6">
      <header className="officer-page-head mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{t("liveQueue")}</h1>
          <p className="mt-1 text-sm font-bold text-gray-500">{t("queueDescription")}</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchQueue")}
          aria-label={t("searchQueue")}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-base font-semibold text-gray-900 outline-none focus:border-green-700 sm:max-w-xs"
        />
      </header>
      <QueueTable query={query} />
    </main>
  );
}