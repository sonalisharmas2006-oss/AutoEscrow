"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Workspace from "./layout/Workspace";
import { LiquidButton } from "@/components/animate-ui/buttons/liquid";
import { ApiAgreement, ApiDashboardMetrics, ApiEscrow, ApiJob, ApiJobEvent, autoEscrowApi as api, formatMoney } from "@/lib/api";

type View = "dashboard" | "jobs" | "agreements" | "escrow" | "execution" | "verification" | "disputes" | "history" | "risk";
const titles: Record<View, [string,string]> = {
 dashboard:["Your V2 workspace","A live overview of records returned for the connected wallet session."],
 jobs:["Job registry","Create a clear brief, inspect its persisted status, and continue the supported workflow."],
 agreements:["Agreements","Review proposal terms and version history before funding."],
 escrow:["Simulated escrow ledger","Persisted accounting records only. No real money is transferred or held."],
 execution:["Execution · coming soon","Agent execution is not part of the currently supported frontend release."],
 verification:["Verification · coming soon","Verification actions are not available in this frontend release."],
 disputes:["Disputes · coming soon","Dispute handling is not enabled in this frontend release."],
 history:["Audit history","Read persisted backend events for your jobs."],
 risk:["Risk safeguards · coming soon","No financial-risk prediction or risk score is presented as an operational guarantee."]
};
type Row={job:ApiJob;agreement:ApiAgreement|null;escrow:ApiEscrow|null;events:ApiJobEvent[];issues:string[]};

export default function WorkflowRegistry({view}:{view:View}) {
 const [rows,setRows]=useState<Row[]>([]);
 const [metrics,setMetrics]=useState<ApiDashboardMetrics|null>(null);
 const [filter,setFilter]=useState("");
 const [selected,setSelected]=useState<string|number|null>(null);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [reload,setReload]=useState(0);
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try {
   const jobsPromise=api.listJobs({skip:0,limit:100,sort:"newest"});
   const metricsPromise=api.getDashboardMetrics().catch(()=>null);
   const [jobs,summary]=await Promise.all([jobsPromise,metricsPromise]);
   setMetrics(summary);
   const records=await Promise.all(jobs.items.map(async(job):Promise<Row>=>{
    const details=await Promise.allSettled([api.getAgreementForJob(job.id),api.getEscrowForJob(job.id),api.getJobEvents(job.id)]);
    const pick=<T,>(index:number):T|null=>details[index].status==="fulfilled"?(details[index] as PromiseFulfilledResult<T>).value:null;
    return {job,agreement:pick<ApiAgreement>(0),escrow:pick<ApiEscrow>(1),events:pick<ApiJobEvent[]>(2)??[],issues:details.flatMap((item,i)=>item.status==="rejected"?[["agreement","escrow","audit"][i]]:[])};
   }));
   setRows(records);
   const query=new URLSearchParams(window.location.search).get("job");
   if(query)setSelected(query);
  } catch(e) {setError(e instanceof Error?e.message:"Unable to load records from the V2 API.");setRows([]);}
  finally {setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load,reload]);
 const visible=useMemo(()=>rows.filter(({job})=>[job.title,job.public_id,job.status].join(" ").toLowerCase().includes(filter.toLowerCase())),[rows,filter]);
 const detail=rows.find((r)=>String(r.job.id)===String(selected));
 if(["execution","verification","disputes","risk"].includes(view)) return <Workspace title={titles[view][0]} intro={titles[view][1]}><section className="record-panel"><div className="warning-panel" role="status"><strong>Not available yet.</strong><p>This section is intentionally read-only/disabled. No simulated success, placeholder records, or unsupported API calls are used.</p></div><Link href="/jobs" className="primary-button mt-4 inline-block">Return to supported jobs workflow</Link></section></Workspace>;
 return <Workspace title={titles[view][0]} intro={titles[view][1]}>
  <div className="toolbar"><label>Filter jobs<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Title, job ID, or status"/></label><LiquidButton type="button" onClick={()=>setReload(v=>v+1)} disabled={loading} className="px-4 py-2 text-sm">Refresh records</LiquidButton><Link href="/demo">Create a job →</Link></div>
  {error?<div className="error-panel" role="alert"><h2>Live records unavailable</h2><p>{error}</p><p>Check wallet authentication and API availability. An API error is not treated as an empty account.</p><LiquidButton type="button" onClick={()=>setReload(v=>v+1)} className="mt-3 px-4 py-2 text-sm">Retry</LiquidButton><Link href="/settings" className="ml-4 underline">Wallet settings</Link></div>:loading?<p role="status" className="empty-panel">Loading persisted records…</p>:<>
   {view==="dashboard"&&<div className="workspace-stats"><article><span>Total jobs</span><strong>{metrics?.total_jobs??rows.length}</strong></article><article><span>Jobs in progress</span><strong>{metrics?.jobs_in_progress??"—"}</strong></article><article><span>Completed jobs</span><strong>{metrics?.completed_jobs??"—"}</strong></article><article><span>Open disputes</span><strong>{metrics?.open_disputes??"—"}</strong></article><article><span>Simulated escrow funded</span><strong>{metrics?formatMoney(metrics.total_simulated_escrow_funded):"—"}</strong></article><article><span>Simulated escrow settled</span><strong>{metrics?formatMoney(metrics.total_simulated_escrow_settled):"—"}</strong></article></div>}
   {rows.some(r=>r.issues.length>0)&&<div className="warning-panel" role="status">Some job details could not be loaded: {Array.from(new Set(rows.flatMap(r=>r.issues))).join(", ")}. Failed detail requests are not shown as confirmed empty records.</div>}
   {visible.length===0?<div className="empty-panel"><h2>{filter?"No matching jobs":"No jobs returned by the backend"}</h2><p>{filter?"Try another search.":"Create a job after connecting a wallet. This view does not insert sample records."}</p><Link href="/demo">Start supported workflow →</Link></div>:<div className="registry-list">{visible.map(row=><article key={row.job.id} className="registry-row"><div><p className="eyebrow">{row.job.public_id||`Job #${row.job.id}`}</p><h2><button type="button" onClick={()=>{setSelected(row.job.id);window.history.replaceState(null,"",`?job=${row.job.id}`);}} className="text-left underline-offset-4 hover:underline">{row.job.title}</button></h2><p>{row.job.status} · {formatMoney(row.job.budget??row.job.budget_amount??0,row.job.currency||"USD")} · due {row.job.deadline?new Date(row.job.deadline).toLocaleString():"Not specified"}</p></div><div className="row-state">{view==="escrow"?row.escrow?.status??"No escrow":view==="agreements"?row.agreement?.status??"No agreement":view==="history"?`${row.events.length} audit events`:row.job.status}<button type="button" onClick={()=>setSelected(row.job.id)} className="mt-2 block underline">View record</button></div></article>)}</div>}
   {selected&&!detail&&<p className="error-panel">That job is not present in the currently loaded backend records.</p>}
   {detail&&<JobRecord row={detail} view={view}/>}
  </>}
 </Workspace>;
}

function JobRecord({row,view}:{row:Row;view:View}) {
 const {job,agreement,escrow,events}=row;
 return <section className="record-panel"><h2>{job.title}</h2><p>{job.description}</p><h3>Job requirements</h3><p>Category: {job.task_category||job.category||"Not specified"}</p><p>Skills: {(job.required_skills??[]).join(", ")||"None specified"}</p><p>Expected output: {job.expected_output||"Not specified"}</p><ul>{(job.acceptance_criteria??[]).map((item,i)=><li key={i}>{item}</li>)}</ul>
  {["jobs","agreements","dashboard"].includes(view)&&<><h3>Agreement</h3>{agreement?<><p>#{agreement.id} · {agreement.status} · proposal v{agreement.proposal_version} · {formatMoney(agreement.proposed_budget??agreement.amount,agreement.currency)}</p><p>Accepted version: {agreement.accepted_version??"Not accepted"}</p><pre>{JSON.stringify(agreement.terms,null,2)}</pre><details><summary>Proposal history</summary><pre>{JSON.stringify(agreement.proposal_history,null,2)}</pre></details></>:<p>No agreement has been returned for this job.</p>}</>}
  {["jobs","escrow","dashboard"].includes(view)&&<><h3>Simulated escrow</h3>{escrow?<><p>Escrow #{escrow.id} · {escrow.status} · {formatMoney(escrow.accepted_amount,escrow.accepted_currency)}</p><div className="table-scroll"><table><thead><tr><th>Entry</th><th>Amount</th><th>Currency</th><th>Recorded</th><th>Reference</th></tr></thead><tbody>{(escrow.ledger_entries??[]).map(entry=><tr key={entry.id}><td>{entry.entry_type}</td><td>{entry.amount}</td><td>{entry.currency}</td><td>{new Date(entry.occurred_at).toLocaleString()}</td><td>{entry.reference||"—"}</td></tr>)}</tbody></table></div></>:<p>No escrow record has been returned for this job. Funding is available only after agreement acceptance.</p>}</>}
  {["jobs","history","dashboard"].includes(view)&&<><h3>Persisted audit timeline</h3>{events.length?<ol className="record-timeline">{events.map(event=><li key={event.id}><strong>{event.event_type.replaceAll("."," ").replaceAll("_"," ")}</strong><time>{new Date(event.created_at).toLocaleString()}</time><p>{event.description}</p><details><summary>Event data</summary><pre>{JSON.stringify(event.data,null,2)}</pre></details></li>)}</ol>:<p>No audit events have been returned.</p>}</>}
 </section>;
}
