import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/modalHooks";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import { useDeleteKey } from "@/services/KeyServices";

const KeysActions = ({ keyId }: { keyId: string }) => {
  const { t } = useTranslation();
  const deleteModal = useModal();
  const deleteKeyMutation = useDeleteKey();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={deleteModal.openModal}
          >
            {t("Actions.Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        isAlertOpen={deleteModal.isOpen}
        setIsAlertOpen={deleteModal.setValue}
        title={t("Keys.DeleteTitle")}
        message={t("Keys.DeleteDescription")}
        handleDelete={() => deleteKeyMutation.mutate(keyId)}
      />
    </>
  );
};

export default KeysActions;
