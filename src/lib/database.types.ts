export type Platform = "youtube" | "discord" | "web";

export type RoomRow = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
};

export type ActiveSessionRow = {
  id: string;
  platform: Platform;
  platform_user_id: string;
  display_name: string;
  room_id: string;
  seat_id: string | null;
  started_at: string;
};

export type ActiveSessionWithRoom = ActiveSessionRow & {
  rooms?: RoomRow | null;
};

export type UserRow = {
  id: string;
  platform: Platform;
  platform_user_id: string;
  display_name: string;
  level: number;
  xp: number;
  coin: number;
  total_focus_time: number;
  current_title: string | null;
  favorite_badges: string[];
  focus_tree_stage: string;
  focus_tree_updated_at: string | null;
  created_at: string;
};

export type FocusTreeRow = {
  user_id: string;
  stage: string;
  total_focus_time: number;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: RoomRow;
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
        };
        Update: Partial<RoomRow>;
        Relationships: [];
      };
      users: {
        Row: UserRow;
        Insert: {
          id?: string;
          platform: Platform;
          platform_user_id: string;
          display_name: string;
          level?: number;
          xp?: number;
          coin?: number;
          total_focus_time?: number;
          current_title?: string | null;
          favorite_badges?: string[];
          focus_tree_stage?: string;
          focus_tree_updated_at?: string | null;
          created_at?: string;
        };
        Update: Partial<UserRow>;
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
          seat_id?: string | null;
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
      focus_trees: {
        Row: FocusTreeRow;
        Insert: {
          user_id: string;
          stage?: string;
          total_focus_time?: number;
          updated_at?: string;
        };
        Update: Partial<FocusTreeRow>;
        Relationships: [
          {
            foreignKeyName: "focus_trees_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
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
