import { toast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Copies a value to the clipboard and reports the outcome.
 *
 * The Clipboard API is unavailable outside a secure context and the user may
 * deny the permission - the rejection has to be handled, otherwise it surfaces
 * as an unhandled rejection and the user gets no feedback at all.
 */
export const useCopyToClipboard = () => {
  const { t } = useTranslation();

  return useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        toast({ title: t("Components.FormRow.CopiedToClipboard") });
      } catch {
        toast({
          variant: "destructive",
          title: t("Components.FormRow.CopyToClipboardFailed"),
        });
      }
    },
    [t],
  );
};
