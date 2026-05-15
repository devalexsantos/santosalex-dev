"use server";

import { redirect } from "next/navigation";
import { signInAdmin } from "@/lib/auth/admin-session";

export async function loginAction(password: string): Promise<{ error: string } | void> {
  const success = await signInAdmin(password);
  if (!success) {
    return { error: "Senha incorreta." };
  }
  redirect("/admin");
}
