import { Trans, useTranslation } from "react-i18next";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import { useMutation, useQueryClient } from "react-query";
import { deleteUser } from "@/services/UserServices";
import { queryKeys } from "@/services/QueryKeys";
import { toast } from "@/components/ui/use-toast";
import Hoorey from "@/components/Hoorey/Hoorey";

type UserDeleteDialogProps = {
  userId: string;
  userName: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  userId,
  userName,
  isOpen,
  setIsOpen,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation(() => deleteUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.users);
      toast({
        title: <Hoorey />,
        description: t("User.Actions.Deleted"),
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
      title={t("User.Actions.DeleteConfirmTitle")}
      message={
        <Trans
          i18nKey="User.Actions.DeleteConfirmDescription"
          values={{ userName }}
          components={{ strong: <strong className="text-destructive" /> }}
        />
      }
      handleDelete={handleDelete}
    />
  );
};

export default UserDeleteDialog;
