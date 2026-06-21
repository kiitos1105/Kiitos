import type { Platform, RoomRow } from "./database.types";

export type { ActiveSessionRow, ActiveSessionWithRoom, Platform, RoomRow } from "./database.types";

export type DisplayParticipant = {
  id: string;
  platform: Platform;
  displayName: string;
  startedAt: string;
  elapsedSeconds: number;
};

export type DisplayRoom = {
  id: RoomRow["id"];
  name: RoomRow["name"];
  description?: string;
  icon?: string;
  mood?: string;
  shortName?: string;
  participants: DisplayParticipant[];
};

export type DisplayState = {
  generatedAt: string;
  totalParticipants: number;
  rooms: DisplayRoom[];
};
