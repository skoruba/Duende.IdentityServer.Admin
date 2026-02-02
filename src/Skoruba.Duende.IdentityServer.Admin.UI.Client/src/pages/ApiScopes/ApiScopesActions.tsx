import { Button } from "@/components/ui/button";
import { ApiScopeData } from "@/models/ApiScopes/ApiScopeModels";
import { ApiScopeEditUrl } from "@/routing/Urls";
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
import DeleteApiScopeDialog from "../ApiScope/Common/DeleteApiScopeDialog";

const ApiScopesActions = ({ scope }: { scope: ApiScopeData }) => {
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
              navigate(ApiScopeEditUrl.replace(":scopeId", scope.id.toString()))
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

      <DeleteApiScopeDialog
        apiScopeId={scope.id}
        apiScopeName={scope.name}
        modal={deleteModal}
      />
    </>
  );
};

export default ApiScopesActions;
