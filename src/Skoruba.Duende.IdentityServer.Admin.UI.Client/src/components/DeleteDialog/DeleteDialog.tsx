import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

type DeleteDialogProps = {
  isAlertOpen: boolean;
  setIsAlertOpen: (value: boolean) => void;
  title: string;
  message: React.ReactNode;
  handleDelete: () => void;
};

const DeleteDialog = ({
  isAlertOpen,
  setIsAlertOpen,
  title,
  handleDelete,
  message,
}: DeleteDialogProps) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription className="flex items-center space-x-3">
          <Trash className="text-destructive w-6 h-6" />
          <span>{message}</span>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Actions.Cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>
            {t("Actions.Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
