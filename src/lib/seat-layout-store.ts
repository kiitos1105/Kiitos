import { promises as fs } from "fs";
import path from "path";
import { ROOM_CONFIGS, type RoomId } from "./room-config";
import { ROOM_SEAT_LAYOUTS, type RoomSeatLayout } from "./roomSeatLayouts";

export type SeatLayoutsFile = Record<RoomId, RoomSeatLayout[]>;

const dataPath = path.join(process.cwd(), "public", "data", "seat-layouts.json");

export async function readSeatLayouts(): Promise<SeatLayoutsFile> {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const saved = JSON.parse(raw) as Partial<SeatLayoutsFile>;
    return normalizeSeatLayouts(saved);
  } catch {
    return normalizeSeatLayouts(ROOM_SEAT_LAYOUTS);
  }
}

export async function writeSeatLayouts(layouts: SeatLayoutsFile) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  const normalized = normalizeSeatLayouts(layouts);
  await fs.writeFile(dataPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

export async function readRoomSeatLayout(roomId: RoomId) {
  const layouts = await readSeatLayouts();
  return layouts[roomId];
}

function normalizeSeatLayouts(input: Partial<SeatLayoutsFile>): SeatLayoutsFile {
  return ROOM_CONFIGS.reduce((result, room) => {
    result[room.id] = normalizeRoomSeatLayout(input[room.id] ?? ROOM_SEAT_LAYOUTS[room.id]);
    return result;
  }, {} as SeatLayoutsFile);
}

function normalizeRoomSeatLayout(layout: RoomSeatLayout[]) {
  return layout.map((seat, index) => ({
    seat_id: seat.seat_id || `chair_${String(index + 1).padStart(2, "0")}`,
    seat_name: seat.seat_name || `Seat ${index + 1}`,
    x: clampPercent(seat.x),
    y: clampPercent(seat.y),
    width: clampSize(seat.width),
    height: clampSize(seat.height)
  }));
}

function clampPercent(value: number) {
  return Math.min(Math.max(round(value), 0), 100);
}

function clampSize(value: number) {
  return Math.min(Math.max(round(value), 1), 30);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
