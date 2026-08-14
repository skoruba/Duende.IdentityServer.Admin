import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  SnippetLanguage,
  TOKEN_CLASS_NAMES,
  tokenizeCode,
} from "@/lib/highlight/highlightCode";
import { cn, downloadTextFile } from "@/lib/utils";
import { ClipboardCopy, Download } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGE_LABELS: Record<SnippetLanguage, string> = {
  csharp: "C#",
  bash: "Shell",
  json: "JSON",
};

type CodeBlockProps = {
  code: string;
  language: SnippetLanguage;
  /** Shown in the block header - typically a file name or a step title. */
  title?: string;
  /** When set, a download button saves the snippet under this name. */
  downloadFileName?: string;
  className?: string;
};

/**
 * A read-only, syntax highlighted code snippet with copy and download actions.
 * Rendered inside the client form, so every button is explicitly type="button".
 */
export const CodeBlock = ({
  code,
  language,
  title,
  downloadFileName,
  className,
}: CodeBlockProps) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  const tokens = useMemo(() => tokenizeCode(code, language), [code, language]);

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="flex items-center gap-2 border-b bg-muted/60 px-3 py-1.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>

        {title && (
          <span className="ms-2 truncate font-mono text-xs text-muted-foreground">
            {title}
          </span>
        )}

        <span className="ms-auto rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {LANGUAGE_LABELS[language]}
        </span>

        {downloadFileName && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => downloadTextFile(code, downloadFileName)}
            title={t("Components.CodeBlock.Download")}
            aria-label={t("Components.CodeBlock.Download")}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => copyToClipboard(code)}
          title={t("Components.CodeBlock.Copy")}
          aria-label={t("Components.CodeBlock.Copy")}
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
        </Button>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>
          {tokens.map((token, index) => (
            <span key={index} className={TOKEN_CLASS_NAMES[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

type CodeBlockStepProps = {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** A numbered step wrapping one or more code blocks. */
export const CodeBlockStep = ({
  step,
  title,
  description,
  children,
}: CodeBlockStepProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {step}
      </span>
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    {description && (
      <p className="ps-8 text-sm text-muted-foreground">{description}</p>
    )}
    <div className="space-y-2 ps-8">{children}</div>
  </div>
);
