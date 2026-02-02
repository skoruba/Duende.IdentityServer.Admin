import { useMutation, useQueryClient } from "react-query";
import DeleteDialog from "../../../components/DeleteDialog/DeleteDialog";
import { deleteClient } from "@/services/ClientServices";
import { Trans, useTranslation } from "react-i18next";
import { UseModalReturn } from "@/hooks/modalHooks";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import { queryKeys } from "@/services/QueryKeys";

type DeleteClientDialogProps = {
  clientName: string;
  clientId: string;
  modal: UseModalReturn;
  onClientDeleted?: () => void;
};

const DeleteClientDialog = ({
  clientName,
  clientId,
  modal,
  onClientDeleted,
}: DeleteClientDialogProps) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const removeClient = useMutation(() => deleteClient(Number(clientId)), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.clients);
      queryClient.invalidateQueries(queryKeys.configurationIssues);
      queryClient.invalidateQueries(queryKeys.configurationIssuesSummary);
    },
  });

  const handleDelete = () => {
    removeClient.mutate();
    modal.closeModal();

    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>{t("Actions.Hooray")}</span>
        </div>
      ),
      description: t("Client.Actions.Deleted"),
    });

    onClientDeleted?.();
  };

  return (
    <DeleteDialog
      title={t("Actions.ConfirmDeletion")}
      isAlertOpen={modal.isOpen}
      setIsAlertOpen={modal.toggleModal}
      message={
        <Trans
          i18nKey="Client.Actions.DeleteClientConfirm"
          values={{ clientName: clientName }}
          components={{ strong: <strong className="text-destructive" /> }}
        />
      }
      handleDelete={handleDelete}
    />
  );
};

export default DeleteClientDialog;
