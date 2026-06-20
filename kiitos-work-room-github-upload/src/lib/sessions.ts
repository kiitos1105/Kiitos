import { ROOM_NAMES, isRoomName } from "./rooms";
import { getSupabaseAdmin } from "./supabase";
import { elapsedSecondsSince } from "./time";
import type {
  ActiveSessionWithRoom,
  DisplayRoom,
  DisplayState,
  Platform,
  RoomRow,
  SessionUser
} from "./types";

export async function enterRoom(user: SessionUser, roomName: string): Promise<string> {
  if (!isRoomName(roomName)) {
    return `部屋名は ${ROOM_NAMES.join(" / ")} から選んでください。`;
  }

  const room = await getRoomByName(roomName);
  const now = new Date().toISOString();
  const supabaseAdmin = getSupabaseAdmin();

  const existing = await getActiveSession(user.platform, user.platformUserId);
  if (existing) {
    await closeActiveSession(existing, now);
  }

  const { error } = await supabaseAdmin.from("active_sessions").insert({
    platform: user.platform,
    platform_user_id: user.platformUserId,
    display_name: user.displayName,
    room_id: room.id,
    started_at: now
  });

  if (error) {
    throw error;
  }

  return `${room.name} に入室しました。`;
}

export async function leaveRoom(user: SessionUser): Promise<string> {
  const existing = await getActiveSession(user.platform, user.platformUserId);
  if (!existing) {
    return "現在入室していません。";
  }

  await closeActiveSession(existing, new Date().toISOString());
  return "退室しました。おつかれさまでした。";
}

export async function getUserStatus(platform: Platform, platformUserId: string): Promise<string> {
  const session = await getActiveSession(platform, platformUserId);
  if (!session) {
    return "現在入室していません。";
  }

  const roomName = session.rooms?.name ?? "不明";
  const elapsedSeconds = elapsedSecondsSince(session.started_at);
  const minutes = Math.floor(elapsedSeconds / 60);
  return `${roomName} で作業中です。開始から約 ${minutes} 分経過しています。`;
}

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

async function getRoomByName(name: string): Promise<RoomRow> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("rooms")
    .select("id,name")
    .eq("name", name)
    .single();

  if (error) {
    throw new Error(`Room "${name}" was not found. Run the database setup SQL first.`);
  }

  return data;
}

async function getActiveSession(
  platform: Platform,
  platformUserId: string
): Promise<ActiveSessionWithRoom | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("active_sessions")
    .select("id,platform,platform_user_id,display_name,room_id,started_at,rooms(id,name)")
    .eq("platform", platform)
    .eq("platform_user_id", platformUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ActiveSessionWithRoom | null) ?? null;
}

async function closeActiveSession(session: ActiveSessionWithRoom, endedAt: string) {
  const durationSeconds = elapsedSecondsSince(session.started_at, new Date(endedAt));
  const supabaseAdmin = getSupabaseAdmin();

  const { error: logError } = await supabaseAdmin.from("session_logs").insert({
    platform: session.platform,
    platform_user_id: session.platform_user_id,
    display_name: session.display_name,
    room_id: session.room_id,
    started_at: session.started_at,
    ended_at: endedAt,
    duration_seconds: durationSeconds
  });

  if (logError) {
    throw logError;
  }

  const { error: deleteError } = await supabaseAdmin
    .from("active_sessions")
    .delete()
    .eq("id", session.id);

  if (deleteError) {
    throw deleteError;
  }
}

function sortRooms(rooms: DisplayRoom[]): DisplayRoom[] {
  const order = new Map<string, number>(ROOM_NAMES.map((name, index) => [name, index]));
  return [...rooms].sort((a, b) => (order.get(a.name) ?? 99) - (order.get(b.name) ?? 99));
}
