"use client";

import Link from "next/link";
import { useState } from "react";
import Workspace from "@/components/layout/Workspace";
import { autoEscrowApi, authState, connectWallet as requestWalletAccounts, switchWalletToSepolia } from "@/lib/api";

export default function SettingsPage() {
  const [status, setStatus] = useState<string>("Not connected");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState("NOT VERIFIED");

  const connectWallet = async () => {
    setLoading(true);
    setStatus("Connecting MetaMask…");

    try {
      const provider = (window as typeof window & { ethereum?: { request: (args: Record<string, unknown>) => Promise<unknown> } }).ethereum;
      if (!provider) {
        throw new Error("MetaMask is not installed or available in this browser.");
      }

      await switchWalletToSepolia();
      const accounts = await requestWalletAccounts();
      const address = accounts[0];
      if (!address) {
        throw new Error("MetaMask did not return a wallet address.");
      }

      setWalletAddress(address);
      setSignatureStatus("NOT VERIFIED");
      setStatus("Requesting a Sepolia sign-in challenge…");
      const challenge = await autoEscrowApi.auth.requestWalletNonce(address, 11155111, "login");
      if (!challenge.message) {
        throw new Error("The backend did not return a sign-in message to verify.");
      }

      setStatus("Approve the sign-in message in MetaMask…");
      const signature = await provider.request({ method: "personal_sign", params: [challenge.message, address] });
      setStatus("Verifying the wallet signature with the backend…");
      const tokens = await autoEscrowApi.auth.verifyWalletSignature(challenge.message, String(signature));
      authState.setTokens(tokens.access_token, tokens.refresh_token, tokens.user);
      const sessionUser = await autoEscrowApi.auth.getUser();
      setUserName(sessionUser.display_name || sessionUser.wallet_address || walletAddress || address);
      setSignatureStatus("Verified for this session");
      setStatus("Connected and authenticated");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The wallet connection failed.";
      setSignatureStatus("NOT VERIFIED");
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await autoEscrowApi.auth.logout();
      authState.clear();
      setWalletAddress("");
      setUserName("");
      setSignatureStatus("NOT VERIFIED");
      setStatus("Not connected");
    } catch {
      setStatus("Logout failed. Please try again.");
    }
  };

  return (
    <Workspace title="Settings & wallet auth" intro="The live app uses real wallet-based identity, not a synthetic sandbox credential.">
      <section className="record-panel">
        <h2>Wallet authentication</h2>
        <p>Connect MetaMask to Sepolia and complete the SIWE challenge issued by the V2 backend. The access token is stored in session storage and attached to protected API calls.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="primary-button" type="button" onClick={connectWallet} disabled={loading}>
            {loading ? "Signing in…" : walletAddress ? "Reconnect MetaMask" : "Connect MetaMask and sign in"}
          </button>
          {walletAddress && (
            <button className="secondary-button" type="button" onClick={logout}>
              Log out
            </button>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[#dfeaf3]">
          <p><strong>Status:</strong> {status}</p>
          <p><strong>SIWE signature:</strong> {signatureStatus}</p>
          {walletAddress && <p><strong>Wallet:</strong> {walletAddress}</p>}
          {userName && <p><strong>User:</strong> {userName}</p>}
          {!walletAddress && <p>Required chain: Sepolia (11155111). No private key is requested or stored.</p>}
        </div>

        <p className="mt-5">A signature is verified only after the backend accepts it. This browser session has not completed that verification unless the status above says otherwise.</p>
        <Link className="primary-button mt-4 inline-block" href="/marketplace">Open marketplace</Link>
      </section>
    </Workspace>
  );
}
