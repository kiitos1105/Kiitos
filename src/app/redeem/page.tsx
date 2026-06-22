"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ensureFounderBadge,
  getUserProfile,
  grantBadge,
  grantTitle,
  playBadgeSound,
  saveUserProfile
} from "@/lib/badges-client";
import { redeemInviteCode } from "@/lib/premium-client";

export default function RedeemPage() {
  const [code, setCode] = useState("KIITOS-BETA");
  const [status, setStatus] = useState("招待コードを入力してください。");
  const [success, setSuccess] = useState(false);

  function redeem() {
    const result = redeemInviteCode(code);
    setStatus(result.message);
    setSuccess(result.ok);

    if (!result.ok) {
      return;
    }

    if (result.code?.grantPlan === "premium") {
      grantBadge("premium", "invite-code");
      grantTitle("premium-member", "invite-code");
      saveUserProfile({ ...getUserProfile(), plan: "premium" });
    }

    if (result.code?.grantsBetaTester) {
      grantBadge("beta-tester", "invite-code");
      grantTitle("beta-tester", "invite-code");
    }

    const founder = ensureFounderBadge();
    if (founder) {
      playBadgeSound();
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-black/68" />

      <section className="glass-panel relative z-10 w-full max-w-xl rounded-[2.5rem] p-8">
        <p className="text-sm font-black uppercase text-amber-100/65">Redeem Invite</p>
        <h1 className="mt-3 text-5xl font-black">招待コード</h1>
        <p className="mt-4 text-sm font-bold leading-6 text-stone-200/62">
          β版ではPremium Demoを招待コードまたはAdmin手動付与で利用できます。
        </p>

        <label className="mt-6 grid gap-2 text-sm font-black text-stone-200/65">
          招待コード
          <input
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-lg font-black uppercase text-stone-50 outline-none"
            onChange={(event) => setCode(event.target.value)}
            value={code}
          />
        </label>

        <div
          className={`mt-5 rounded-2xl border p-4 text-sm font-black ${
            success
              ? "border-emerald-100/25 bg-emerald-100/10 text-emerald-100"
              : "border-amber-100/20 bg-amber-100/10 text-amber-100"
          }`}
        >
          {status}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
            onClick={redeem}
            type="button"
          >
            適用する
          </button>
          <Link
            className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black"
            href="/pricing"
          >
            Pricingへ
          </Link>
          <Link
            className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black"
            href="/lobby"
          >
            Lobbyへ
          </Link>
        </div>
      </section>
    </main>
  );
}
