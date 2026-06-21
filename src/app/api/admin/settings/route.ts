import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSettings, updateAdminSettings, verifyAdminPassword } from "@/lib/admin-state";
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
      prioritizePopularRooms?: boolean;
      disabledRooms?: string[];
      action?: AdminActionDraft;
    };
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("kiitos_admin")?.value === "1";

    if (!isAdmin && !verifyAdminPassword(body.password ?? "")) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const settings = updateAdminSettings(
      process.env.ADMIN_PASSWORD ?? body.password ?? "",
      {
        cameraIntervalSeconds: body.cameraIntervalSeconds,
        globalAnnouncement: body.globalAnnouncement,
        pomodoroRunning: body.pomodoroRunning,
        prioritizePopularRooms: body.prioritizePopularRooms,
        disabledRooms: body.disabledRooms
      },
      body.action,
      isAdmin
    );

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin update failed" },
      { status: 401 }
    );
  }
}
