import { Button } from "@/components/ui/button";
import { ClientData } from "@/models/Clients/ClientModels";
import { ClientEditUrl } from "@/routing/Urls";
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
import DeleteClientDialog from "../Client/Common/DeleteClientDialog";

const ClientActions = ({ client }: { client: ClientData }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const deleteClientModal = useModal();

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
              navigate(ClientEditUrl.replace(":clientId", client.id.toString()))
            }
          >
            {t("Actions.Edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteClientModal.openModal()}
          >
            {t("Actions.Delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteClientDialog
        clientId={client.id.toString()}
        clientName={client.clientName}
        modal={deleteClientModal}
      />
    </>
  );
};

export default ClientActions;
