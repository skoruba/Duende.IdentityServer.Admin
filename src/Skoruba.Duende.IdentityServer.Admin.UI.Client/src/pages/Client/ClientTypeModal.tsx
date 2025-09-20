import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { ClientType } from "@/models/Clients/ClientModels";
import { Laptop, Server, Shield, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

type ClientTypeItemProps = {
  icon: JSX.Element;
  title: string;
  description: string;
  clientType: ClientType;
  onClientTypeSelected: (clientType: ClientType) => void;
};

export const ClientTypeItem = ({
  clientType,
  icon,
  description,
  title,
  onClientTypeSelected,
}: ClientTypeItemProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-lg border bg-background p-2">
      <div className="flex h-[230px] flex-col justify-between rounded-md p-6">
        {icon}
        <div className="space-y-2 mt-2">
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p>
            <Button
              size={"sm"}
              onClick={() => onClientTypeSelected(clientType)}
            >
              {t("Actions.Create")}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export type ClientTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onClientTypeSelected: (clientType: ClientType) => void;
};

const ClientTypeModal = ({
  isOpen,
  onClose,
  onClientTypeSelected,
}: ClientTypeModalProps) => {
  const { toggleModal } = useClientWizard();
  const { t } = useTranslation();

  const handleClientTypeSelected = (clientType: ClientType) => {
    onClientTypeSelected(clientType);
    onClose();

    toggleModal(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[300px] max-h-[calc(100vh)] lg:max-w-[800px] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("Client.Wizard.NewClient")}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t("Client.Wizard.ChooseClientTypeDescription")}
        </DialogDescription>
        <div className="m-6">
          <div
            id="features-stats"
            className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-2"
          >
            <ClientTypeItem
              onClientTypeSelected={handleClientTypeSelected}
              clientType={ClientType.Confidential}
              title={t("Client.Wizard.ConfidentialClientType")}
              icon={<Laptop className="h-12 w-12" />}
              description={t("Client.Wizard.ConfidentialClientTypeDescription")}
            />
            <ClientTypeItem
              onClientTypeSelected={handleClientTypeSelected}
              clientType={ClientType.Public}
              title={t("Client.Wizard.PublicClientType")}
              icon={<Smartphone className="h-12 w-12" />}
              description={t("Client.Wizard.PublicClientTypeDescription")}
            />
            <ClientTypeItem
              onClientTypeSelected={handleClientTypeSelected}
              clientType={ClientType.Machine}
              title={t("Client.Wizard.MachineClientType")}
              icon={<Server className="h-12 w-12" />}
              description={t("Client.Wizard.MachineClientTypeDescription")}
            />
            <ClientTypeItem
              onClientTypeSelected={handleClientTypeSelected}
              clientType={ClientType.HighSecure}
              title={t("Client.Wizard.HighSecureClientType")}
              icon={<Shield className="h-12 w-12" />}
              description={t("Client.Wizard.HighSecureClientTypeDescription")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientTypeModal;
