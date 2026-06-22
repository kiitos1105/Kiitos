import { auth } from "@/auth";

const REQUIRED_ENV = ["NEXTAUTH_URL", "NEXTAUTH_SECRET", "DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"];

export default async function AuthDebugPage() {
  const session = await auth();
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "";
  const callbackUrl = nextAuthUrl
    ? `${nextAuthUrl.replace(/\/$/, "")}/api/auth/callback/discord`
    : "NEXTAUTH_URL is missing";
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/70" />
      <section className="relative z-10 mx-auto grid max-w-5xl gap-5">
        <header className="glass-panel rounded-[2.5rem] p-8">
          <p className="text-sm font-black uppercase text-amber-100/65">Auth Debug</p>
          <h1 className="mt-3 text-5xl font-black">Discord OAuth確認</h1>
          <p className="mt-3 text-sm font-bold text-stone-200/60">
            Vercel環境変数とDiscord Redirect URLの確認用ページです。
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <DebugCard label="ログイン状態" value={session?.user ? "ログイン済み" : "未ログイン"} />
          <DebugCard label="Discord ID" value={session?.user?.id ?? "-"} />
          <DebugCard label="Discord name" value={session?.user?.name ?? "-"} />
          <DebugCard label="avatar url" value={session?.user?.image ?? "-"} />
          <DebugCard label="NEXTAUTH_URL" value={nextAuthUrl || "未設定"} />
          <DebugCard label="callback URL" value={callbackUrl} />
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">不足している環境変数</h2>
          <p className="mt-3 text-sm font-bold text-stone-200/65">
            {missing.length ? missing.join(" / ") : "不足なし"}
          </p>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">session</h2>
          <pre className="mt-4 max-h-[360px] overflow-auto rounded-2xl bg-black/35 p-4 text-xs text-stone-100/80">
            {JSON.stringify(session, null, 2)}
          </pre>
        </section>
      </section>
    </main>
  );
}

function DebugCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="glass-panel rounded-[2rem] p-5">
      <p className="text-xs font-black uppercase text-amber-100/60">{label}</p>
      <p className="mt-2 break-all text-lg font-black">{value}</p>
    </article>
  );
}
