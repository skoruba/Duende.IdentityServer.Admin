import { Button, type ButtonProps } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { Check, ClipboardCopy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CopyStatusIconProps {
  copied: boolean;
  className?: string;
}

/**
 * The copy icon, which turns into a check mark while a copy is being confirmed.
 */
export const CopyStatusIcon = ({ copied, className }: CopyStatusIconProps) => {
  const { t } = useTranslation();

  return (
    <>
      {copied ? (
        <Check
          aria-hidden="true"
          className={cn(
            "text-primary animate-in fade-in-0 zoom-in-50 duration-200",
            className,
          )}
        />
      ) : (
        <ClipboardCopy aria-hidden="true" className={className} />
      )}
      {/* Always rendered: a live region added together with its text is not announced reliably. */}
      <span role="status" className="sr-only">
        {copied ? t("Components.FormRow.CopiedToClipboard") : ""}
      </span>
    </>
  );
};

interface CopyButtonProps
  extends Omit<ButtonProps, "onClick" | "type" | "value"> {
  /** What is copied. A function puts off building an expensive value until the click. */
  value: string | (() => string);
  iconClassName?: string;
}

/**
 * A button that copies a value and confirms it on itself. Every button keeps its own
 * state, so two of them side by side do not light up together.
 */
export const CopyButton = ({
  value,
  iconClassName,
  children,
  ...buttonProps
}: CopyButtonProps) => {
  const { copy, copied } = useCopyToClipboard();

  return (
    <Button
      type="button"
      onClick={() => copy(typeof value === "function" ? value() : value)}
      {...buttonProps}
    >
      <CopyStatusIcon copied={copied} className={iconClassName} />
      {children}
    </Button>
  );
};
