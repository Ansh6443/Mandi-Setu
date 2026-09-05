"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert">
      <h1>कुछ समस्या आ गई</h1>
      <button type="button" onClick={() => reset()}>
        फिर कोशिश करें
      </button>
    </main>
  );
}
