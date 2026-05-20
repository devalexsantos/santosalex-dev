"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidBlockProps {
  code: string;
}

/**
 * Renders a Mermaid diagram on the client. The `mermaid` library is loaded
 * lazily via dynamic import so pages without diagrams don't pay the bundle
 * cost. On parse error we fall back to the raw code so the page never breaks.
 */
export function MermaidBlock({ code }: MermaidBlockProps) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("mermaid");
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          themeVariables: {
            background: "transparent",
            primaryColor: "#1f1f2e",
            primaryTextColor: "#e5e5ee",
            primaryBorderColor: "#3a3a4e",
            lineColor: "#6366f1",
            secondaryColor: "#27273a",
            tertiaryColor: "#1a1a26",
          },
        });
        const result = await mermaid.render(`mermaid-${id}`, code.trim());
        if (!cancelled) setSvg(result.svg);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Mermaid render failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return (
      <pre className="my-6 overflow-x-auto rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-[12px] font-mono text-amber-200/80">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 [&_svg]:mx-auto [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    >
      {svg ? null : (
        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/50">
          Renderizando diagrama…
        </div>
      )}
    </div>
  );
}
