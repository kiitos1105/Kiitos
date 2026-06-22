import { getRoomDetails, type AdminBan, type AdminWarning, type WorkLog } from "@/lib/work-room";
import type { RoomId } from "@/lib/room-config";

type AdminUserRecord = {
  id: string;
  displayName: string;
  roomId: RoomId;
  roomName: string;
  seatId?: string;
  platform: string;
  is_banned: boolean;
  ban_reason?: string;
};

type ServerAdminUserState = {
  kickedUserIds: Record<string, string>;
  warnings: AdminWarning[];
  bans: Record<string, AdminBan>;
  moves: Record<string, { roomId: RoomId; seatId?: string; createdAt: string }>;
  logs: Array<WorkLog & { action?: string; reason?: string }>;
};

const state: ServerAdminUserState = {
  kickedUserIds: {},
  warnings: [],
  bans: {},
  moves: {},
  logs: []
};

export function getAdminUsers(): AdminUserRecord[] {
  return getRoomDetails().flatMap((room) =>
    room.participants.map((participant) => {
      const ban = state.bans[participant.id];
      const move = state.moves[participant.id];
      return {
        id: participant.id,
        displayName: participant.displayName,
        roomId: move?.roomId ?? room.roomId,
        roomName: room.name,
        seatId: move?.seatId ?? participant.seatId,
        platform: participant.platform,
        is_banned: Boolean(ban),
        ban_reason: ban?.reason
      };
    })
  );
}

export function getAdminLogs() {
  return state.logs;
}

export function kickUser(userId: string, reason = "Admin force out") {
  state.kickedUserIds[userId] = new Date().toISOString();
  state.logs.unshift(createLog(userId, "force_out", reason));
  return state;
}

export function warnUser(userId: string, reason: string) {
  state.warnings.unshift({
    id: crypto.randomUUID(),
    userId,
    reason,
    warnedBy: "env-admin",
    createdAt: new Date().toISOString()
  });
  state.logs.unshift(createLog(userId, "warn", reason));
  return state;
}

export function banUser(userId: string, reason: string) {
  state.bans[userId] = {
    userId,
    reason,
    bannedBy: "env-admin",
    createdAt: new Date().toISOString()
  };
  state.kickedUserIds[userId] = new Date().toISOString();
  state.logs.unshift(createLog(userId, "ban", reason));
  return state;
}

export function unbanUser(userId: string) {
  delete state.bans[userId];
  delete state.kickedUserIds[userId];
  state.logs.unshift(createLog(userId, "unban", "BAN解除"));
  return state;
}

export function moveUser(userId: string, roomId: RoomId, seatId?: string) {
  state.moves[userId] = { roomId, seatId, createdAt: new Date().toISOString() };
  state.logs.unshift(createLog(userId, "move", `${roomId}${seatId ? `/${seatId}` : ""}`));
  return state;
}

function createLog(userId: string, action: string, reason: string): WorkLog & {
  action: string;
  reason: string;
} {
  return {
    id: crypto.randomUUID(),
    userName: userId,
    roomId: "cafe",
    seatId: "-",
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: 0,
    action,
    reason
  };
}
