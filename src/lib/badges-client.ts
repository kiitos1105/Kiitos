"use client";

export type BadgeCategory =
  | "Common"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Founder"
  | "Premium"
  | "Event"
  | "Staff"
  | "Secret";

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeCategory;
  category: BadgeCategory;
  color: string;
  autoGrant: boolean;
  conditions: string;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  granted_by: string;
  granted_at: string;
};

export type Title = {
  id: string;
  name: string;
  description: string;
  rarity: BadgeCategory;
  autoGrant: boolean;
  conditions: string;
  created_at: string;
};

export type UserTitle = {
  id: string;
  user_id: string;
  title_id: string;
  granted_by: string;
  granted_at: string;
};

export type UserProfile = {
  user_id: string;
  equipped_title_id: string;
  favorite_badge_ids: string[];
  avatar_url: string;
  plan: "free" | "premium";
  is_founder: boolean;
  level: number;
  xp: number;
  coin: number;
  total_focus_time: number;
  current_title: string;
  focus_tree_stage: string;
  focus_tree_updated_at: string;
};

export type BadgeNotification = {
  title: string;
  body: string;
  badgeId: string;
};

const USER_ID = "discord-demo-user";
const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";
const RELEASE_DATE = "2026-09-01";
const BADGES_STORAGE_KEY = "kiitos:badges";
const USER_BADGES_STORAGE_KEY = "kiitos:user-badges";
const TITLES_STORAGE_KEY = "kiitos:titles";
const USER_TITLES_STORAGE_KEY = "kiitos:user-titles";
const PROFILE_STORAGE_KEY = "kiitos:user-profile";
export const BADGE_EVENT = "kiitos:badge-state-change";

const COLORS: Record<BadgeCategory, string> = {
  Common: "#d6d3d1",
  Rare: "#7dd3fc",
  Epic: "#c084fc",
  Legendary: "#facc15",
  Founder: "#f5c77a",
  Premium: "#fde68a",
  Event: "#86efac",
  Staff: "#fca5a5",
  Secret: "#a78bfa"
};

const ICONS: Record<BadgeCategory, string> = {
  Common: "✦",
  Rare: "◆",
  Epic: "✧",
  Legendary: "★",
  Founder: "K",
  Premium: "VIP",
  Event: "◇",
  Staff: "STAFF",
  Secret: "?"
};

const BADGE_NAMES: Record<BadgeCategory, string[]> = {
  Founder: ["Founder 2026", "Founder Alpha", "Founder Beta"],
  Common: [
    "Welcome",
    "First Focus",
    "1 Hour",
    "Early Bird",
    "Night Owl",
    "7 Days",
    "Lo-Fi Lover",
    "Rain Lover",
    "First Friend",
    "First Chat"
  ],
  Rare: [
    "Bookworm",
    "Cafe Lover",
    "Office Worker",
    "Creator",
    "Night Walker",
    "30 Days",
    "Focus Master",
    "Top10"
  ],
  Epic: ["500 Hours", "100 Days", "Room Owner", "Beta Tester", "Community"],
  Legendary: [
    "1000 Hours",
    "Focus Legend",
    "Coffee Master",
    "Elite Creator",
    "Elite Worker",
    "Elite Scholar"
  ],
  Premium: ["Premium", "Room Builder", "Designer", "Music Lover", "VIP"],
  Event: [
    "Christmas",
    "Halloween",
    "Spring Festival",
    "Summer Night",
    "Autumn Leaves",
    "7 Day Streak",
    "30 Day Streak",
    "100 Day Streak",
    "Monthly MVP",
    "Room MVP",
    "Focus Champion"
  ],
  Staff: ["Moderator", "Admin", "Developer", "Designer", "Official"],
  Secret: ["Lucky Seat", "Cat Lover", "Rain Day", "Sunrise", "All Rooms"]
};

const TITLE_NAMES = [
  "集中ビギナー",
  "Founder",
  "Cafe Master",
  "Cafe Explorer",
  "Night Owl",
  "Night Worker",
  "Creator",
  "Office Elite",
  "Bookworm",
  "Focus Worker",
  "Focus Legend",
  "Focus Master",
  "Productivity Pro",
  "Kiitos Legend",
  "Premium Member",
  "Beta Tester",
  "Room Owner",
  "Admin",
  "Moderator"
];

const TITLE_IDS: Record<string, string> = {
  集中ビギナー: "focus-beginner"
};

export function getCurrentUserId() {
  return USER_ID;
}

export function getReleaseDate() {
  return RELEASE_DATE;
}

export function getBadges(): Badge[] {
  return mergeById(readList(BADGES_STORAGE_KEY, createInitialBadges()), createInitialBadges());
}

export function saveBadges(badges: Badge[]) {
  writeList(BADGES_STORAGE_KEY, badges);
}

export function getUserBadges(userId = USER_ID): UserBadge[] {
  return readList(USER_BADGES_STORAGE_KEY, createInitialUserBadges()).filter(
    (item) => item.user_id === userId
  );
}

export function saveAllUserBadges(userBadges: UserBadge[]) {
  writeList(USER_BADGES_STORAGE_KEY, userBadges);
  notifyStateChange();
}

export function getTitles(): Title[] {
  return mergeById(readList(TITLES_STORAGE_KEY, createInitialTitles()), createInitialTitles());
}

export function saveTitles(titles: Title[]) {
  writeList(TITLES_STORAGE_KEY, titles);
}

export function getUserTitles(userId = USER_ID): UserTitle[] {
  return readList(USER_TITLES_STORAGE_KEY, createInitialUserTitles()).filter(
    (item) => item.user_id === userId
  );
}

export function saveAllUserTitles(userTitles: UserTitle[]) {
  writeList(USER_TITLES_STORAGE_KEY, userTitles);
  notifyStateChange();
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return createInitialProfile();
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw
      ? { ...createInitialProfile(), ...(JSON.parse(raw) as UserProfile) }
      : createInitialProfile();
  } catch {
    return createInitialProfile();
  }
}

export function saveUserProfile(profile: UserProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  notifyStateChange();
}

export function grantBadge(badgeId: string, grantedBy = "system", userId = USER_ID) {
  const all = readList(USER_BADGES_STORAGE_KEY, createInitialUserBadges());
  if (all.some((item) => item.user_id === userId && item.badge_id === badgeId)) {
    return false;
  }

  saveAllUserBadges([
    ...all,
    {
      id: `user-badge-${Date.now().toString(36)}`,
      user_id: userId,
      badge_id: badgeId,
      granted_by: grantedBy,
      granted_at: new Date().toISOString()
    }
  ]);
  return true;
}

export function revokeBadge(badgeId: string, userId = USER_ID) {
  saveAllUserBadges(
    readList(USER_BADGES_STORAGE_KEY, createInitialUserBadges()).filter(
      (item) => !(item.user_id === userId && item.badge_id === badgeId)
    )
  );
}

export function grantTitle(titleId: string, grantedBy = "system", userId = USER_ID) {
  const all = readList(USER_TITLES_STORAGE_KEY, createInitialUserTitles());
  if (all.some((item) => item.user_id === userId && item.title_id === titleId)) {
    return false;
  }

  saveAllUserTitles([
    ...all,
    {
      id: `user-title-${Date.now().toString(36)}`,
      user_id: userId,
      title_id: titleId,
      granted_by: grantedBy,
      granted_at: new Date().toISOString()
    }
  ]);
  return true;
}

export function revokeTitle(titleId: string, userId = USER_ID) {
  saveAllUserTitles(
    readList(USER_TITLES_STORAGE_KEY, createInitialUserTitles()).filter(
      (item) => !(item.user_id === userId && item.title_id === titleId)
    )
  );
}

export function equipTitle(titleId: string) {
  saveUserProfile({ ...getUserProfile(), equipped_title_id: titleId });
}

export function setFavoriteBadges(badgeIds: string[]) {
  saveUserProfile({ ...getUserProfile(), favorite_badge_ids: badgeIds.slice(0, 3) });
}

export function getEquippedTitle() {
  const profile = getUserProfile();
  return getTitles().find((title) => title.id === profile.equipped_title_id) ?? getTitles()[0];
}

export function getFavoriteBadges() {
  const owned = new Set(getUserBadges().map((item) => item.badge_id));
  const badges = getBadges();
  const profile = getUserProfile();
  return profile.favorite_badge_ids
    .map((badgeId) => badges.find((badge) => badge.id === badgeId))
    .filter((badge): badge is Badge => Boolean(badge))
    .filter((badge) => owned.has(badge.id))
    .slice(0, 3);
}

export function ensureFounderBadge(now = new Date()): BadgeNotification | null {
  const release = new Date(`${RELEASE_DATE}T00:00:00+09:00`);
  if (now >= release) {
    return null;
  }

  const granted = grantBadge("founder-2026", "discord-oauth-before-release");
  grantTitle("founder", "founder-badge");
  if (!granted) {
    return null;
  }

  saveUserProfile({ ...getUserProfile(), is_founder: true, equipped_title_id: "founder" });
  return {
    title: "Badge Unlocked!",
    body: "🎉 Founder Badgeを獲得しました！ Kiitos初期メンバーありがとうございます！",
    badgeId: "founder-2026"
  };
}

export function playBadgeSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const gain = context.createGain();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.38);
  } catch {
    // Browser autoplay policies can block audio. Badge state still updates.
  }
}

function createInitialBadges(): Badge[] {
  const baseBadges = Object.entries(BADGE_NAMES).flatMap(([category, names]) =>
    names.map((name) => {
      const badgeCategory = category as BadgeCategory;
      return {
        id: slug(name),
        name,
        description: `${name} badge for Kiitos Work Room.`,
        icon: name === "Founder 2026" ? "K26" : ICONS[badgeCategory],
        rarity: badgeCategory,
        category: badgeCategory,
        color: COLORS[badgeCategory],
        autoGrant: ["Welcome", "First Focus", "Founder 2026", "Premium"].includes(name),
        conditions:
          name === "Founder 2026"
            ? `Discord OAuthで初回ログインし、${RELEASE_DATE}より前であること。`
            : "Mock条件。将来Supabase/workerで判定します。",
        created_at: "2026-06-21T00:00:00.000Z"
      };
    })
  );

  const treeBadges: Badge[] = [
    {
      id: "sprout-badge",
      name: "Sprout Badge",
      description: "10時間集中で芽が育った証。",
      icon: "🌱",
      rarity: "Common",
      category: "Common",
      color: COLORS.Common,
      autoGrant: true,
      conditions: "累計集中時間 10時間",
      created_at: "2026-06-21T00:00:00.000Z"
    },
    {
      id: "young-tree-badge",
      name: "Young Tree Badge",
      description: "100時間集中で小さな木まで育った証。",
      icon: "🌿",
      rarity: "Rare",
      category: "Rare",
      color: COLORS.Rare,
      autoGrant: true,
      conditions: "累計集中時間 100時間",
      created_at: "2026-06-21T00:00:00.000Z"
    },
    {
      id: "big-tree-badge",
      name: "Big Tree Badge",
      description: "500時間集中で大きな木まで育った証。",
      icon: "🌳",
      rarity: "Epic",
      category: "Epic",
      color: COLORS.Epic,
      autoGrant: true,
      conditions: "累計集中時間 500時間",
      created_at: "2026-06-21T00:00:00.000Z"
    },
    {
      id: "bloom-tree-badge",
      name: "Bloom Tree Badge",
      description: "1000時間集中で花が咲いた証。",
      icon: "🌸",
      rarity: "Legendary",
      category: "Legendary",
      color: COLORS.Legendary,
      autoGrant: true,
      conditions: "累計集中時間 1000時間",
      created_at: "2026-06-21T00:00:00.000Z"
    },
    {
      id: "legend-tree-badge",
      name: "Legend Tree Badge",
      description: "5000時間集中で伝説の木まで育った証。",
      icon: "✨",
      rarity: "Legendary",
      category: "Legendary",
      color: COLORS.Legendary,
      autoGrant: true,
      conditions: "累計集中時間 5000時間",
      created_at: "2026-06-21T00:00:00.000Z"
    }
  ];

  return [...baseBadges, ...treeBadges];
}

function createInitialUserBadges(): UserBadge[] {
  return ["welcome", "first-focus", "cafe-lover", "beta-tester"].map((badgeId) => ({
    id: `user-${badgeId}`,
    user_id: USER_ID,
    badge_id: badgeId,
    granted_by: "mock-seed",
    granted_at: new Date().toISOString()
  }));
}

function createInitialTitles(): Title[] {
  return TITLE_NAMES.map((name) => ({
    id: TITLE_IDS[name] ?? slug(name),
    name,
    description: `${name} title for Kiitos Work Room.`,
    rarity: name === "Focus Legend" ? "Legendary" : name === "Founder" ? "Founder" : "Rare",
    autoGrant: ["Founder", "Premium Member", "Room Owner"].includes(name),
    conditions: "Badge獲得や条件達成で自動解放できる設計です。",
    created_at: "2026-06-21T00:00:00.000Z"
  }));
}

function createInitialUserTitles(): UserTitle[] {
  return ["cafe-master", "night-owl", "beta-tester"].map((titleId) => ({
    id: `user-title-${titleId}`,
    user_id: USER_ID,
    title_id: titleId,
    granted_by: "mock-seed",
    granted_at: new Date().toISOString()
  }));
}

function createInitialProfile(): UserProfile {
  return {
    user_id: USER_ID,
    equipped_title_id: "cafe-master",
    favorite_badge_ids: ["welcome", "cafe-lover", "beta-tester"],
    avatar_url: DEFAULT_AVATAR,
    plan: "free",
    is_founder: false,
    level: 24,
    xp: 6840,
    coin: 1250,
    total_focus_time: 128 * 60 * 60,
    current_title: "cafe-master",
    focus_tree_stage: "Young Tree",
    focus_tree_updated_at: new Date().toISOString()
  };
}

function readList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  notifyStateChange();
}

function notifyStateChange() {
  window.dispatchEvent(new Event(BADGE_EVENT));
  window.dispatchEvent(new Event("storage"));
}

function slug(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || encodeURIComponent(value);
}

function mergeById<T extends { id: string }>(current: T[], seed: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return current.concat(seed.filter((item) => !ids.has(item.id)));
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
