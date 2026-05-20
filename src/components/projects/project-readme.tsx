import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidBlock } from "@/components/blog/mermaid-block";

interface ProjectReadmeProps {
  markdown: string;
}

/**
 * Renders the project README field as styled markdown with Mermaid support.
 * Visual styling mirrors the build-notes post body. ```mermaid fenced blocks
 * are intercepted and routed to the MermaidBlock client component.
 */
export function ProjectReadme({ markdown }: ProjectReadmeProps) {
  return (
    <div className="prose-post">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="mb-4 mt-10 text-xl font-bold leading-snug text-foreground first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-4 mt-10 text-lg font-bold leading-snug text-foreground">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-3 mt-8 text-base font-semibold text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-5 text-[15px] leading-[1.8] text-muted-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 space-y-2 pl-4 text-muted-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 space-y-2 pl-4 list-decimal text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] leading-relaxed before:mr-2 before:text-primary before:content-['→']">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-primary/50 pl-4 italic text-muted-foreground/80">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const lang = /language-(\w+)/.exec(className ?? "")?.[1];
            if (lang === "mermaid") {
              const code = Array.isArray(children)
                ? children.join("")
                : String(children ?? "");
              return <MermaidBlock code={code} />;
            }
            const isBlock = !!lang;
            if (isBlock) {
              return (
                <code className="block w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-[13px] leading-relaxed text-foreground/80">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[13px] text-accent">
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            // When a <pre> wraps a single Mermaid block the inner `code`
            // component already returns a MermaidBlock (not inline code), so
            // wrapping it in <pre> would double the chrome. Detect that case
            // by inspecting the child's className and unwrap.
            type ChildProps = { className?: string };
            const child = children as React.ReactElement<ChildProps> | undefined;
            const lang = /language-(\w+)/.exec(child?.props?.className ?? "")?.[1];
            if (lang === "mermaid") return <>{children}</>;
            return (
              <pre className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d14]">
                {children}
              </pre>
            );
          },
          hr: () => <hr className="my-10 border-white/[0.07]" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary underline underline-offset-2 transition-colors hover:text-primary/80"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/[0.08] px-3 py-2 text-left font-semibold text-foreground/90">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/[0.04] px-3 py-2 text-muted-foreground">
              {children}
            </td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
