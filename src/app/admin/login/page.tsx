"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("ADMIN_PASSWORD を入力してください");

  async function login() {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setMessage("認証に失敗しました");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,214,158,0.26),transparent_32%),linear-gradient(180deg,rgb(10,17,20),rgb(5,7,8))]" />
      <section className="glass-panel relative z-10 w-full max-w-xl rounded-[2.5rem] p-8">
        <p className="text-sm font-black uppercase tracking-normal text-amber-100/70">
          Kiitos Admin
        </p>
        <h1 className="mt-4 text-5xl font-black">Admin Login</h1>
        <p className="mt-4 text-sm font-bold text-stone-200/58">{message}</p>
        <input
          className="mt-6 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 font-bold outline-none focus:border-amber-100/60"
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void login();
            }
          }}
          placeholder="ADMIN_PASSWORD"
          type="password"
          value={password}
        />
        <button
          className="mt-4 w-full rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"
          onClick={() => void login()}
          type="button"
        >
          ログインして管理画面へ
        </button>
      </section>
    </main>
  );
}
