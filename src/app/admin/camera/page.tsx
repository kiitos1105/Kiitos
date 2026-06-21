"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminCameraPage() {
  const [intervalSeconds, setIntervalSeconds] = useState<5 | 7 | 10 | 15 | 30>(7);
  const [prioritizePopularRooms, setPrioritizePopularRooms] = useState(false);
  const [status, setStatus] = useState("定点カメラ設定を変更できます");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((response) => response.json())
      .then((settings) => {
        setIntervalSeconds(settings.cameraIntervalSeconds ?? 7);
        setPrioritizePopularRooms(Boolean(settings.prioritizePopularRooms));
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cameraIntervalSeconds: intervalSeconds,
        prioritizePopularRooms,
        action: {
          kind: "announce_all",
          message: `camera ${intervalSeconds}s prioritize=${prioritizePopularRooms}`
        }
      })
    });

    setStatus(response.ok ? "保存しました" : "保存に失敗しました");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-3xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Camera Admin</p>
            <h1 className="mt-2 text-5xl font-black">定点カメラ設定</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <div className="glass-panel rounded-[2rem] p-6">
            <label className="grid gap-3 font-black">
              巡回秒数
              <select
                className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4"
                onChange={(event) =>
                  setIntervalSeconds(Number(event.target.value) as 5 | 7 | 10 | 15 | 30)
                }
                value={intervalSeconds}
              >
                {[5, 7, 10, 15, 30].map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds}秒
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 flex items-center gap-3 font-black">
              <input
                checked={prioritizePopularRooms}
                onChange={(event) => setPrioritizePopularRooms(event.target.checked)}
                type="checkbox"
              />
              人が多い部屋を優先表示
            </label>

            <button
              className="mt-6 w-full rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"
              onClick={() => void save()}
              type="button"
            >
              保存して /camera に反映
            </button>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
