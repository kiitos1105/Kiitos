import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";

const MENU = [
  {
    title: "座席位置を調整する",
    href: "/admin/seat-editor",
    description: "座席表画像を見ながら椅子のクリック位置を手動調整します。",
    primary: true
  },
  { title: "参加者管理", href: "/admin/users", description: "強制退出、警告、BAN、部屋移動。" },
  { title: "部屋管理", href: "/admin", description: "部屋のON/OFFや全体状態を確認。" },
  { title: "警告/BAN", href: "/admin/users", description: "荒らし対策と操作履歴の記録。" },
  { title: "定点カメラ設定", href: "/admin/camera", description: "巡回秒数と優先表示を調整。" },
  { title: "アナウンス", href: "/admin", description: "全体・部屋別のお知らせ。" },
  { title: "天気設定", href: "/admin", description: "現在はダミー天気。API差し替え予定。" },
  { title: "Bot設定", href: "/admin", description: "Discord / YouTube Bot連携準備。" }
];

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2.5rem] p-8">
            <p className="text-sm font-black uppercase tracking-normal text-amber-100/65">
              Admin Mode
            </p>
            <h1 className="mt-3 text-6xl font-black">Kiitos Dashboard</h1>
            <p className="mt-4 max-w-3xl text-stone-200/62">
              ターミナルを使わずに、座席・参加者・配信カメラを管理するための入口です。
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {MENU.map((item) => (
              <Link
                className={`glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:border-amber-100/35 ${
                  item.primary ? "md:col-span-2 xl:col-span-2 bg-amber-100/10" : ""
                }`}
                href={item.href}
                key={item.title}
              >
                <p className="text-xs font-black uppercase text-amber-100/60">Admin Tool</p>
                <h2 className="mt-3 text-3xl font-black">{item.title}</h2>
                <p className="mt-4 text-sm font-bold leading-6 text-stone-200/58">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
