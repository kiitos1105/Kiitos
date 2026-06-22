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
  { title: "部屋管理", href: "/admin/rooms", description: "部屋ON/OFF、名前、説明、BGM、定員。" },
  {
    title: "Custom Room管理",
    href: "/admin/custom-rooms",
    description: "Premiumユーザーの作成部屋を編集・削除・公開停止。"
  },
  {
    title: "招待コード管理",
    href: "/admin/invites",
    description: "β版Premium招待コードを作成・管理。"
  },
  { title: "警告/BAN", href: "/admin/users", description: "荒らし対策と操作履歴の記録。" },
  { title: "バッジ管理", href: "/admin/badges", description: "バッジ作成、付与、剥奪、条件編集。" },
  { title: "称号管理", href: "/admin/titles", description: "称号作成、装備候補、手動付与と剥奪。" },
  { title: "定点カメラ設定", href: "/admin/camera", description: "巡回秒数と優先表示を調整。" },
  { title: "アナウンス", href: "/admin/announcements", description: "全体・部屋別のお知らせ。" },
  { title: "天気設定", href: "/admin/weather", description: "5都市の天気ダミーデータ編集。" },
  { title: "Bot設定", href: "/admin/bots", description: "Discord / YouTube Bot連携準備。" },
  {
    title: "ランキング管理",
    href: "/admin/rankings",
    description: "ランキング、MVP、表示順位を確認。"
  },
  { title: "MVP設定", href: "/admin/mvp", description: "月間MVPとRoom MVPを手動設定。" },
  { title: "証明書確認", href: "/admin/certificates", description: "集中証明書の発行状況を確認。" },
  {
    title: "フレンド/通報",
    href: "/admin/social",
    description: "フレンド申請、通報、リアクションログ確認。"
  }
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
