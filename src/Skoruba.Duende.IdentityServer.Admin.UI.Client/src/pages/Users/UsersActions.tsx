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
import { UserData } from "@/models/Users/UserModels";
import { UserEditUrl, UsersUrl } from "@/routing/Urls";
import useModal from "@/hooks/modalHooks";
import UserDeleteDialog from "../User/Common/UserDeleteDialog";

type Props = {
  user: UserData;
};

const UsersActions: React.FC<Props> = ({ user }) => {
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
              navigate(UserEditUrl.replace(":userId", user.id.toString()))
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

      <UserDeleteDialog
        userId={user.id}
        userName={user.userName}
        isOpen={deleteModal.isOpen}
        setIsOpen={deleteModal.setValue}
        onSuccess={() => navigate(UsersUrl)}
      />
    </>
  );
};

export default UsersActions;
