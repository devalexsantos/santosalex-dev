import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function AdminLoginPage() {
  return (
    // fixed inset-0 covers the sidebar — login has no chrome
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10">
            <span className="text-sm font-bold text-violet-400">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Admin</h1>
          <p className="mt-1 text-sm text-white/40">Acesso restrito</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <LoginForm />
        </div>

        {/* Hint */}
        <p className="mt-4 text-center text-[11px] text-white/25">
          Esqueceu a senha? Verifique{" "}
          <code className="font-mono text-white/35">ADMIN_PASSWORD</code> no .env
        </p>
      </div>
    </div>
  );
}
