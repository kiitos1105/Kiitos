import { elapsedSecondsSince } from "./time";
import { ROOM_CONFIGS, type RoomId, getRoomConfig } from "./room-config";
import { getRoomSeatLayout } from "./roomSeatLayouts";
import type { DisplayParticipant, DisplayRoom, DisplayState, Platform } from "./types";

export type SeatStatus = "available" | "occupied" | "mine" | "reserved";

export type Seat = {
  id: string;
  label: string;
  zone: string;
  status: SeatStatus;
  user?: DisplayParticipant;
};

export type WorkLog = {
  id: string;
  userName: string;
  roomId: RoomId;
  seatId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
};

export type RoomDetail = DisplayRoom & {
  roomId: RoomId;
  rules: string[];
  bgm: string;
  seats: Seat[];
  logs: WorkLog[];
  enabled: boolean;
};

export type AdminActionKind =
  | "force_out"
  | "warn"
  | "ban"
  | "move_room"
  | "move_seat"
  | "announce_all"
  | "announce_room"
  | "pomodoro_start"
  | "pomodoro_stop"
  | "toggle_room";

export type AdminActionDraft = {
  kind: AdminActionKind;
  targetUserId?: string;
  roomId?: RoomId;
  seatId?: string;
  message?: string;
};

const ROOM_RULES: Record<RoomId, string[]> = {
  cafe: ["短い雑談OK", "BGMと雨音を楽しむ", "長文チャットは控えめに"],
  library: ["会話禁止", "通知音OFF", "読書・勉強・調べ物向け"],
  office: ["仕事・事務作業優先", "タスク集中", "会議風の独り言はミュートで"],
  creator: ["制作作業歓迎", "動画編集・デザイン向け", "進捗共有は短く"],
  night: ["深夜モード", "長時間集中", "休憩を忘れない"]
};

const ROOM_BGM: Record<RoomId, string> = {
  cafe: "Lo-Fi Rainy Cafe",
  library: "Quiet Pages",
  office: "Glass Desk Minimal",
  creator: "Future Edit Booth",
  night: "Moonlight Long Focus"
};

const SEAT_ZONES: Record<RoomId, string[]> = {
  cafe: ["窓側席", "カウンター席", "観葉植物横", "木目テーブル"],
  library: ["本棚横", "静音席", "集中席", "読書机"],
  office: ["デスク席", "会議室風席", "作業ブース", "窓際デスク"],
  creator: ["編集ブース", "モニター席", "デザイン席", "プレビュー席"],
  night: ["深夜席", "月明かり席", "長時間集中席", "静かな隅"]
};

const SAMPLE_NAMES: Record<RoomId, string[]> = {
  cafe: ["Mika", "Sora"],
  library: ["Aoi"],
  office: ["Ren", "Nana"],
  creator: ["Yuki", "Kai"],
  night: ["Noa"]
};

export function getRoomDetails(now = new Date()): RoomDetail[] {
  return ROOM_CONFIGS.map((room, roomIndex) => {
    const participants = createMockParticipants(room.id, roomIndex, now);
    const seats = createSeats(room.id, participants);

    return {
      id: room.id,
      roomId: room.id,
      name: room.name,
      shortName: room.shortName,
      description: room.description,
      icon: room.icon,
      mood: room.mood,
      participants,
      rules: ROOM_RULES[room.id],
      bgm: ROOM_BGM[room.id],
      seats,
      logs: createMockLogs(room.id, participants, now),
      enabled: true
    };
  });
}

export function getRoomDetail(roomId: string, now = new Date()): RoomDetail | null {
  const config = ROOM_CONFIGS.find((room) => room.id === roomId);
  if (!config) {
    return null;
  }

  return getRoomDetails(now).find((room) => room.roomId === config.id) ?? null;
}

export function getFallbackDisplayState(now = new Date()): DisplayState {
  const rooms = getRoomDetails(now);

  return {
    generatedAt: now.toISOString(),
    totalParticipants: rooms.reduce((sum, room) => sum + room.participants.length, 0),
    rooms
  };
}

export function createAdminAction(action: AdminActionDraft) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    actor: "env-admin",
    ...action
  };
}

function createMockParticipants(
  roomId: RoomId,
  roomIndex: number,
  now: Date
): DisplayParticipant[] {
  const seats = getRoomSeatLayout(roomId);

  return SAMPLE_NAMES[roomId].map((name, index) => {
    const startedAt = new Date(
      now.getTime() - (roomIndex * 18 + index * 11 + 24) * 60 * 1000
    ).toISOString();
    const seatId = seats[index + roomIndex]?.seat_id ?? seats[index]?.seat_id ?? "A1";

    return {
      id: `${roomId}-${name.toLowerCase()}`,
      platform: (index % 3 === 0 ? "discord" : index % 3 === 1 ? "youtube" : "web") as Platform,
      displayName: name,
      startedAt,
      elapsedSeconds: elapsedSecondsSince(startedAt, now),
      seatId
    };
  });
}

function createSeats(roomId: RoomId, participants: DisplayParticipant[]): Seat[] {
  const participantBySeat = new Map(
    participants.map((participant) => [participant.seatId, participant])
  );
  const layout = getRoomSeatLayout(roomId);

  return layout.map((seat, index) => {
    const user = participantBySeat.get(seat.seat_id);
    const reserved = !user && index === layout.length - 2;

    return {
      id: seat.seat_id,
      label: seat.seat_id,
      zone: seat.seat_name || SEAT_ZONES[roomId][0],
      status: user ? "occupied" : reserved ? "reserved" : "available",
      user
    };
  });
}

function createMockLogs(roomId: RoomId, participants: DisplayParticipant[], now: Date): WorkLog[] {
  const config = getRoomConfig(roomId);

  const activeLogs: WorkLog[] = participants.map((participant, index) => ({
    id: `${roomId}-log-${index}`,
    userName: participant.displayName,
    roomId,
    seatId: participant.seatId ?? "A1",
    startedAt: participant.startedAt,
    durationSeconds: elapsedSecondsSince(participant.startedAt, now) + index * 180,
    endedAt: undefined
  }));

  return activeLogs.concat({
    id: `${roomId}-log-last`,
    userName: `${config.shortName} Guest`,
    roomId,
    seatId: "C4",
    startedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(now.getTime() - 62 * 60 * 1000).toISOString(),
    durationSeconds: 58 * 60
  });
}
