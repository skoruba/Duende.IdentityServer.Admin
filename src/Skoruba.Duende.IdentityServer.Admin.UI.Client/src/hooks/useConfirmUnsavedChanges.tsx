import { useState, useCallback, useRef, useEffect } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    resolver.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolver.current?.(false);
  };

  useEffect(() => {
    if (blocker.state === "blocked") {
      confirm().then((confirmed) => {
        if (confirmed) blocker.proceed();
        else blocker.reset();
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("Actions.UnsavedChangesTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("Actions.UnsavedChangesConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("Actions.Cancel")}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild variant="destructive">
            <Button type="button" onClick={handleConfirm}>
              {t("Actions.Leave")}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, DialogCmp };
}
