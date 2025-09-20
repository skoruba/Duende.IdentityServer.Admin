import { Trans, useTranslation } from "react-i18next";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import { useDeleteIdentityProvider } from "@/services/IdentityProviderService";
import Hoorey from "@/components/Hoorey/Hoorey";
import { toast } from "@/components/ui/use-toast";

type IdentityProviderDeleteDialogProps = {
  providerId: string;
  identityProviderName: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const IdentityProviderDeleteDialog: React.FC<
  IdentityProviderDeleteDialogProps
> = ({ providerId, identityProviderName, isOpen, setIsOpen, onSuccess }) => {
  const { t } = useTranslation();
  const deleteMutation = useDeleteIdentityProvider();

  const handleDelete = () => {
    deleteMutation.mutate(Number(providerId), {
      onSuccess: () => {
        toast({
          title: <Hoorey />,
          description: t("IdentityProvider.Actions.Deleted"),
        });
        setIsOpen(false);
        onSuccess?.();
      },
    });
  };

  return (
    <DeleteDialog
      isAlertOpen={isOpen}
      setIsAlertOpen={setIsOpen}
      title={t("IdentityProvider.DeleteConfirmTitle")}
      message={
        <Trans
          i18nKey="IdentityProvider.DeleteConfirmDescription"
          values={{ identityProviderName }}
          components={{ strong: <strong className="text-destructive" /> }}
        />
      }
      handleDelete={handleDelete}
    />
  );
};

export default IdentityProviderDeleteDialog;
