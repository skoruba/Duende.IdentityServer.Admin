import { useState, useCallback, useRef, useEffect } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useDirtyGuard } from "@/contexts/DirtyGuardContext";

export function useNavigateWithBlocker<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const navigate = useNavigate();
  return useCallback(
    (url: string) => {
      form.reset(form.getValues());
      setTimeout(() => {
        navigate(url);
      }, 0);
    },
    [form, navigate]
  );
}

export function useNavigateWithBlockerInWizard() {
  const navigate = useNavigate();
  const { reset } = useDirtyGuard();

  return useCallback(
    (url: string) => {
      reset();
      setTimeout(() => {
        navigate(url);
      }, 0);
    },
    [navigate]
  );
}

export function useConfirmUnsavedChanges(isDirty: boolean) {
  const [open, setOpen] = useState(false);
  const resolver = useRef<(confirmed: boolean) => void>();
  const { t } = useTranslation();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  const confirm = useCallback(() => {
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    blocker.reset?.();
    resolver.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    blocker.reset?.();
    resolver.current?.(false);
  };

  useEffect(() => {
    if (blocker.state === "blocked") {
      confirm().then((confirmed) => {
        if (confirmed) {
          blocker.proceed();
        }
        blocker.reset();
      });
    }
  }, [blocker, confirm]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const DialogCmp = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onInteractOutside={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("Actions.UnsavedChangesTitle")}</DialogTitle>
          <DialogDescription>
            {t("Actions.UnsavedChangesConfirm")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t("Actions.Cancel")}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {t("Actions.Leave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, DialogCmp };
}
