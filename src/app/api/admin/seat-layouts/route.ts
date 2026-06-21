import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-state";
import { readSeatLayouts, writeSeatLayouts } from "@/lib/seat-layout-store";
import type { SeatLayoutsFile } from "@/lib/seat-layout-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readSeatLayouts());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    password?: string;
    layouts?: SeatLayoutsFile;
  };
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("kiitos_admin")?.value === "1";

  if (!isAdmin && !verifyAdminPassword(body.password ?? "")) {
    return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  }

  if (!body.layouts) {
    return NextResponse.json({ error: "Missing layouts" }, { status: 400 });
  }

  return NextResponse.json(await writeSeatLayouts(body.layouts));
}
