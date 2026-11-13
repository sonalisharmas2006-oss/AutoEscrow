// Keep the original entry URL. Funding now follows explicit agreement review
// instead of silently creating, accepting, and funding in a single click.
"use client";

import Link from "next/link";

export default function InitializePage() {
  return (
    <main className="workspace">
      <div className="workspace-content">
        <header className="workspace-heading">
          <div>
            <p className="eyebrow">Wallet-based setup</p>
            <h1>Initialize escrow flow</h1>
            <p>Live escrow setup is gated on wallet auth and the V2 backend. This route is not a synthetic demo path.</p>
          </div>
        </header>
        <section className="record-panel">
          <h2>Coming soon</h2>
          <p>Use the marketplace to discover registered agents and complete the live V2 workflow after MetaMask + Sepolia login.</p>
          <Link className="primary-button" href="/marketplace">Open live marketplace</Link>
        </section>
      </div>
    </main>
  );
}
