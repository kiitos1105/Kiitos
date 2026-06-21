import { NextResponse } from "next/server";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin-state";
import type { AdminActionDraft } from "@/lib/work-room";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getAdminSettings());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: string;
      cameraIntervalSeconds?: 5 | 7 | 10 | 15 | 30;
      globalAnnouncement?: string;
      pomodoroRunning?: boolean;
      disabledRooms?: string[];
      action?: AdminActionDraft;
    };

    const settings = updateAdminSettings(
      body.password ?? "",
      {
        cameraIntervalSeconds: body.cameraIntervalSeconds,
        globalAnnouncement: body.globalAnnouncement,
        pomodoroRunning: body.pomodoroRunning,
        disabledRooms: body.disabledRooms
      },
      body.action
    );

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin update failed" },
      { status: 401 }
    );
  }
}
