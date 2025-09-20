import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu/DropdownMenu";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/modalHooks";
import { IdentityProviderModel } from "@/models/IdentityProviders/IdentityProviderModel";
import { IdentityProviderEditUrl } from "@/routing/Urls";
import IdentityProviderDeleteDialog from "../IdentityProvider/Common/IdentityProviderDeleteDialog";

type Props = {
  provider: IdentityProviderModel;
};

const IdentityProvidersActions: React.FC<Props> = ({ provider }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const modal = useModal();

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
            onClick={() =>
              navigate(
                IdentityProviderEditUrl.replace(
                  ":providerId",
                  provider.id.toString()
                )
              )
            }
          >
            {t("Actions.Edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => modal.openModal()}
          >
            {t("Actions.Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IdentityProviderDeleteDialog
        providerId={provider.id.toString()}
        identityProviderName={provider.scheme}
        isOpen={modal.isOpen}
        setIsOpen={modal.setValue}
        onSuccess={() => {
          modal.closeModal();
        }}
      />
    </>
  );
};

export default IdentityProvidersActions;
