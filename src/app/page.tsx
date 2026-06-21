import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cafe-950 p-6 text-stone-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_16%,rgba(255,214,158,0.28),transparent_32%),linear-gradient(180deg,rgb(10,17,20),rgb(5,8,9))]" />
      <div className="wood-grain pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] opacity-65" />
      <section className="glass-panel relative z-10 max-w-3xl rounded-[2.5rem] p-8 text-center">
        <p className="text-sm font-black uppercase tracking-normal text-amber-100/70">
          Apple × Nordic Cafe × Kiitos
        </p>
        <h1 className="mt-5 text-6xl font-black leading-none tracking-normal sm:text-8xl">
          Kiitos Work Room
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-stone-200/68">
          部屋に入って席を選ぶ、配信にも映えるオンライン作業空間。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-full bg-amber-100 px-6 py-3 font-black text-stone-950"
            href="/lobby"
          >
            Lobbyへ入る
          </Link>
          <Link
            className="rounded-full border border-white/12 bg-white/8 px-6 py-3 font-black"
            href="/display"
          >
            Display
          </Link>
        </div>
      </section>
    </main>
  );
}
