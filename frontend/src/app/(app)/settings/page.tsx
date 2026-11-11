import Link from "next/link";
import Workspace from "@/components/layout/Workspace";

export default function SettingsPage() {
  return <Workspace title="Settings & demo privacy" intro="Only implemented preferences appear here. There is no wallet, account profile, or verification bypass.">
    <section className="record-panel"><h2>Your sandbox</h2><p>A signed credential identifies only this synthetic sandbox, not a real person. It expires after one hour by default. Do not enter sensitive personal information.</p><p>The browser stores that credential, the selected job, and a job draft locally. There are no analytics, marketing cookies, wallet integrations, or tracking toggles.</p><p>Reset deletes only your session’s workflow records and invalidates its old credential. Expired records remain until the presenter runs the explicit cleanup command.</p><Link className="primary-button" href="/demo/">Open demo to reset safely</Link></section>
  </Workspace>;
}
