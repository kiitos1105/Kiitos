import { getSupabaseAdmin } from "./supabase";
import { elapsedSecondsSince } from "./time";
import type { ActiveSessionWithRoom, DisplayRoom, DisplayState } from "./types";

const ROOM_ORDER = ["編集", "勉強", "作業", "デザイン"];

export async function getDisplayState(): Promise<DisplayState> {
  const now = new Date();
  const supabaseAdmin = getSupabaseAdmin();

  const { data: rooms, error: roomsError } = await supabaseAdmin
    .from("rooms")
    .select("id,name")
    .order("name", { ascending: true });

  if (roomsError) {
    throw roomsError;
  }

  const { data: sessions, error: sessionsError } = await supabaseAdmin
    .from("active_sessions")
    .select("id,platform,platform_user_id,display_name,room_id,started_at,rooms(id,name)")
    .order("started_at", { ascending: true });

  if (sessionsError) {
    throw sessionsError;
  }

  const displayRooms: DisplayRoom[] = (rooms ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    participants: []
  }));

  const roomById = new Map(displayRooms.map((room) => [room.id, room]));

  for (const session of (sessions ?? []) as ActiveSessionWithRoom[]) {
    const room = roomById.get(session.room_id);
    if (!room) {
      continue;
    }

    room.participants.push({
      id: session.id,
      platform: session.platform,
      displayName: session.display_name,
      startedAt: session.started_at,
      elapsedSeconds: elapsedSecondsSince(session.started_at, now)
    });
  }

  return {
    generatedAt: now.toISOString(),
    totalParticipants: displayRooms.reduce((sum, room) => sum + room.participants.length, 0),
    rooms: sortRooms(displayRooms)
  };
}

function sortRooms(rooms: DisplayRoom[]): DisplayRoom[] {
  const order = new Map<string, number>(ROOM_ORDER.map((name, index) => [name, index]));
  return [...rooms].sort((a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99));
}
