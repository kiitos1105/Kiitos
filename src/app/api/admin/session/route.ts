import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ isAdmin: cookieStore.get("kiitos_admin")?.value === "1" });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("kiitos_admin");
  return NextResponse.json({ ok: true });
}
