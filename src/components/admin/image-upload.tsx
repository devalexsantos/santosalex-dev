"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Tailwind aspect/height utility for the preview area. */
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Falha ao enviar a imagem.");
        return;
      }
      onChange(data.url);
    } catch {
      toast.error("Falha ao enviar a imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Pré-visualização" className="h-40 w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Trocar"
              )}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={isUploading}
              className="rounded-lg border border-red-400/30 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/30 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] text-white/40 transition-colors hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Enviando...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs">Enviar imagem</span>
              <span className="text-[10px] text-white/25">JPG, PNG, WebP, AVIF ou GIF — até 5 MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
