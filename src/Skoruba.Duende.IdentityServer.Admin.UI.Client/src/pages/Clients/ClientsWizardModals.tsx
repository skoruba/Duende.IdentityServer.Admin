import { ClientType } from "@/models/Clients/ClientModels";
import { FormProvider } from "@/contexts/FormContext";
import { useState } from "react";
import ClientTypeModal from "../Client/ClientTypeModal";
import { ClientWizardProvider } from "@/contexts/ClientWizardContext";
import {
  CLIENT_WIZARD_CONFIG,
  getStepsForClientType,
} from "@/config/ClientWizardConfig";
import ClientWizardModal from "../Client/Wizard/Common/ClientWizardModal";

export type ClientsWizardModalsProps = {
  closeModalClientType: () => void;
  isOpenModalClientType: boolean;
};

const ClientsWizardModals = ({
  closeModalClientType,
  isOpenModalClientType,
}: ClientsWizardModalsProps) => {
  const [clientType, setClientType] = useState<ClientType>();

  const steps = clientType ? getStepsForClientType(clientType) : [];

  return (
    <ClientWizardProvider
      clientType={clientType}
      excludeOptions={
        clientType ? CLIENT_WIZARD_CONFIG[clientType].excludeOptions : undefined
      }
      additionData={
        clientType ? CLIENT_WIZARD_CONFIG[clientType].additionalData : undefined
      }
    >
      <FormProvider steps={steps} initialFormData={undefined}>
        <ClientTypeModal
          isOpen={isOpenModalClientType}
          onClose={closeModalClientType}
          onClientTypeSelected={setClientType}
        />
        {clientType && <ClientWizardModal />}
      </FormProvider>
    </ClientWizardProvider>
  );
};

export default ClientsWizardModals;
