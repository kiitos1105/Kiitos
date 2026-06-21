import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      realtimeEnabled: false,
      supabaseUrl: null,
      supabaseAnonKey: null
    });
  }

  return NextResponse.json({
    realtimeEnabled: true,
    supabaseUrl,
    supabaseAnonKey
  });
}
