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
import { Trans, useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { deleteIdentityResource } from "@/services/IdentityResourceServices";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import { configurationChangeMeta } from "@/services/mutationMeta";

type DeleteIdentityResourceDialogProps = {
  identityResourceId: number;
  identityResourceName: string;
  modal: { isOpen: boolean; closeModal: () => void };
  onIdentityResourceDeleted?: () => void;
};

const DeleteIdentityResourceDialog = ({
  identityResourceId,
  identityResourceName,
  modal,
  onIdentityResourceDeleted,
}: DeleteIdentityResourceDialogProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    meta: configurationChangeMeta,
    mutationFn: () => deleteIdentityResource(identityResourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.identityResources],
      });
      // Invalidate configuration issues cache when identity resource is deleted
      queryClient.invalidateQueries({
        queryKey: [queryKeys.configurationIssues],
      });
      toast({
        title: <Hoorey />,
        description: t("IdentityResource.Actions.Deleted"),
      });
      modal.closeModal();
      onIdentityResourceDeleted?.();
    },
  });

  return (
    <AlertDialog open={modal.isOpen} onOpenChange={modal.closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Actions.ConfirmDeletion")}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="IdentityResource.Actions.DeleteIdentityResourceConfirm"
              values={{ identityResourceName: identityResourceName }}
              components={{ strong: <strong className="text-destructive" /> }}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={modal.closeModal}>
            {t("Actions.Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => mutation.mutate()}
          >
            {t("Actions.Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteIdentityResourceDialog;
