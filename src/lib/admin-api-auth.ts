import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/admin-state";

export async function assertAdminRequest(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("kiitos_admin")?.value === "1") {
    return null;
  }

  const password = request.headers.get("x-admin-password");
  if (password && verifyAdminPassword(password)) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
