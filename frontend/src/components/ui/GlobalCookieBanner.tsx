"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function GlobalCookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  // Check if user already consented when the component loads
  useEffect(() => {
    const consent = localStorage.getItem("ae-cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("ae-cookie-consent", "accepted");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] rounded-2xl border border-black/10 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 dark:border-white/15 dark:bg-[#0A0A0A]/90 md:w-[400px]">
      <button 
        onClick={() => setShowBanner(false)}
        className="absolute right-4 top-4 text-[#888888] transition-colors hover:text-black dark:hover:text-white"
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full border border-black/10 bg-black/5 p-2 text-black dark:border-white/20 dark:bg-white/10 dark:text-white">
          <Cookie size={18} />
        </div>
        <h3 className="text-sm font-bold text-black dark:text-white">Cookie Preferences</h3>
      </div>
      <p className="mb-6 text-xs font-light leading-relaxed text-[#666666] dark:text-[#A0A9BC]">
        We use strictly necessary cookies to keep your sessions secure. We also use optional analytics cookies to measure protocol performance. 
      </p>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleAccept}
          className="flex-1 rounded-xl bg-black py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          Accept All
        </button>
        <Link 
          href="/settings"
          onClick={() => setShowBanner(false)}
          className="flex-1 rounded-xl border border-black/15 bg-black/5 py-2.5 text-center text-xs font-bold text-black transition-colors hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}
