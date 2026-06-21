export const ROOM_CONFIGS = [
  {
    id: "cafe",
    name: "Cafe Room",
    shortName: "Cafe",
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

export function getRoomConfig(roomIdOrName: string) {
  return (
    ROOM_CONFIGS.find((room) => room.id === roomIdOrName || room.name === roomIdOrName) ??
    ROOM_CONFIGS[0]
  );
}
