import { toast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const COPIED_FEEDBACK_MS = 1800;

/**
 * Copies a value to the clipboard and reports the outcome.
 *
 * A successful copy is confirmed where it was triggered: `copied` stays true for a
 * moment, so the control can show it. A toast for it interrupts more than it tells.
 *
 * A failure does get a toast, because it needs an explanation. The Clipboard API is
 * unavailable outside a secure context and the user may deny the permission - the
 * rejection has to be handled, otherwise it surfaces as an unhandled rejection and
 * the user gets no feedback at all.
 */
export const useCopyToClipboard = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);

        setCopied(true);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(
          () => setCopied(false),
          COPIED_FEEDBACK_MS,
        );
      } catch {
        toast({
          variant: "destructive",
          title: t("Components.FormRow.CopyToClipboardFailed"),
        });
      }
    },
    [t],
  );

  return { copy, copied };
};
