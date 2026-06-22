"use client";

export type Plan = "free" | "premium";

export type InviteCode = {
  code: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  grantPlan: Plan;
  grantsBetaTester: boolean;
  createdAt: string;
};

export type CustomRoomSeat = {
  seatId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CustomRoomTypeId =
  | "cafe-style"
  | "library-style"
  | "office-style"
  | "creator-style"
  | "night-style"
  | "minimal-style"
  | "rainy-style"
  | "private-studio";

export type CustomRoomTypeTemplate = {
  id: CustomRoomTypeId;
  name: string;
  description: string;
  useCase: string;
  capacityGuide: string;
  recommendedCapacity: number;
  bgm: string;
  visibilityHint: string;
  imageUrl: string;
  theme: string;
  defaultRules: string[];
  seatLayoutTemplate: "cafe" | "library" | "office" | "creator" | "night" | "minimal";
};

export type CustomRoomParticipant = {
  id: string;
  name: string;
  seatId: string;
  startedAt: string;
};

export type CustomRoom = {
  id: string;
  ownerId: string;
  ownerName: string;
  room_type: string;
  template_id: string;
  name: string;
  description: string;
  theme: string;
  default_bgm: string;
  default_rules: string[];
  seat_layout_template: string;
  image_url: string;
  is_public: boolean;
  invite_code: string;
  backgroundImage: string;
  bgm: string;
  visibility: "public" | "private";
  capacity: number;
  suspended: boolean;
  createdAt: string;
  expiresAt?: string;
  freeDailyPrivate?: boolean;
  participants: CustomRoomParticipant[];
  seats: CustomRoomSeat[];
};

export const PREMIUM_STORAGE_KEY = "kiitos:premium-plan";
export const CUSTOM_ROOMS_STORAGE_KEY = "kiitos:custom-rooms";
export const CUSTOM_ROOM_EVENT = "kiitos:custom-room-change";
export const FREE_PRIVATE_USAGE_KEY = "kiitos:free-private-room-usage";
export const INVITE_CODES_STORAGE_KEY = "kiitos:invite-codes";

const DEFAULT_CUSTOM_SEATS: CustomRoomSeat[] = [
  { seatId: "S1", name: "窓辺の席", x: 20, y: 34, width: 9, height: 11 },
  { seatId: "S2", name: "木目デスク", x: 34, y: 44, width: 9, height: 11 },
  { seatId: "S3", name: "暖色ライト席", x: 48, y: 38, width: 9, height: 11 },
  { seatId: "S4", name: "静かな中央席", x: 62, y: 50, width: 9, height: 11 },
  { seatId: "S5", name: "ソファ横", x: 76, y: 35, width: 9, height: 11 },
  { seatId: "S6", name: "深夜集中席", x: 24, y: 68, width: 9, height: 11 },
  { seatId: "S7", name: "BGM近く", x: 43, y: 70, width: 9, height: 11 },
  { seatId: "S8", name: "奥の作業席", x: 68, y: 72, width: 9, height: 11 }
];

const MINIMAL_SEATS: CustomRoomSeat[] = [
  { seatId: "M1", name: "Minimal Desk 1", x: 28, y: 38, width: 10, height: 12 },
  { seatId: "M2", name: "Minimal Desk 2", x: 50, y: 42, width: 10, height: 12 },
  { seatId: "M3", name: "Minimal Desk 3", x: 72, y: 38, width: 10, height: 12 },
  { seatId: "M4", name: "Silent Seat", x: 38, y: 68, width: 10, height: 12 },
  { seatId: "M5", name: "Deep Focus Seat", x: 62, y: 68, width: 10, height: 12 }
];

const CUSTOM_ROOM_TEMPLATES: CustomRoomTypeTemplate[] = [
  {
    id: "cafe-style",
    name: "Cafe Style",
    description: "木目、暖色、Lo-Fi、雑談OK。",
    useCase: "ゆるく作業、雑談少し、雨の日の集中",
    capacityGuide: "6〜8人",
    recommendedCapacity: 8,
    bgm: "Lo-Fi Rain",
    visibilityHint: "公開向き",
    imageUrl: "/rooms/cafe-room.png",
    theme: "Apple × Nordic Cafe",
    defaultRules: ["短い雑談OK", "BGMと雨音を楽しむ", "長文チャットは控えめに"],
    seatLayoutTemplate: "cafe"
  },
  {
    id: "library-style",
    name: "Library Style",
    description: "本棚、静寂、勉強、読書向け。",
    useCase: "読書、勉強、資格学習",
    capacityGuide: "6〜8人",
    recommendedCapacity: 8,
    bgm: "Quiet Pages",
    visibilityHint: "公開向き",
    imageUrl: "/rooms/library-room.png",
    theme: "Silent Library",
    defaultRules: ["会話禁止", "通知音OFF", "読書・勉強優先"],
    seatLayoutTemplate: "library"
  },
  {
    id: "office-style",
    name: "Office Style",
    description: "仕事、会議、デスク作業向け。",
    useCase: "事務作業、タスク処理、仕事",
    capacityGuide: "6〜8人",
    recommendedCapacity: 8,
    bgm: "Glass Desk Minimal",
    visibilityHint: "公開/非公開どちらも",
    imageUrl: "/rooms/office-room.png",
    theme: "Black Glass Office",
    defaultRules: ["仕事優先", "会議中はミュート", "集中時間を尊重"],
    seatLayoutTemplate: "office"
  },
  {
    id: "creator-style",
    name: "Creator Style",
    description: "動画編集、デザイン、制作向け。",
    useCase: "編集、デザイン、制作配信",
    capacityGuide: "5〜8人",
    recommendedCapacity: 8,
    bgm: "Future Edit Booth",
    visibilityHint: "公開向き",
    imageUrl: "/rooms/creator-room.png",
    theme: "Creator Neon",
    defaultRules: ["制作作業歓迎", "進捗共有OK", "ネタバレ注意"],
    seatLayoutTemplate: "creator"
  },
  {
    id: "night-style",
    name: "Night Style",
    description: "深夜作業、暗め、長時間集中向け。",
    useCase: "深夜作業、締切前、長時間集中",
    capacityGuide: "5〜8人",
    recommendedCapacity: 8,
    bgm: "Moonlight Long Focus",
    visibilityHint: "公開/非公開どちらも",
    imageUrl: "/rooms/night-room.png",
    theme: "Midnight Focus",
    defaultRules: ["深夜モード", "休憩を忘れない", "静かに長く集中"],
    seatLayoutTemplate: "night"
  },
  {
    id: "minimal-style",
    name: "Minimal Style",
    description: "シンプル、無音、集中特化。",
    useCase: "無音集中、タイマー作業、短時間集中",
    capacityGuide: "3〜5人",
    recommendedCapacity: 5,
    bgm: "Silent Focus",
    visibilityHint: "非公開向き",
    imageUrl: "/images/home-bg.jpeg",
    theme: "Minimal Focus",
    defaultRules: ["会話なし", "BGMなし", "集中ログのみ"],
    seatLayoutTemplate: "minimal"
  },
  {
    id: "rainy-style",
    name: "Rainy Style",
    description: "雨音、窓際、落ち着いた空間。",
    useCase: "雨音集中、夜カフェ、読書",
    capacityGuide: "4〜8人",
    recommendedCapacity: 6,
    bgm: "Soft Rain Window",
    visibilityHint: "公開向き",
    imageUrl: "/rooms/cafe-room.png",
    theme: "Rainy Window",
    defaultRules: ["雨音を楽しむ", "静かな雑談OK", "落ち着いた作業"],
    seatLayoutTemplate: "cafe"
  },
  {
    id: "private-studio",
    name: "Private Studio",
    description: "少人数向け、非公開作業部屋。",
    useCase: "友人作業、チーム制作、限定部屋",
    capacityGuide: "2〜4人",
    recommendedCapacity: 4,
    bgm: "Private Warm Studio",
    visibilityHint: "非公開向き",
    imageUrl: "/rooms/creator-room.png",
    theme: "Private Studio",
    defaultRules: ["招待制", "少人数で集中", "外部共有は控えめに"],
    seatLayoutTemplate: "minimal"
  }
];

export function getCurrentPlan(): Plan {
  if (typeof window === "undefined") {
    return "free";
  }

  return window.localStorage.getItem(PREMIUM_STORAGE_KEY) === "premium" ? "premium" : "free";
}

export function setCurrentPlan(plan: Plan) {
  window.localStorage.setItem(PREMIUM_STORAGE_KEY, plan);
  window.dispatchEvent(new Event("storage"));
}

export function grantPremiumDemo(source = "demo") {
  setCurrentPlan("premium");
  return { plan: "premium" as Plan, source };
}

export function isPremiumUser() {
  return getCurrentPlan() === "premium";
}

export function readCustomRooms(): CustomRoom[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_ROOMS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CustomRoom[];
    return Array.isArray(parsed) ? parsed.map(normalizeCustomRoom) : [];
  } catch {
    return [];
  }
}

export function saveCustomRooms(rooms: CustomRoom[]) {
  window.localStorage.setItem(CUSTOM_ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event(CUSTOM_ROOM_EVENT));
  window.dispatchEvent(new Event("storage"));
}

export function upsertCustomRoom(room: CustomRoom) {
  const rooms = readCustomRooms();
  const exists = rooms.some((item) => item.id === room.id);
  saveCustomRooms(
    exists ? rooms.map((item) => (item.id === room.id ? room : item)) : [room, ...rooms]
  );
}

export function deleteCustomRoom(roomId: string) {
  saveCustomRooms(readCustomRooms().filter((room) => room.id !== roomId));
}

export function getFreePrivateRoomUsage(date = getDateKey(new Date())) {
  if (typeof window === "undefined") {
    return { date, count: 0 };
  }

  try {
    const raw = window.localStorage.getItem(FREE_PRIVATE_USAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { date: string; count: number }) : null;
    return parsed?.date === date ? parsed : { date, count: 0 };
  } catch {
    return { date, count: 0 };
  }
}

export function canCreateFreePrivateRoom() {
  return getFreePrivateRoomUsage().count < 1;
}

export function recordFreePrivateRoomCreation() {
  const usage = getFreePrivateRoomUsage();
  window.localStorage.setItem(
    FREE_PRIVATE_USAGE_KEY,
    JSON.stringify({ date: usage.date, count: usage.count + 1 })
  );
}

export function createCustomRoom(input: {
  name: string;
  description: string;
  roomTypeId?: CustomRoomTypeId;
  theme: string;
  backgroundImage: string;
  bgm: string;
  visibility: "public" | "private";
  capacity: number;
  freeDailyPrivate?: boolean;
}) {
  const template = getCustomRoomTypeTemplate(input.roomTypeId ?? "cafe-style");
  const imageUrl = input.backgroundImage || template.imageUrl;
  const isPublic = input.visibility === "public";
  const createdAt = new Date();
  const room: CustomRoom = {
    id: `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    ownerId: "discord-demo-user",
    ownerName: "Demo Discord User",
    room_type: template.name,
    template_id: template.id,
    name: input.name,
    description: input.description,
    theme: input.theme || template.theme,
    default_bgm: template.bgm,
    default_rules: template.defaultRules,
    seat_layout_template: template.seatLayoutTemplate,
    image_url: imageUrl,
    is_public: isPublic,
    invite_code: createInviteCode(),
    backgroundImage: imageUrl,
    bgm: input.bgm || template.bgm,
    visibility: input.visibility,
    capacity: input.capacity,
    suspended: false,
    createdAt: createdAt.toISOString(),
    expiresAt: input.freeDailyPrivate
      ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    freeDailyPrivate: Boolean(input.freeDailyPrivate),
    participants: [],
    seats: getSeatsForTemplate(template.seatLayoutTemplate).slice(
      0,
      Math.max(1, Math.min(input.capacity, getSeatsForTemplate(template.seatLayoutTemplate).length))
    )
  };

  upsertCustomRoom(room);
  if (input.freeDailyPrivate) {
    recordFreePrivateRoomCreation();
  }
  return room;
}

export function getCustomRoom(roomId: string) {
  return readCustomRooms().find((room) => room.id === roomId) ?? null;
}

export function seedDemoCustomRooms() {
  const current = readCustomRooms();
  if (current.length > 0) {
    return current;
  }

  const demo: CustomRoom = {
    id: "demo-nordic-cafe",
    ownerId: "discord-demo-owner",
    ownerName: "Kiitos Host",
    room_type: "Cafe Style",
    template_id: "cafe-style",
    name: "Small Nordic Cafe",
    description: "少人数で静かに作業する、暖色ライトのカスタム作業部屋。",
    theme: "Nordic Cafe",
    default_bgm: "Warm Lo-Fi Piano",
    default_rules: ["短い雑談OK", "BGMと雨音を楽しむ", "長文チャットは控えめに"],
    seat_layout_template: "cafe",
    image_url: "/images/home-bg.jpeg",
    is_public: true,
    invite_code: "KIITOS-DEMO",
    backgroundImage: "/images/home-bg.jpeg",
    bgm: "Warm Lo-Fi Piano",
    visibility: "public",
    capacity: 8,
    suspended: false,
    createdAt: new Date().toISOString(),
    participants: [
      {
        id: "demo-mika",
        name: "Mika",
        seatId: "S2",
        startedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString()
      }
    ],
    seats: DEFAULT_CUSTOM_SEATS
  };

  saveCustomRooms([demo]);
  return [demo];
}

export function getCustomRoomTypeTemplates() {
  return CUSTOM_ROOM_TEMPLATES;
}

export function getCustomRoomTypeTemplate(templateId: string) {
  return (
    CUSTOM_ROOM_TEMPLATES.find((template) => template.id === templateId) ?? CUSTOM_ROOM_TEMPLATES[0]
  );
}

export function getSeatsForTemplate(template: string) {
  if (template === "minimal") {
    return MINIMAL_SEATS;
  }

  return DEFAULT_CUSTOM_SEATS;
}

function normalizeCustomRoom(room: CustomRoom): CustomRoom {
  const template = getCustomRoomTypeTemplate(room.template_id ?? "cafe-style");
  const visibility = room.visibility ?? (room.is_public === false ? "private" : "public");
  const imageUrl = room.image_url ?? room.backgroundImage ?? template.imageUrl;

  return {
    ...room,
    room_type: room.room_type ?? template.name,
    template_id: room.template_id ?? template.id,
    default_bgm: room.default_bgm ?? template.bgm,
    default_rules: room.default_rules ?? template.defaultRules,
    seat_layout_template: room.seat_layout_template ?? template.seatLayoutTemplate,
    image_url: imageUrl,
    is_public: room.is_public ?? visibility === "public",
    invite_code: room.invite_code ?? createInviteCode(),
    backgroundImage: room.backgroundImage ?? imageUrl,
    bgm: room.bgm ?? template.bgm,
    visibility,
    expiresAt: room.expiresAt,
    freeDailyPrivate: Boolean(room.freeDailyPrivate),
    seats: room.seats?.length ? room.seats : getSeatsForTemplate(template.seatLayoutTemplate)
  };
}

export function getInviteCodes(): InviteCode[] {
  if (typeof window === "undefined") {
    return createInitialInviteCodes();
  }

  try {
    const raw = window.localStorage.getItem(INVITE_CODES_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialInviteCodes();
      window.localStorage.setItem(INVITE_CODES_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as InviteCode[];
    return Array.isArray(parsed) ? parsed : createInitialInviteCodes();
  } catch {
    return createInitialInviteCodes();
  }
}

export function saveInviteCodes(codes: InviteCode[]) {
  window.localStorage.setItem(INVITE_CODES_STORAGE_KEY, JSON.stringify(codes));
  window.dispatchEvent(new Event("storage"));
}

export function createPremiumInviteCode(input: {
  code: string;
  maxUses: number;
  expiresAt: string;
  grantPlan: Plan;
  grantsBetaTester: boolean;
}) {
  const code: InviteCode = {
    ...input,
    code: input.code.trim().toUpperCase(),
    usedCount: 0,
    createdAt: new Date().toISOString()
  };
  saveInviteCodes([code, ...getInviteCodes().filter((item) => item.code !== code.code)]);
  return code;
}

export function redeemInviteCode(rawCode: string) {
  const code = rawCode.trim().toUpperCase();
  const codes = getInviteCodes();
  const found = codes.find((item) => item.code === code);

  if (!found) {
    return { ok: false, message: "招待コードが見つかりません。" };
  }

  if (new Date(found.expiresAt).getTime() < Date.now()) {
    return { ok: false, message: "招待コードの有効期限が切れています。" };
  }

  if (found.usedCount >= found.maxUses) {
    return { ok: false, message: "招待コードの使用回数上限に達しています。" };
  }

  saveInviteCodes(
    codes.map((item) => (item.code === code ? { ...item, usedCount: item.usedCount + 1 } : item))
  );
  setCurrentPlan(found.grantPlan);
  return {
    ok: true,
    message:
      found.grantPlan === "premium" ? "Premium Demoを付与しました。" : "Freeに設定しました。",
    code: found
  };
}

function createInviteCode() {
  return `KIITOS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function createInitialInviteCodes(): InviteCode[] {
  return [
    {
      code: "KIITOS-BETA",
      maxUses: 100,
      usedCount: 0,
      expiresAt: "2026-09-01T00:00:00.000Z",
      grantPlan: "premium",
      grantsBetaTester: true,
      createdAt: "2026-06-21T00:00:00.000Z"
    }
  ];
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
