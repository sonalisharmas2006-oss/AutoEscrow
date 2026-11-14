"use client";

import { useState } from "react";
import Workspace from "@/components/layout/Workspace";
import { ApiDemoSession, authState, autoEscrowApi } from "@/lib/api";

export default function SettingsPage(){
 const [accessCode,setAccessCode]=useState("");
 const [session,setSession]=useState<ApiDemoSession|null>(null);
 const [status,setStatus]=useState(authState.getDemoSessionToken()?"Demo session token found in this browser session.":"No demo session");
 const [busy,setBusy]=useState(false);
 async function start(){setBusy(true);setStatus("Requesting a scoped demo session…");try{const value=await autoEscrowApi.startDemoSession(accessCode);setSession(value);setStatus("Demo session active. Protected requests will use the X-Demo-Session credential.");setAccessCode("");}catch(e){setStatus(e instanceof Error?e.message:"Could not start a demo session.");}finally{setBusy(false);}}
 async function reset(){if(!window.confirm("Reset this demo session? The backend will delete jobs scoped to the current demo session and issue a replacement session."))return;setBusy(true);try{const value=await autoEscrowApi.resetDemoSession();setSession(value);setStatus("Demo session rotated. Previous session records were reset by the backend.");}catch(e){setStatus(e instanceof Error?e.message:"Could not reset the demo session.");}finally{setBusy(false);}}
 function clearLocal(){authState.clear();setSession(null);setStatus("The local session credential was cleared. Backend records are not deleted.");}
 return <Workspace title="Session settings" intro="Manage the short-lived, backend-issued synthetic demo session used by this prototype.">
  <section className="record-panel"><h2>Backend demo session</h2><p>This repository&apos;s backend exposes scoped demo-session endpoints, not SIWE wallet-authentication endpoints. The frontend therefore uses the backend&apos;s supported X-Demo-Session flow and does not pretend a wallet signature has been verified.</p>
   <label className="mt-5 block text-sm">Presenter access code (if required)<input type="password" autoComplete="off" value={accessCode} onChange={e=>setAccessCode(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm text-white" placeholder="Leave blank if public demo access is enabled"/></label>
   <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="primary-button" onClick={()=>void start()} disabled={busy}>{busy?"Please wait…":"Start demo session"}</button><button type="button" className="secondary-button" onClick={()=>void reset()} disabled={busy||!authState.getDemoSessionToken()}>Reset backend demo session</button><button type="button" className="secondary-button" onClick={clearLocal} disabled={busy}>Clear local credential</button></div>
   <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm"><p><strong>Status:</strong> {status}</p>{session&&<><p className="mt-2"><strong>Scope:</strong> {session.session_scope}</p><p><strong>Expires:</strong> {new Date(session.expires_at).toLocaleString()}</p><p><strong>Job limit:</strong> {session.max_jobs}</p><p><strong>Maximum budget:</strong> {session.max_budget}</p><p><strong>Escrow mode:</strong> {session.simulated_escrow?"Simulated only":"Unavailable"}</p></>}</div>
   <p className="mt-5 text-xs leading-6 text-neutral-400">No private key, wallet signature, payment account, or real funds are requested. SIWE cannot be enabled from frontend changes alone because the current backend does not register SIWE challenge or verification routes; implementing that would require a separate backend change, which is outside this task&apos;s constraints.</p>
  </section>
 </Workspace>;
}
