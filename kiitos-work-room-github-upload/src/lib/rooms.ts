export const ROOM_NAMES = ["編集", "勉強", "作業", "デザイン"] as const;

export type RoomName = (typeof ROOM_NAMES)[number];

export function isRoomName(value: string): value is RoomName {
  return ROOM_NAMES.includes(value as RoomName);
}

export function roomChoices() {
  return ROOM_NAMES.map((name) => ({ name, value: name }));
}
