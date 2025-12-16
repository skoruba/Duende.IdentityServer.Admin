import { useMutation, useQueryClient } from "react-query";
import DeleteDialog from "../../../components/DeleteDialog/DeleteDialog";
import { Trans, useTranslation } from "react-i18next";
import { UseModalReturn } from "@/hooks/modalHooks";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import { deleteApiResource } from "@/services/ApiResourceServices";
import { queryKeys } from "@/services/QueryKeys";

type DeleteApiResourceDialogProps = {
  apiResourceName: string;
  apiResourceId: number;
  modal: UseModalReturn;
  onApiResourceDeleted?: () => void;
};

const DeleteApiResourceDialog = ({
  apiResourceName,
  apiResourceId,
  modal,
  onApiResourceDeleted,
}: DeleteApiResourceDialogProps) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const removeApiResource = useMutation(
    () => deleteApiResource(Number(apiResourceId)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.apiResources);
        // Invalidate configuration issues cache when API resource is deleted
        queryClient.invalidateQueries(queryKeys.configurationIssues);
        queryClient.invalidateQueries(queryKeys.configurationIssuesSummary);
      },
    }
  );

  const handleDelete = () => {
    removeApiResource.mutate();
    modal.closeModal();

    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>{t("Actions.Hooray")}</span>
        </div>
      ),
      description: t("ApiResource.Actions.Deleted"),
    });

    onApiResourceDeleted?.();
  };

  return (
    <DeleteDialog
      title={t("Actions.ConfirmDeletion")}
      isAlertOpen={modal.isOpen}
      setIsAlertOpen={modal.toggleModal}
      message={
        <Trans
          i18nKey="ApiResource.Actions.DeleteApiResourceConfirm"
          values={{ apiResourceName: apiResourceName }}
          components={{ strong: <strong className="text-destructive" /> }}
        />
      }
      handleDelete={handleDelete}
    />
  );
};

export default DeleteApiResourceDialog;
