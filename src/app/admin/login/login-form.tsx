"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  password: z.string().min(1, "Senha obrigatória"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(values.password);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm text-white/70">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          placeholder="••••••••••••"
          className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus-visible:ring-violet-500/50"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2">
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
