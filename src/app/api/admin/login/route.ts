import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-state";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };

  if (!verifyAdminPassword(body.password ?? "")) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("kiitos_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.json({ ok: true });
}
