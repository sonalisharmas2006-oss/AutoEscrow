import Link from "next/link";
import Workspace from "@/components/layout/Workspace";

export default function SettingsPage() {
  return <Workspace title="Settings & wallet auth" intro="The live app uses real wallet-based identity, not a synthetic sandbox credential.">
    <section className="record-panel"><h2>Wallet authentication</h2><p>Use MetaMask on Sepolia to authenticate with the V2 backend. The access token is stored in session storage and attached as an Authorization bearer header on protected API calls.</p><p>There is no demo credential, no fake sandbox login, and no synthetic session token in production. The wallet remains the source of identity for user profile, wallet linkage, and protected workflow actions.</p><p>Unsupported demo-only features are explicitly labelled as coming soon instead of appearing as live working actions.</p><Link className="primary-button" href="/marketplace">Open marketplace</Link></section>
  </Workspace>;
}
