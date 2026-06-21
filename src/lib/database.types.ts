export type Platform = "youtube" | "discord";

export type RoomRow = {
  id: string;
  name: string;
};

export type ActiveSessionRow = {
  id: string;
  platform: Platform;
  platform_user_id: string;
  display_name: string;
  room_id: string;
  started_at: string;
};

export type ActiveSessionWithRoom = ActiveSessionRow & {
  rooms?: RoomRow | null;
};

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: RoomRow;
        Insert: {
          id?: string;
          name: string;
        };
        Update: Partial<RoomRow>;
        Relationships: [];
      };
      active_sessions: {
        Row: ActiveSessionRow;
        Insert: {
          id?: string;
          platform: Platform;
          platform_user_id: string;
          display_name: string;
          room_id: string;
          started_at?: string;
        };
        Update: Partial<ActiveSessionRow>;
        Relationships: [
          {
            foreignKeyName: "active_sessions_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
