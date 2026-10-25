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
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] rounded-2xl border border-white/70 bg-white/75 p-6 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-10 fade-in duration-500 md:w-[400px]">
      <button 
        onClick={() => setShowBanner(false)}
        className="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-900"
      >
        <X size={16} />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-blue-100 p-2 text-blue-600">
          <Cookie size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Cookie Preferences</h3>
      </div>
      <p className="mb-6 text-xs font-light leading-relaxed text-slate-600">
        We use strictly necessary cookies to keep your sessions secure. We also use optional analytics cookies to measure protocol performance. 
      </p>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleAccept}
          className="flex-1 rounded-xl bg-[#0b2447] py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-[#12345d]"
        >
          Accept All
        </button>
        <Link 
          href="/settings"
          onClick={() => setShowBanner(false)}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-900 transition-colors hover:bg-slate-200"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}
