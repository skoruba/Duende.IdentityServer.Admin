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
import { RoleData } from "@/models/Roles/RoleModels";
import { RoleEditUrl, RolesUrl } from "@/routing/Urls";
import RoleDeleteDialog from "../Role/Common/RoleDeleteDialog";
import useModal from "@/hooks/modalHooks";

type Props = {
  role: RoleData;
};

const RolesActions: React.FC<Props> = ({ role }) => {
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
              navigate(RoleEditUrl.replace(":roleId", role.id.toString()))
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
      <RoleDeleteDialog
        roleId={role.id}
        roleName={role.name}
        isOpen={deleteModal.isOpen}
        setIsOpen={deleteModal.setValue}
        onSuccess={() => navigate(RolesUrl)}
      />
    </>
  );
};

export default RolesActions;
