"use client";
import { useEffect, useRef, useState } from "react";
import { autoEscrowApi } from "@/lib/api";

export function SessionNotice() {
  const [required, setRequired] = useState(false);
  const [offline, setOffline] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (required) dialog.current?.showModal(); }, [required]);
  useEffect(() => {
    const requireSession = () => setRequired(true);
    const connection = () => setOffline(!navigator.onLine);
    window.addEventListener("ae-session-required", requireSession);
    window.addEventListener("offline", connection);
    window.addEventListener("online", connection);
    connection();
    return () => { window.removeEventListener("ae-session-required", requireSession); window.removeEventListener("offline", connection); window.removeEventListener("online", connection); };
  }, []);
  return <>{offline && <div role="status" className="connection-notice">You are offline. Your saved work has not been marked complete. Reconnect, then use Refresh.</div>}
    {required && <dialog ref={dialog} className="session-overlay" aria-labelledby="session-title" onCancel={() => setRequired(false)}><form onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      try { await autoEscrowApi.startDemoSession(code); localStorage.removeItem("autoescrow-guided-demo-job"); localStorage.removeItem("autoescrow-guided-demo-agent"); window.location.assign("/demo/"); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Session unavailable"); }
      finally { setBusy(false); }
    }}><h2 id="session-title">Start a fresh demo session</h2><p>The session may have expired, or this deployment requires the presenter’s access code. Starting again does not restore expired work.</p><label>Demo access code (leave blank for open demos)<input autoFocus type="password" autoComplete="off" value={code} onChange={event => setCode(event.target.value)} /></label>{error && <p role="alert">{error}</p>}<button disabled={busy} type="submit">{busy ? "Connecting…" : "Start session"}</button><button disabled={busy} type="button" onClick={() => setRequired(false)}>Cancel</button></form></dialog>}
  </>;
}
