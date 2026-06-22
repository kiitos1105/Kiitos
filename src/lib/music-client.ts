"use client";

import type { RoomId } from "@/lib/room-config";

export type RoomMusicSetting = {
  roomId: RoomId;
  title: string;
  fileName: string;
  src: string;
  enabled: boolean;
  defaultVolume: number;
};

export type MusicPlayerSettings = {
  volume: number;
  muted: boolean;
};

const ROOM_MUSIC_STORAGE_KEY = "kiitos:room-music-settings";
const MUSIC_PLAYER_STORAGE_KEY = "kiitos:music-player-settings";

export const DEFAULT_ROOM_MUSIC: Record<RoomId, RoomMusicSetting> = {
  cafe: {
    roomId: "cafe",
    title: "Lo-Fi Rain",
    fileName: "lofi-rain.mp3",
    src: "/audio/lofi-rain.mp3",
    enabled: true,
    defaultVolume: 0.18
  },
  library: {
    roomId: "library",
    title: "Quiet Piano",
    fileName: "library-quiet.mp3",
    src: "/audio/library-quiet.mp3",
    enabled: true,
    defaultVolume: 0.14
  },
  office: {
    roomId: "office",
    title: "Focus Ambient",
    fileName: "office-focus.mp3",
    src: "/audio/office-focus.mp3",
    enabled: true,
    defaultVolume: 0.14
  },
  creator: {
    roomId: "creator",
    title: "Creative Beat",
    fileName: "creator-night.mp3",
    src: "/audio/creator-night.mp3",
    enabled: true,
    defaultVolume: 0.16
  },
  night: {
    roomId: "night",
    title: "Night Ambient",
    fileName: "night-ambient.mp3",
    src: "/audio/night-ambient.mp3",
    enabled: true,
    defaultVolume: 0.12
  }
};

function buildSrc(fileName: string) {
  const trimmed = fileName.trim();
  return trimmed ? `/audio/${trimmed}` : "";
}

export function normalizeMusicSetting(setting: RoomMusicSetting): RoomMusicSetting {
  return {
    ...setting,
    fileName: setting.fileName.trim(),
    src: setting.enabled ? buildSrc(setting.fileName) : "",
    defaultVolume: Math.min(1, Math.max(0, Number(setting.defaultVolume) || 0))
  };
}

export function getRoomMusicSettings(): Record<RoomId, RoomMusicSetting> {
  if (typeof window === "undefined") {
    return DEFAULT_ROOM_MUSIC;
  }

  try {
    const raw = window.localStorage.getItem(ROOM_MUSIC_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ROOM_MUSIC;
    }
    const parsed = JSON.parse(raw) as Partial<Record<RoomId, RoomMusicSetting>>;
    return (Object.keys(DEFAULT_ROOM_MUSIC) as RoomId[]).reduce(
      (settings, roomId) => ({
        ...settings,
        [roomId]: normalizeMusicSetting({
          ...DEFAULT_ROOM_MUSIC[roomId],
          ...(parsed[roomId] ?? {})
        })
      }),
      {} as Record<RoomId, RoomMusicSetting>
    );
  } catch {
    return DEFAULT_ROOM_MUSIC;
  }
}

export function getMusicForRoom(roomId: string): RoomMusicSetting | null {
  const settings = getRoomMusicSettings();
  return settings[roomId as RoomId] ?? null;
}

export function saveRoomMusicSettings(settings: Record<RoomId, RoomMusicSetting>) {
  if (typeof window === "undefined") return;
  const normalized = (Object.keys(DEFAULT_ROOM_MUSIC) as RoomId[]).reduce(
    (next, roomId) => ({
      ...next,
      [roomId]: normalizeMusicSetting(settings[roomId])
    }),
    {} as Record<RoomId, RoomMusicSetting>
  );
  window.localStorage.setItem(ROOM_MUSIC_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event("kiitos:music-settings-change"));
}

export function getMusicPlayerSettings(defaultVolume = 0.14): MusicPlayerSettings {
  if (typeof window === "undefined") {
    return { volume: defaultVolume, muted: false };
  }

  try {
    const raw = window.localStorage.getItem(MUSIC_PLAYER_STORAGE_KEY);
    if (!raw) {
      return { volume: defaultVolume, muted: false };
    }
    const parsed = JSON.parse(raw) as MusicPlayerSettings;
    return {
      volume: Math.min(1, Math.max(0, Number(parsed.volume) || defaultVolume)),
      muted: Boolean(parsed.muted)
    };
  } catch {
    return { volume: defaultVolume, muted: false };
  }
}

export function saveMusicPlayerSettings(settings: MusicPlayerSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MUSIC_PLAYER_STORAGE_KEY, JSON.stringify(settings));
}
