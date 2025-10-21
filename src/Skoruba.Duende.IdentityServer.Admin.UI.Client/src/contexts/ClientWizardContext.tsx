import useModal from "@/hooks/modalHooks";
import {
  ClientType,
  ClientWizardAdditionData,
  ClientWizardExcludeOptions,
} from "@/models/Clients/ClientModels";
import React, { createContext, useContext, useState, useCallback } from "react";

type ClientWizardContextType = {
  stepErrors: boolean;
  setStepErrors: (errors: boolean) => void;
  onValidation: (hasError: boolean) => void;
  clientType: ClientType | undefined;
  excludeOptions: ClientWizardExcludeOptions | undefined;
  additionData: ClientWizardAdditionData | undefined;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: (isOpen: boolean) => void;
};

const ClientWizardContext = createContext<ClientWizardContextType | null>(null);

type ClientWizardProviderProps = {
  clientType: ClientType | undefined;
  excludeOptions: ClientWizardExcludeOptions | undefined;
  additionData: ClientWizardAdditionData | undefined;
};

export const ClientWizardProvider: React.FC<
  React.PropsWithChildren<ClientWizardProviderProps>
> = ({ children, clientType, excludeOptions, additionData }) => {
  const [stepErrors, setStepErrors] = useState(false);

  const { closeModal, isOpen, openModal, toggleModal } = useModal();

  const onValidation = useCallback((hasError: boolean) => {
    setStepErrors(hasError);
  }, []);

  return (
    <ClientWizardContext.Provider
      value={{
        stepErrors,
        setStepErrors,
        onValidation,
        clientType,
        excludeOptions,
        additionData,
        isOpen,
        openModal,
        closeModal,
        toggleModal,
      }}
    >
      {children}
    </ClientWizardContext.Provider>
  );
};

export const useClientWizard = (): ClientWizardContextType => {
  const context = useContext(ClientWizardContext);
  if (!context) {
    throw new Error(
      "useClientWizard must be used within a ClientWizardProvider"
    );
  }
  return context;
};
