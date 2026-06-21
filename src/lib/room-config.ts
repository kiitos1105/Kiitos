export const ROOM_CONFIGS = [
  {
    id: "cafe",
    name: "Cafe Room",
    shortName: "Cafe",
    image: "/rooms/cafe.jpg",
    icon: "☕",
    description: "木目、暖色ライト、Lo-Fi、雨音。少しだけ雑談OKのカフェ席。",
    mood: "Lo-Fi / Rain / Soft talk",
    accent: {
      glow: "from-amber-200/35",
      line: "bg-[#b8834d]",
      text: "text-amber-100",
      avatar: "from-amber-100 to-orange-300"
    }
  },
  {
    id: "library",
    name: "Library Room",
    shortName: "Library",
    image: "/rooms/library.jpg",
    icon: "📚",
    description: "静かな自習室。本棚、読書、勉強向け。会話禁止の深い集中席。",
    mood: "Silent / Reading / Study",
    accent: {
      glow: "from-emerald-200/28",
      line: "bg-[#6f7b55]",
      text: "text-emerald-100",
      avatar: "from-emerald-100 to-lime-300"
    }
  },
  {
    id: "office",
    name: "Office Room",
    shortName: "Office",
    image: "/rooms/office.jpg",
    icon: "▦",
    description: "黒ガラス、デスク、仕事、事務作業。タスクを静かに片づける部屋。",
    mood: "Work / Admin / Focus",
    accent: {
      glow: "from-slate-200/24",
      line: "bg-[#7e8b94]",
      text: "text-slate-100",
      avatar: "from-slate-100 to-zinc-400"
    }
  },
  {
    id: "creator",
    name: "Creator Room",
    shortName: "Creator",
    image: "/rooms/creator.jpg",
    icon: "✦",
    description: "動画編集、デザイン、制作作業向け。少し近未来感のある作業席。",
    mood: "Edit / Design / Build",
    accent: {
      glow: "from-cyan-200/28",
      line: "bg-[#4e91a3]",
      text: "text-cyan-100",
      avatar: "from-cyan-100 to-fuchsia-300"
    }
  },
  {
    id: "night",
    name: "Night Room",
    shortName: "Night",
    image: "/rooms/night.jpg",
    icon: "☾",
    description: "深夜作業、暗め、月明かり。長時間じっくり集中する夜の部屋。",
    mood: "Midnight / Moon / Long focus",
    accent: {
      glow: "from-indigo-200/30",
      line: "bg-[#6867a6]",
      text: "text-indigo-100",
      avatar: "from-indigo-100 to-violet-400"
    }
  }
] as const;

export type RoomId = (typeof ROOM_CONFIGS)[number]["id"];

export type SeatPosition = {
  id: string;
  x: number;
  y: number;
  label: string;
};

export const ROOM_SEAT_POSITIONS: Record<RoomId, SeatPosition[]> = {
  cafe: [
    { id: "A1", x: 18, y: 36, label: "窓側席" },
    { id: "A2", x: 32, y: 43, label: "窓側席" },
    { id: "A3", x: 46, y: 37, label: "木目テーブル" },
    { id: "A4", x: 62, y: 47, label: "観葉植物横" },
    { id: "B1", x: 24, y: 65, label: "カウンター席" },
    { id: "B2", x: 41, y: 68, label: "カウンター席" },
    { id: "B3", x: 58, y: 66, label: "木目テーブル" },
    { id: "B4", x: 76, y: 58, label: "奥の席" },
    { id: "C1", x: 15, y: 78, label: "雨音席" },
    { id: "C2", x: 35, y: 82, label: "ソファ席" },
    { id: "C3", x: 57, y: 80, label: "丸テーブル" },
    { id: "C4", x: 82, y: 74, label: "暖炉横" }
  ],
  library: [
    { id: "A1", x: 20, y: 34, label: "本棚横" },
    { id: "A2", x: 36, y: 35, label: "本棚横" },
    { id: "A3", x: 52, y: 36, label: "読書机" },
    { id: "A4", x: 70, y: 34, label: "読書机" },
    { id: "B1", x: 24, y: 57, label: "静音席" },
    { id: "B2", x: 42, y: 59, label: "静音席" },
    { id: "B3", x: 60, y: 58, label: "集中席" },
    { id: "B4", x: 78, y: 55, label: "集中席" },
    { id: "C1", x: 18, y: 76, label: "窓際読書席" },
    { id: "C2", x: 38, y: 79, label: "個別机" },
    { id: "C3", x: 59, y: 79, label: "個別机" },
    { id: "C4", x: 82, y: 74, label: "奥の静寂席" }
  ],
  office: [
    { id: "A1", x: 19, y: 37, label: "デスク席" },
    { id: "A2", x: 35, y: 38, label: "デスク席" },
    { id: "A3", x: 51, y: 38, label: "黒ガラス席" },
    { id: "A4", x: 68, y: 36, label: "黒ガラス席" },
    { id: "B1", x: 25, y: 58, label: "作業ブース" },
    { id: "B2", x: 44, y: 60, label: "作業ブース" },
    { id: "B3", x: 63, y: 59, label: "会議室風席" },
    { id: "B4", x: 80, y: 56, label: "会議室風席" },
    { id: "C1", x: 19, y: 78, label: "窓際デスク" },
    { id: "C2", x: 39, y: 80, label: "集中デスク" },
    { id: "C3", x: 59, y: 80, label: "集中デスク" },
    { id: "C4", x: 79, y: 76, label: "奥のブース" }
  ],
  creator: [
    { id: "A1", x: 18, y: 38, label: "編集ブース" },
    { id: "A2", x: 34, y: 40, label: "編集ブース" },
    { id: "A3", x: 51, y: 37, label: "モニター席" },
    { id: "A4", x: 69, y: 39, label: "モニター席" },
    { id: "B1", x: 24, y: 60, label: "デザイン席" },
    { id: "B2", x: 43, y: 62, label: "デザイン席" },
    { id: "B3", x: 63, y: 61, label: "プレビュー席" },
    { id: "B4", x: 81, y: 57, label: "配信席" },
    { id: "C1", x: 17, y: 79, label: "音声チェック席" },
    { id: "C2", x: 38, y: 81, label: "カラールーム" },
    { id: "C3", x: 59, y: 80, label: "制作机" },
    { id: "C4", x: 81, y: 74, label: "レンダー待機席" }
  ],
  night: [
    { id: "A1", x: 20, y: 35, label: "月明かり席" },
    { id: "A2", x: 37, y: 36, label: "月明かり席" },
    { id: "A3", x: 54, y: 37, label: "深夜席" },
    { id: "A4", x: 72, y: 36, label: "深夜席" },
    { id: "B1", x: 24, y: 58, label: "長時間集中席" },
    { id: "B2", x: 43, y: 60, label: "長時間集中席" },
    { id: "B3", x: 62, y: 59, label: "静かな隅" },
    { id: "B4", x: 80, y: 56, label: "静かな隅" },
    { id: "C1", x: 18, y: 78, label: "夜景席" },
    { id: "C2", x: 38, y: 80, label: "仮眠前席" },
    { id: "C3", x: 59, y: 80, label: "ロングラン席" },
    { id: "C4", x: 82, y: 75, label: "朝まで席" }
  ]
};

export function getRoomConfig(roomIdOrName: string) {
  return (
    ROOM_CONFIGS.find((room) => room.id === roomIdOrName || room.name === roomIdOrName) ??
    ROOM_CONFIGS[0]
  );
}
