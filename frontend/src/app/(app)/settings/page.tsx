"use client";

import { useEffect, useState } from "react";
import Workspace from "@/components/layout/Workspace";
import { ApiLedgerBalance, ApiLedgerHistory, ApiUser, authState, autoEscrowApi } from "@/lib/api";
import { formatMoney } from "@/lib/api";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

export default function SettingsPage() {
  const [user, setUser] = useState<ApiUser | null>(authState.getUser());
  const [balance, setBalance] = useState<ApiLedgerBalance | null>(null);
  const [history, setHistory] = useState<ApiLedgerHistory | null>(null);
  const [status, setStatus] = useState(authState.getAccessToken() ? "Wallet session found. Refreshing account details…" : "Wallet not connected.");
  const [busy, setBusy] = useState(false);

  async function refreshAccount() {
    const [currentUser, currentBalance, currentHistory] = await Promise.all([
      autoEscrowApi.getCurrentUser(),
      autoEscrowApi.getLedgerBalance(),
      autoEscrowApi.getLedgerTransactions({ limit: 10, offset: 0 }),
    ]);
    setUser(currentUser);
    setBalance(currentBalance);
    setHistory(currentHistory);
    setStatus("Wallet authenticated. Ledger values are live backend records.");
  }

  useEffect(() => {
    if (authState.getAccessToken()) {
      void refreshAccount().catch((error) => setStatus(error instanceof Error ? error.message : "Could not refresh wallet details."));
    }
  }, []);

  async function connectWallet() {
    setBusy(true);
    setStatus("Waiting for wallet approval…");
    try {
      const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) throw new Error("No Ethereum wallet was detected. Install or enable MetaMask, then retry.");
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string") throw new Error("The wallet did not return an account address.");
      const address = accounts[0];
      const chainValue = await ethereum.request({ method: "eth_chainId" });
      const chainId = Number.parseInt(String(chainValue), 16);
      if (chainId !== 11155111) {
        try {
          await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
        } catch {
          throw new Error("Switch MetaMask to Sepolia (chain ID 11155111), then connect again.");
        }
      }
      setStatus("Requesting a one-time SIWE challenge from the backend…");
      const challenge = await autoEscrowApi.auth.requestWalletNonce(address, 11155111, "login");
      setStatus("Please sign the backend-provided message in your wallet. This signature does not move funds.");
      const signature = await ethereum.request({ method: "personal_sign", params: [challenge.message, address] });
      if (typeof signature !== "string") throw new Error("The wallet did not return a signature.");
      const tokens = await autoEscrowApi.auth.verifyWalletSignature(challenge.message, signature);
      authState.setTokens(tokens.access_token, tokens.refresh_token, tokens.user);
      authState.setDemoSessionToken(null);
      setUser(tokens.user);
      setStatus("Wallet verified. Loading your VCR ledger…");
      await refreshAccount();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await autoEscrowApi.auth.logout();
      setUser(null);
      setBalance(null);
      setHistory(null);
      setStatus("Wallet session signed out. Backend records remain unchanged.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Workspace title="Wallet & session settings" intro="Authenticate with your wallet and inspect the backend virtual-credit ledger.">
      <section className="record-panel">
        <h2>Sign in with Ethereum</h2>
        <p>AutoEscrow uses a backend-issued SIWE challenge on Sepolia. Your wallet signs the exact message returned by the backend; the frontend never handles or stores your private key.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {!user ? <button type="button" className="primary-button" onClick={() => void connectWallet()} disabled={busy}>{busy ? "Please wait…" : "Connect MetaMask"}</button> : <>
            <button type="button" className="secondary-button" onClick={() => void refreshAccount()} disabled={busy}>Refresh account</button>
            <button type="button" className="secondary-button" onClick={() => void signOut()} disabled={busy}>Sign out</button>
          </>}
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-sm" role="status" aria-live="polite">
          <p><strong>Status:</strong> {status}</p>
          {user && <p className="mt-2 break-all"><strong>Wallet:</strong> {user.wallet_address || "Address not returned"}</p>}
          {user && <p className="mt-1"><strong>Account:</strong> {user.display_name || user.email || user.id}</p>}
        </div>
      </section>

      <section className="record-panel mt-5">
        <h2>Virtual credit ledger</h2>
        <p>VCR means simulated virtual credits. They have no monetary value and cannot be withdrawn, transferred to a bank, or exchanged for cryptocurrency.</p>
        {!user ? <p className="mt-4 text-sm text-neutral-400">Connect your wallet to view your actual backend balance and transaction history.</p> : balance ? <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-widest text-neutral-500">Available balance</p><p className="mt-2 text-2xl font-semibold">{formatMoney(balance.available, "VCR")}</p></article>
            <article className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-widest text-neutral-500">Locked in escrow</p><p className="mt-2 text-2xl font-semibold">{formatMoney(balance.escrow_locked, "VCR")}</p></article>
          </div>
          <p className="mt-3 text-xs leading-5 text-neutral-500">{balance.label}. Eligible accounts receive the one-time welcome allocation from the backend; the frontend never credits or changes balances.</p>
        </> : <p className="mt-4 text-sm text-neutral-400">Ledger balance has not been loaded.</p>}
        {user && <div className="mt-6">
          <h3 className="font-semibold">Recent transactions</h3>
          {!history ? <p className="mt-2 text-sm text-neutral-500">Transaction history is not available yet.</p> : history.items.length === 0 ? <p className="mt-2 text-sm text-neutral-500">The backend returned no ledger transactions.</p> : <div className="mt-3 divide-y divide-white/10">{history.items.map((item) => <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-3"><div><p className="text-sm font-medium">{item.description}</p><p className="mt-1 text-xs text-neutral-500">{item.kind} · {new Date(item.created_at).toLocaleString()}</p></div><p className="text-sm tabular-nums">{formatMoney(item.amount, item.currency)}</p></article>)}</div>}
        </div>}
      </section>
      <p className="mt-5 text-xs leading-6 text-neutral-500">No real payment gateway, bank transfer, cryptocurrency transfer, or blockchain custody is enabled. All balances and transaction records are read from the authenticated backend ledger.</p>
    </Workspace>
  );
}
