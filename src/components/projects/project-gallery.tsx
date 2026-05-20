"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
}

interface ProjectGalleryProps {
  images: GalleryImage[];
  projectTitle: string;
}

export function ProjectGallery({ images, projectTitle }: ProjectGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const hasMultiple = images.length > 1;

  const showPrev = useCallback(() => {
    setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const showNext = useCallback(() => {
    setIndex((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (!open || !hasMultiple) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasMultiple, showPrev, showNext]);

  const current = index !== null ? images[index] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <figure
            key={img.id}
            className="overflow-hidden rounded-2xl border border-white/[0.07]"
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ampliar imagem${img.caption ? `: ${img.caption}` : ` ${i + 1}`}`}
              className="group relative block aspect-video w-full cursor-zoom-in"
            >
              <Image
                src={img.url}
                alt={img.caption || projectTitle}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                loading="lazy"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
            {img.caption && (
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <Dialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-8">
            {current && (
              <>
                <Dialog.Title className="sr-only">
                  {current.caption || projectTitle}
                </Dialog.Title>

                {/* Close */}
                <Dialog.Close
                  aria-label="Fechar"
                  className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:top-5 sm:right-5"
                >
                  <X className="h-5 w-5" />
                </Dialog.Close>

                {/* Prev / Next */}
                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      aria-label="Imagem anterior"
                      className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:left-5"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Próxima imagem"
                      className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white sm:right-5"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image */}
                <div className="relative flex max-h-[85vh] w-full max-w-5xl flex-1 items-center justify-center">
                  <Image
                    key={current.id}
                    src={current.url}
                    alt={current.caption || projectTitle}
                    width={1600}
                    height={900}
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    className="max-h-[85vh] w-auto rounded-lg object-contain"
                  />
                </div>

                {/* Caption + counter */}
                <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
                  {current.caption && <span>{current.caption}</span>}
                  {hasMultiple && (
                    <span className={cn("text-xs text-white/40", current.caption && "border-l border-white/20 pl-3")}>
                      {index! + 1} / {images.length}
                    </span>
                  )}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
