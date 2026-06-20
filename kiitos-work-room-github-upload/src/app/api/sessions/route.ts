import { NextResponse } from "next/server";
import { getDisplayState } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getDisplayState();
    return NextResponse.json(state);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load active sessions." }, { status: 500 });
  }
}
