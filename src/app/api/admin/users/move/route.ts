import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-api-auth";
import { moveUser } from "@/lib/admin-user-server";
import type { RoomId } from "@/lib/room-config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as { userId: string; roomId: RoomId; seatId?: string };
  return NextResponse.json({ ok: true, state: moveUser(body.userId, body.roomId, body.seatId) });
}
