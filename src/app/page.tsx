import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32, fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1>Kiitos Work Room</h1>
      <p>
        OBS表示画面は <Link href="/display">/display</Link> です。
      </p>
    </main>
  );
}
