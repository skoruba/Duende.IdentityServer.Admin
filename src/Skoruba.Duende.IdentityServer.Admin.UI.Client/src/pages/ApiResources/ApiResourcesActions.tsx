import { Button } from "@/components/ui/button";
import { ApiResourceData } from "@/models/ApiResources/ApiResourceModels";
import { ApiResourceEditUrl } from "@/routing/Urls";
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
import DeleteApiResourceDialog from "../ApiResource/Common/DeleteApiResourceDialog";

const ApiResourcesActions = ({ resource }: { resource: ApiResourceData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteModal = useModal();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("Common.OpenMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              navigate(
                ApiResourceEditUrl.replace(
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

      <DeleteApiResourceDialog
        apiResourceId={resource.id}
        apiResourceName={resource.apiResourceName}
        modal={deleteModal}
      />
    </>
  );
};

export default ApiResourcesActions;
