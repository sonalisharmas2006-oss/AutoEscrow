import Link from "next/link";
import Workspace from "@/components/layout/Workspace";

export default function SettingsPage() {
  return <Workspace title="Settings & demo privacy" intro="Only implemented preferences appear here. There is no wallet, account profile, or verification bypass.">
    <section className="record-panel"><h2>Appearance</h2><p>Auto Escrow uses a consistent light mode with a smoky cloudy background and glass surfaces across every workflow view.</p><div className="toolbar" role="group" aria-label="Theme preference">
      <button type="button" aria-pressed="true" disabled className="theme-choice active">Light mode</button>
    </div><p className="setting-state" role="status">Global light mode is active.</p></section>
    <section className="record-panel"><h2>Your sandbox</h2><p>A signed credential identifies only this synthetic sandbox, not a real person. It expires after one hour by default. Do not enter sensitive personal information.</p><p>The browser stores that credential, the selected job, a job draft, and theme preference locally. There are no analytics, marketing cookies, wallet integrations, or tracking toggles.</p><p>Reset deletes only your session’s workflow records and invalidates its old credential. Expired records remain until the presenter runs the explicit cleanup command.</p><Link className="primary-button" href="/demo/">Open demo to reset safely</Link></section>
  </Workspace>;
}
