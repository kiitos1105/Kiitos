import Link from "next/link";

export default function BetaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="home-background pointer-events-none fixed inset-0 opacity-45" />
      <div className="pointer-events-none fixed inset-0 bg-black/64" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl content-center gap-6">
        <header className="glass-panel rounded-[2.5rem] p-8 text-center">
          <p className="text-sm font-black uppercase text-emerald-100/70">Kiitos Beta</p>
          <h1 className="mt-3 text-6xl font-black">β版は無料検証中です</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-6 text-stone-200/62">
            すべてのユーザーをBeta Testerとして扱います。公式ルーム、Private Room、バッジ、レベル、ランキングを試せます。
            Custom Open Roomは検証対象者へAdminが許可します。
          </p>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["公式ルーム", "Cafe / Library / Office / Creator / Night を利用できます。"],
            ["Private Room", "1日1回、招待リンク付きの非公開作業部屋を作成できます。"],
            ["Beta Tester", "β検証中のバッジ・レベル・ランキングが利用できます。"]
          ].map(([title, body]) => (
            <article className="glass-panel rounded-[2rem] p-6" key={title}>
              <h2 className="text-2xl font-black text-amber-100">{title}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-200/60">{body}</p>
            </article>
          ))}
        </section>
        <div className="flex justify-center gap-3">
          <Link className="rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950" href="/lobby">
            Lobbyへ戻る
          </Link>
          <Link className="rounded-2xl border border-white/12 bg-white/8 px-6 py-4 font-black" href="/redeem">
            招待コード
          </Link>
        </div>
      </section>
    </main>
  );
}
