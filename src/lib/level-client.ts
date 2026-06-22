"use client";

import {
  getUserProfile,
  grantBadge,
  grantTitle,
  saveUserProfile,
  type UserProfile
} from "./badges-client";

export type XpReason =
  | "login"
  | "focus_30m"
  | "focus_1h"
  | "focus_2h"
  | "focus_4h"
  | "daily_goal"
  | "streak_7"
  | "event"
  | "founder"
  | "premium_daily"
  | "admin";

export type FocusTreeStage = {
  id: string;
  name: string;
  icon: string;
  minHours: number;
  maxHours?: number;
  nextName?: string;
  badgeId?: string;
};

export type FocusResult = {
  focusSeconds: number;
  xp: number;
  coin: number;
  previousLevel: number;
  nextLevel: number;
  levelUp: boolean;
  yesterdayDiffSeconds: number;
  tree: FocusTreeStage;
  nextTree: FocusTreeStage | null;
  hoursToNextTree: number;
  unlockedBadges: string[];
};

export const XP_REWARDS: Record<XpReason, number> = {
  login: 5,
  focus_30m: 30,
  focus_1h: 70,
  focus_2h: 160,
  focus_4h: 350,
  daily_goal: 100,
  streak_7: 300,
  event: 200,
  founder: 500,
  premium_daily: 50,
  admin: 0
};

export const FOCUS_TREE_STAGES: FocusTreeStage[] = [
  { id: "seed", name: "Seed", icon: "・", minHours: 0, maxHours: 9, nextName: "Sprout" },
  {
    id: "sprout",
    name: "Sprout",
    icon: "🌱",
    minHours: 10,
    maxHours: 99,
    nextName: "Young Tree",
    badgeId: "sprout-badge"
  },
  {
    id: "young-tree",
    name: "Young Tree",
    icon: "🌿",
    minHours: 100,
    maxHours: 499,
    nextName: "Big Tree",
    badgeId: "young-tree-badge"
  },
  {
    id: "big-tree",
    name: "Big Tree",
    icon: "🌳",
    minHours: 500,
    maxHours: 999,
    nextName: "Bloom Tree",
    badgeId: "big-tree-badge"
  },
  {
    id: "bloom-tree",
    name: "Bloom Tree",
    icon: "🌸",
    minHours: 1000,
    maxHours: 4999,
    nextName: "Legend Tree",
    badgeId: "bloom-tree-badge"
  },
  {
    id: "legend-tree",
    name: "Legend Tree",
    icon: "✨",
    minHours: 5000,
    badgeId: "legend-tree-badge"
  }
];

const LEVEL_TITLE_UNLOCKS = [
  { level: 5, titleId: "focus-beginner" },
  { level: 10, titleId: "cafe-explorer" },
  { level: 20, titleId: "focus-worker" },
  { level: 30, titleId: "night-worker" },
  { level: 50, titleId: "focus-master" },
  { level: 75, titleId: "productivity-pro" },
  { level: 100, titleId: "kiitos-legend" }
];

export function getLevelFromXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 12)) + 1);
}

export function getXpForLevel(level: number) {
  return Math.max(0, Math.pow(Math.max(1, level - 1), 2) * 12);
}

export function getLevelProgress(profile = getUserProfile()) {
  const level = getLevelFromXp(profile.xp);
  const current = getXpForLevel(level);
  const next = getXpForLevel(level + 1);
  const progress = Math.min(100, Math.round(((profile.xp - current) / (next - current)) * 100));

  return {
    level,
    xp: profile.xp,
    currentLevelXp: current,
    nextLevelXp: next,
    toNext: Math.max(0, next - profile.xp),
    progress
  };
}

export function addXp(amount: number, options: { coin?: number; focusSeconds?: number } = {}) {
  const profile = getUserProfile();
  const previousLevel = getLevelFromXp(profile.xp);
  const nextXp = Math.max(0, profile.xp + amount);
  const nextLevel = getLevelFromXp(nextXp);
  const nextProfile: UserProfile = {
    ...profile,
    xp: nextXp,
    level: nextLevel,
    coin: Math.max(0, profile.coin + (options.coin ?? 0)),
    total_focus_time: profile.total_focus_time + (options.focusSeconds ?? 0),
    focus_tree_updated_at: new Date().toISOString()
  };
  const tree = getFocusTreeStage(nextProfile.total_focus_time);
  nextProfile.focus_tree_stage = tree.name;
  saveUserProfile(nextProfile);
  unlockLevelTitles(nextLevel);
  unlockTreeBadges(nextProfile.total_focus_time);

  return { previousLevel, nextLevel, levelUp: nextLevel > previousLevel, profile: nextProfile };
}

export function setLevelProfile(input: {
  xp?: number;
  level?: number;
  coin?: number;
  totalFocusSeconds?: number;
  focusTreeStage?: string;
}) {
  const profile = getUserProfile();
  const nextXp =
    input.level !== undefined
      ? Math.max(input.xp ?? 0, getXpForLevel(input.level))
      : Math.max(0, input.xp ?? profile.xp);
  const totalFocusSeconds = Math.max(0, input.totalFocusSeconds ?? profile.total_focus_time);
  const tree = getFocusTreeStage(totalFocusSeconds);
  const nextProfile: UserProfile = {
    ...profile,
    xp: nextXp,
    level: getLevelFromXp(nextXp),
    coin: Math.max(0, input.coin ?? profile.coin),
    total_focus_time: totalFocusSeconds,
    focus_tree_stage: input.focusTreeStage ?? tree.name,
    focus_tree_updated_at: new Date().toISOString()
  };

  saveUserProfile(nextProfile);
  unlockLevelTitles(nextProfile.level);
  unlockTreeBadges(nextProfile.total_focus_time);
  return nextProfile;
}

export function awardFocusSession(focusSeconds: number): FocusResult {
  const profile = getUserProfile();
  const xp = calculateFocusXp(focusSeconds);
  const coin = Math.max(10, Math.round(focusSeconds / 60));
  const previousLevel = getLevelFromXp(profile.xp);
  const next = addXp(xp, { coin, focusSeconds });
  const updatedProfile = getUserProfile();
  const tree = getFocusTreeStage(updatedProfile.total_focus_time);
  const nextTree = getNextFocusTreeStage(updatedProfile.total_focus_time);
  const unlockedBadges = unlockTreeBadges(updatedProfile.total_focus_time);

  return {
    focusSeconds,
    xp,
    coin,
    previousLevel,
    nextLevel: next.nextLevel,
    levelUp: next.levelUp,
    yesterdayDiffSeconds: 35 * 60,
    tree,
    nextTree,
    hoursToNextTree: nextTree
      ? Math.max(0, nextTree.minHours - Math.floor(updatedProfile.total_focus_time / 3600))
      : 0,
    unlockedBadges
  };
}

export function calculateFocusXp(seconds: number) {
  if (seconds >= 4 * 3600) return XP_REWARDS.focus_4h;
  if (seconds >= 2 * 3600) return XP_REWARDS.focus_2h;
  if (seconds >= 3600) return XP_REWARDS.focus_1h;
  if (seconds >= 30 * 60) return XP_REWARDS.focus_30m;
  return Math.max(5, Math.round(seconds / 120));
}

export function getFocusTreeStage(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  return (
    FOCUS_TREE_STAGES.find(
      (stage) =>
        hours >= stage.minHours && (stage.maxHours === undefined || hours <= stage.maxHours)
    ) ?? FOCUS_TREE_STAGES[0]
  );
}

export function getNextFocusTreeStage(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  return FOCUS_TREE_STAGES.find((stage) => stage.minHours > hours) ?? null;
}

export function getFocusTreeSummary(profile = getUserProfile()) {
  const stage = getFocusTreeStage(profile.total_focus_time);
  const next = getNextFocusTreeStage(profile.total_focus_time);
  const totalHours = Math.floor(profile.total_focus_time / 3600);

  return {
    stage,
    next,
    totalHours,
    hoursToNext: next ? Math.max(0, next.minHours - totalHours) : 0
  };
}

export function playLevelUpSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const gain = context.createGain();
    const first = context.createOscillator();
    const second = context.createOscillator();
    first.type = "sine";
    second.type = "triangle";
    first.frequency.setValueAtTime(523.25, context.currentTime);
    first.frequency.exponentialRampToValueAtTime(783.99, context.currentTime + 0.22);
    second.frequency.setValueAtTime(659.25, context.currentTime + 0.08);
    second.frequency.exponentialRampToValueAtTime(1046.5, context.currentTime + 0.38);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.72);
    first.connect(gain);
    second.connect(gain);
    gain.connect(context.destination);
    first.start();
    second.start(context.currentTime + 0.08);
    first.stop(context.currentTime + 0.48);
    second.stop(context.currentTime + 0.72);
  } catch {
    // Audio is a bonus effect. The level state remains updated when autoplay is blocked.
  }
}

function unlockLevelTitles(level: number) {
  LEVEL_TITLE_UNLOCKS.forEach((item) => {
    if (level >= item.level) {
      grantTitle(item.titleId, "level-system");
    }
  });
}

function unlockTreeBadges(totalSeconds: number) {
  const unlocked: string[] = [];
  const totalHours = Math.floor(totalSeconds / 3600);

  FOCUS_TREE_STAGES.forEach((stage) => {
    if (stage.badgeId && totalHours >= stage.minHours) {
      const granted = grantBadge(stage.badgeId, "focus-tree");
      if (granted) {
        unlocked.push(stage.badgeId);
      }
    }
  });

  return unlocked;
}
