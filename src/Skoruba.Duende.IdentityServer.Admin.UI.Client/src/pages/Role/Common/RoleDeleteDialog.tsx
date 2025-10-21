import { Trans, useTranslation } from "react-i18next";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import { useMutation, useQueryClient } from "react-query";
import { deleteRole } from "@/services/RoleService";
import { queryKeys } from "@/services/QueryKeys";
import { toast } from "@/components/ui/use-toast";
import Hoorey from "@/components/Hoorey/Hoorey";

type RoleDeleteDialogProps = {
  roleId: string;
  roleName: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const RoleDeleteDialog: React.FC<RoleDeleteDialogProps> = ({
  roleId,
  roleName,
  isOpen,
  setIsOpen,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation(() => deleteRole(roleId), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.roles);
      toast({
        title: <Hoorey />,
        description: t("Role.Actions.Deleted"),
      });
      setIsOpen(false);
      onSuccess?.();
    },
    onError: () => {
      setIsOpen(false);
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <DeleteDialog
      isAlertOpen={isOpen}
      setIsAlertOpen={setIsOpen}
      title={t("Role.Actions.DeleteConfirmTitle")}
      message={
        <Trans
          i18nKey="Role.Actions.DeleteConfirmDescription"
          values={{ roleName }}
          components={{ strong: <strong className="text-destructive" /> }}
        />
      }
      handleDelete={handleDelete}
    />
  );
};

export default RoleDeleteDialog;
