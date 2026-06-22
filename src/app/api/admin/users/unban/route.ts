import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-api-auth";
import { unbanUser } from "@/lib/admin-user-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as { userId: string };
  return NextResponse.json({ ok: true, state: unbanUser(body.userId) });
}
