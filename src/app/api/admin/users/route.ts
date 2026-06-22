import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/lib/admin-api-auth";
import { getAdminUsers } from "@/lib/admin-user-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json({ users: getAdminUsers() });
}
