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
import DeleteIdentityResourceDialog from "../IdentityResource/Common/DeleteIdentityResourceDialog";
import { IdentityResourceData } from "@/models/IdentityResources/IdentityResourceModels";
import { IdentityResourceEditUrl } from "@/routing/Urls";

const IdentityResourcesActions = ({
  resource,
}: {
  resource: IdentityResourceData;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteModal = useModal();

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
                IdentityResourceEditUrl.replace(
                  ":resourceId",
                  resource.id.toString()
                )
              )
            }
          >
            {t("Actions.Edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteModal.openModal()}
          >
            {t("Actions.Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteIdentityResourceDialog
        identityResourceId={resource.id}
        identityResourceName={resource.name}
        modal={deleteModal}
      />
    </>
  );
};

export default IdentityResourcesActions;
