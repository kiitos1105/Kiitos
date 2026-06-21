import { NextResponse } from "next/server";
import { ROOM_CONFIGS, type RoomId } from "@/lib/room-config";
import { readRoomSeatLayout, readSeatLayouts } from "@/lib/seat-layout-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const roomId = new URL(request.url).searchParams.get("roomId") as RoomId | null;

  if (roomId) {
    const validRoom = ROOM_CONFIGS.some((room) => room.id === roomId);
    if (!validRoom) {
      return NextResponse.json({ error: "Unknown room" }, { status: 404 });
    }

    return NextResponse.json(await readRoomSeatLayout(roomId));
  }

  return NextResponse.json(await readSeatLayouts());
}
