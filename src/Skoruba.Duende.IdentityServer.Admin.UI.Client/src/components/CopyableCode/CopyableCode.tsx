import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { ClipboardCopy } from "lucide-react";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface CopyableCodeProps {
  children?: ReactNode;
}

/**
 * Renders a code snippet followed by a button that copies it to the clipboard.
 * Meant for short, literal values such as example URLs.
 */
export const CopyableCode = ({ children }: CopyableCodeProps) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  // Trans passes the tag content either as a string or as an array of strings.
  const value = Array.isArray(children)
    ? children.join("")
    : String(children ?? "");

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <code>{value}</code>
      <button
        type="button"
        onClick={() => copyToClipboard(value)}
        title={t("Components.CopyableCode.ClickToCopy")}
        aria-label={t("Components.CopyableCode.ClickToCopy")}
        className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ClipboardCopy className="h-3.5 w-3.5" />
      </button>
    </span>
  );
};
