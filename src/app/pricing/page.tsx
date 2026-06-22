"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { grantBadge, grantTitle, saveUserProfile, getUserProfile } from "@/lib/badges-client";
import { getCurrentPlan, grantPremiumDemo, setCurrentPlan, type Plan } from "@/lib/premium-client";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "¥0",
    description: "公式ルームと1日1回のPrivate Roomで作業できます。",
    features: [
      "公式ルーム参加",
      "集中時間記録",
      "ランキング参加",
      "プライベートルーム 1日1回作成可能"
    ]
  },
  {
    id: "premium",
    name: "Premium Demo",
    price: "Demo",
    description: "β版では招待制またはAdmin手動付与で利用できます。",
    features: [
      "カスタムオープンルーム作成",
      "プライベートルーム無制限",
      "ルーム背景変更",
      "BGM変更",
      "参加者管理",
      "Premiumバッジ"
    ]
  }
] as const;

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("premium");
  const [currentPlan, setCurrentPlanState] = useState<Plan>("free");

  useEffect(() => {
    setCurrentPlanState(getCurrentPlan());
  }, []);

  function activatePremium() {
    grantPremiumDemo("pricing-development");
    grantBadge("premium", "pricing-demo");
    grantTitle("premium-member", "pricing-demo");
    saveUserProfile({ ...getUserProfile(), plan: "premium" });
    setCurrentPlanState("premium");
    setSelectedPlan("premium");
  }

  function switchToFree() {
    setCurrentPlan("free");
    saveUserProfile({ ...getUserProfile(), plan: "free" });
    setCurrentPlanState("free");
    setSelectedPlan("free");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-45" />
      <div className="pointer-events-none fixed inset-0 bg-black/62" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl content-center gap-8">
        <header className="text-center">
          <p className="text-sm font-black uppercase tracking-normal text-amber-100/65">
            Kiitos Premium
          </p>
          <h1 className="mt-3 text-6xl font-black">Pricing</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-6 text-stone-200/62">
            現在β版のため、Premiumは招待制です。本決済はまだ実行しません。
          </p>
          <div className="mt-5 inline-flex rounded-full border border-amber-100/20 bg-amber-100/10 px-5 py-2 text-sm font-black text-amber-100">
            現在: {currentPlan === "premium" ? "Premium" : "Free"}
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {PLANS.map((plan) => {
            const active = selectedPlan === plan.id;

            return (
              <button
                className={`glass-panel rounded-[2.25rem] p-7 text-left transition hover:-translate-y-1 ${
                  active ? "border-amber-100/60 bg-amber-100/12" : ""
                }`}
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black">{plan.name}</h2>
                    <p className="mt-3 text-sm font-bold text-stone-200/62">{plan.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/24 px-4 py-2 font-mono text-lg font-black text-amber-100">
                    {plan.price}
                  </span>
                </div>
                <div className="mt-7 grid gap-3">
                  {plan.features.map((feature) => (
                    <span
                      className="flex items-center gap-3 font-bold text-stone-100/76"
                      key={feature}
                    >
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-300/18 text-emerald-200">
                        ✓
                      </span>
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </section>

        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5">
          <div>
            <p className="font-black text-amber-100">
              {selectedPlan === "premium"
                ? "現在β版のため、Premiumは招待制です。"
                : "Freeプランは1日1回Private Roomを作れます。"}
            </p>
            <p className="mt-1 text-sm font-bold text-stone-200/55">
              招待コードは /redeem で入力できます。開発用Demoボタンも残しています。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedPlan === "premium" ? (
              <button
                className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
                onClick={activatePremium}
                type="button"
              >
                Premiumになる（Demo / 開発用）
              </button>
            ) : (
              <button
                className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black"
                onClick={switchToFree}
                type="button"
              >
                Freeに戻す
              </button>
            )}
            <Link
              className="rounded-2xl border border-white/12 bg-black/28 px-6 py-4 font-black"
              href="/redeem"
            >
              招待コード入力
            </Link>
            <Link
              className="rounded-2xl border border-white/12 bg-black/28 px-6 py-4 font-black"
              href="/lobby"
            >
              Lobbyへ戻る
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
