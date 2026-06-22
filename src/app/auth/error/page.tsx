import Link from "next/link";

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "Auth configuration";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-35" />
      <div className="pointer-events-none fixed inset-0 bg-black/72" />
      <section className="glass-panel relative z-10 w-full max-w-2xl rounded-[2.5rem] p-8">
        <p className="text-sm font-black uppercase text-rose-100/70">Discord Login Error</p>
        <h1 className="mt-3 text-5xl font-black">Discordログインを確認してください</h1>
        <p className="mt-4 rounded-2xl border border-rose-100/20 bg-rose-100/10 p-4 text-sm font-black text-rose-100">
          エラー: {error}
        </p>
        <div className="mt-6 grid gap-3 text-sm font-bold leading-6 text-stone-200/68">
          <p>よくある原因:</p>
          <p>・Discord Developer PortalのRedirect URL不一致</p>
          <p>・DISCORD_CLIENT_SECRET未設定</p>
          <p>・DISCORD_CLIENT_ID未設定</p>
          <p>・NEXTAUTH_SECRET未設定</p>
          <p>・NEXTAUTH_URLがVercel公開URLと一致していない</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950" href="/lobby">
            Lobbyへ戻る
          </Link>
          <Link className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black" href="/auth/debug">
            Debugを見る
          </Link>
        </div>
      </section>
    </main>
  );
}
