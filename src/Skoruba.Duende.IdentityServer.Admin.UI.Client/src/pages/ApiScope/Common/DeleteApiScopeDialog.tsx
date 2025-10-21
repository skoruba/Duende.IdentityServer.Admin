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
import { useMutation, useQueryClient } from "react-query";
import { deleteApiScope } from "@/services/ApiScopeServices";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";

type Props = {
  apiScopeId: number;
  apiScopeName: string;
  modal: { isOpen: boolean; closeModal: () => void };
  onApiScopeDeleted?: () => void;
};

const DeleteApiScopeDialog = ({
  apiScopeId,
  apiScopeName,
  modal,
  onApiScopeDeleted,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation(() => deleteApiScope(apiScopeId), {
    onSuccess: () => {
      toast({
        title: <Hoorey />,
        description: t("ApiScope.Actions.Deleted"),
      });
      queryClient.invalidateQueries(queryKeys.apiScopes);
      modal.closeModal();
      onApiScopeDeleted?.();
    },
  });

  return (
    <AlertDialog open={modal.isOpen} onOpenChange={modal.closeModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Actions.ConfirmDeletion")}</AlertDialogTitle>
          <AlertDialogDescription>
            <Trans
              i18nKey="ApiScope.Actions.DeleteApiScopeConfirm"
              values={{ apiScopeName: apiScopeName }}
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

export default DeleteApiScopeDialog;
