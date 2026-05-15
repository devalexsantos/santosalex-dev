import { type NextRequest, NextResponse } from "next/server";
import { signOutAdmin } from "@/lib/auth/admin-session";

export async function POST(_req: NextRequest) {
  await signOutAdmin();
  return NextResponse.redirect(new URL("/admin/login", _req.url));
}
