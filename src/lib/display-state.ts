import { getSupabaseAdmin } from "./supabase";
import { elapsedSecondsSince } from "./time";
import type { ActiveSessionWithRoom, DisplayRoom, DisplayState } from "./types";
import { ROOM_CONFIGS, getRoomConfig } from "./room-config";
import { getFallbackDisplayState } from "./work-room";

export async function getDisplayState(): Promise<DisplayState> {
  const now = new Date();
  let supabaseAdmin: ReturnType<typeof getSupabaseAdmin>;

  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing required environment variable")) {
      return getFallbackDisplayState(now);
    }

    throw error;
  }

  const { data: rooms, error: roomsError } = await supabaseAdmin
    .from("rooms")
    .select("id,name,description,icon")
    .order("name", { ascending: true });

  if (roomsError) {
    throw roomsError;
  }

  const { data: sessions, error: sessionsError } = await supabaseAdmin
    .from("active_sessions")
    .select("id,platform,platform_user_id,display_name,room_id,seat_id,started_at,rooms(id,name)")
    .order("started_at", { ascending: true });

  if (sessionsError) {
    throw sessionsError;
  }

  const displayRooms: DisplayRoom[] = (rooms ?? []).map((room) =>
    createDisplayRoom(room.id, room.name)
  );

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
      elapsedSeconds: elapsedSecondsSince(session.started_at, now),
      seatId: session.seat_id ?? undefined
    });
  }

  return {
    generatedAt: now.toISOString(),
    totalParticipants: displayRooms.reduce((sum, room) => sum + room.participants.length, 0),
    rooms: sortRooms(displayRooms)
  };
}

function sortRooms(rooms: DisplayRoom[]): DisplayRoom[] {
  const order = new Map<string, number>(
    ROOM_CONFIGS.flatMap((room, index) => [
      [room.id, index],
      [room.name, index]
    ])
  );
  return [...rooms].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
}

function createDisplayRoom(id: string, name: string): DisplayRoom {
  const config = getRoomConfig(id);

  return {
    id,
    name: config.name ?? name,
    shortName: config.shortName,
    description: config.description ?? undefined,
    icon: config.icon,
    mood: config.mood,
    participants: []
  };
}
