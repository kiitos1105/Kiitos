"use client";

import { getBadges, getEquippedTitle, getFavoriteBadges, getUserProfile } from "./badges-client";
import { getFocusTreeSummary, getLevelProgress } from "./level-client";

export type TodayGoal = "動画編集" | "勉強" | "開発" | "デザイン" | "読書" | "仕事" | "その他";
export type LeaveReason = "終了" | "休憩" | "昼食" | "移動" | "寝る" | "その他";
export type ReactionType = "👏 お疲れ様" | "☕ 休憩しよう" | "🔥 がんばれ" | "👋 こんにちは";

export type FavoriteSeat = {
  roomId: string;
  seatId: string;
  seatName: string;
  savedAt: string;
};

export type LiveSettings = {
  youtubeUrl: string;
  tiktokUrl: string;
  twitchUrl: string;
  isLive: boolean;
};

export type EngagementProfile = {
  todayGoal: TodayGoal;
  customGoal: string;
  todayMessage: string;
  streakDays: number;
  favoriteSeat: FavoriteSeat | null;
  live: LiveSettings;
  lastFocusDate: string | null;
};

export type FocusCalendarDay = {
  date: string;
  minutes: number;
};

export type RankingUser = {
  id: string;
  rank: number;
  name: string;
  avatarUrl: string;
  title: string;
  level: number;
  focusMinutes: number;
  room: string;
  founder: boolean;
  premium: boolean;
  badges: string[];
  discordLinked: boolean;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "focus" | "offline" | "pending" | "blocked";
  room: string;
  goal: string;
  message: string;
};

export type ReactionLog = {
  id: string;
  fromUser: string;
  toUser: string;
  roomId: string;
  seatId: string;
  type: ReactionType;
  createdAt: string;
};

const ENGAGEMENT_KEY = "kiitos:engagement-profile";
const CALENDAR_KEY = "kiitos:focus-calendar";
const REACTIONS_KEY = "kiitos:reactions";

export const GOAL_OPTIONS: TodayGoal[] = [
  "動画編集",
  "勉強",
  "開発",
  "デザイン",
  "読書",
  "仕事",
  "その他"
];
export const LEAVE_REASONS: LeaveReason[] = ["終了", "休憩", "昼食", "移動", "寝る", "その他"];
export const REACTIONS: ReactionType[] = [
  "👏 お疲れ様",
  "☕ 休憩しよう",
  "🔥 がんばれ",
  "👋 こんにちは"
];

export function getEngagementProfile(): EngagementProfile {
  if (typeof window === "undefined") return createInitialEngagementProfile();

  try {
    const raw = window.localStorage.getItem(ENGAGEMENT_KEY);
    return raw
      ? { ...createInitialEngagementProfile(), ...(JSON.parse(raw) as EngagementProfile) }
      : createInitialEngagementProfile();
  } catch {
    return createInitialEngagementProfile();
  }
}

export function saveEngagementProfile(profile: EngagementProfile) {
  window.localStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("storage"));
}

export function getGoalLabel(profile = getEngagementProfile()) {
  const goal = profile.todayGoal === "その他" ? profile.customGoal || "作業" : profile.todayGoal;
  const icon: Record<string, string> = {
    動画編集: "🎬",
    勉強: "📚",
    開発: "💻",
    デザイン: "🎨",
    読書: "📖",
    仕事: "💼",
    その他: "✨"
  };
  return `${icon[profile.todayGoal] ?? "✨"} ${goal}中`;
}

export function markFocusToday() {
  const profile = getEngagementProfile();
  const today = getDateKey(new Date());
  const yesterday = getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const streakDays =
    profile.lastFocusDate === today
      ? profile.streakDays
      : profile.lastFocusDate === yesterday
        ? profile.streakDays + 1
        : 1;
  const next = { ...profile, streakDays, lastFocusDate: today };
  saveEngagementProfile(next);
  return next;
}

export function saveFavoriteSeat(seat: FavoriteSeat) {
  const profile = getEngagementProfile();
  saveEngagementProfile({ ...profile, favoriteSeat: seat });
}

export function getFocusCalendar(): FocusCalendarDay[] {
  if (typeof window === "undefined") return createCalendar();

  try {
    const raw = window.localStorage.getItem(CALENDAR_KEY);
    return raw ? (JSON.parse(raw) as FocusCalendarDay[]) : createCalendar();
  } catch {
    return createCalendar();
  }
}

export function addFocusCalendarMinutes(minutes: number) {
  const today = getDateKey(new Date());
  const calendar = getFocusCalendar();
  const index = calendar.findIndex((day) => day.date === today);
  if (index >= 0) {
    calendar[index] = { ...calendar[index], minutes: calendar[index].minutes + minutes };
  } else {
    calendar.push({ date: today, minutes });
  }
  window.localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar.slice(-120)));
  return calendar;
}

export function getRankingUsers(period: "today" | "week" | "month" | "room" = "today") {
  const profile = getUserProfile();
  const title = getEquippedTitle();
  const level = getLevelProgress(profile);
  const favorites = getFavoriteBadges();
  const meMinutes = period === "today" ? 263 : period === "week" ? 1240 : 4380;
  const users: RankingUser[] = [
    {
      id: "me",
      rank: 2,
      name: "Demo Discord",
      avatarUrl: profile.avatar_url,
      title: title.name,
      level: level.level,
      focusMinutes: meMinutes,
      room: "Cafe Room",
      founder: profile.is_founder,
      premium: profile.plan === "premium",
      badges: favorites.map((badge) => badge.icon),
      discordLinked: Boolean(getDiscordUser())
    },
    {
      id: "mika",
      rank: 1,
      name: "Mika",
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/1.png",
      title: "Cafe Master",
      level: 32,
      focusMinutes: meMinutes + 75,
      room: "Library Room",
      founder: true,
      premium: true,
      badges: ["K26", "★"],
      discordLinked: true
    },
    {
      id: "sora",
      rank: 3,
      name: "Sora",
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/2.png",
      title: "Night Owl",
      level: 22,
      focusMinutes: Math.max(40, meMinutes - 48),
      room: "Night Room",
      founder: false,
      premium: true,
      badges: ["☾"],
      discordLinked: true
    },
    {
      id: "aoi",
      rank: 4,
      name: "Aoi",
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/3.png",
      title: "Bookworm",
      level: 19,
      focusMinutes: Math.max(20, meMinutes - 91),
      room: "Library Room",
      founder: false,
      premium: false,
      badges: ["◆"],
      discordLinked: true
    }
  ];

  return users
    .sort((a, b) => b.focusMinutes - a.focusMinutes)
    .map((user, index) => ({ ...user, rank: index + 1 }));
}

export function getFriends(): Friend[] {
  const profile = getEngagementProfile();
  return [
    {
      id: "mika",
      name: "Mika",
      avatar: "M",
      status: "focus",
      room: "Library Room",
      goal: "勉強",
      message: "今日は問題集を1章進める"
    },
    {
      id: "sora",
      name: "Sora",
      avatar: "S",
      status: "online",
      room: "Cafe Room",
      goal: "デザイン",
      message: "バナー案を作る"
    },
    {
      id: "you-note",
      name: "あなた",
      avatar: "K",
      status: "online",
      room: profile.favoriteSeat?.roomId ?? "Cafe Room",
      goal: profile.todayGoal,
      message: profile.todayMessage
    }
  ];
}

export function getReactionLogs(): ReactionLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REACTIONS_KEY);
    return raw ? (JSON.parse(raw) as ReactionLog[]) : [];
  } catch {
    return [];
  }
}

export function addReaction(
  type: ReactionType,
  roomId: string,
  seatId: string,
  toUser = "Focus Mate"
) {
  const logs = getReactionLogs();
  const next: ReactionLog = {
    id: crypto.randomUUID(),
    fromUser: "Demo Discord",
    toUser,
    roomId,
    seatId,
    type,
    createdAt: new Date().toISOString()
  };
  window.localStorage.setItem(REACTIONS_KEY, JSON.stringify([next, ...logs].slice(0, 40)));
  return next;
}

export function getDiscordUser(): { id: string; name: string; avatarUrl: string } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("kiitos:discord-demo-user");
  return raw ? (JSON.parse(raw) as { id: string; name: string; avatarUrl: string }) : null;
}

export function getMonthlyMvp() {
  const badges = getBadges().filter((badge) =>
    ["Monthly MVP", "Room MVP", "Focus Champion"].includes(badge.name)
  );
  return {
    name: "Mika",
    title: "Cafe Master",
    focusHours: 186,
    room: "Library Room",
    badges
  };
}

export function createShareCardText(input: {
  roomName: string;
  focusSeconds: number;
  xp: number;
  coin: number;
  level: number;
}) {
  const profile = getEngagementProfile();
  const tree = getFocusTreeSummary();
  return [
    "Kiitos Work Room",
    `Room: ${input.roomName}`,
    `Focus: ${Math.floor(input.focusSeconds / 3600)}h ${Math.floor((input.focusSeconds % 3600) / 60)}m`,
    `Goal: ${getGoalLabel(profile)}`,
    `XP: +${input.xp}`,
    `Coin: +${input.coin}`,
    `Level: Lv.${input.level}`,
    `Focus Tree: ${tree.stage.name}`,
    "あなたの居場所を、いつでも。"
  ].join("\n");
}

function createInitialEngagementProfile(): EngagementProfile {
  return {
    todayGoal: "動画編集",
    customGoal: "",
    todayMessage: "今日はサムネ5枚作る！",
    streakDays: 15,
    favoriteSeat: null,
    live: {
      youtubeUrl: "https://youtube.com/",
      tiktokUrl: "https://www.tiktok.com/",
      twitchUrl: "https://www.twitch.tv/",
      isLive: false
    },
    lastFocusDate: getDateKey(new Date())
  };
}

function createCalendar(): FocusCalendarDay[] {
  return Array.from({ length: 84 }, (_, index) => {
    const date = new Date(Date.now() - (83 - index) * 24 * 60 * 60 * 1000);
    return {
      date: getDateKey(date),
      minutes: index % 7 === 0 ? 0 : 15 + ((index * 23) % 190)
    };
  });
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
