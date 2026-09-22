import {
  ALL_CAPABILITIES,
  ClientCapabilities,
  getClientCapabilities,
  hasHiddenCapabilities,
} from "@/lib/clients/clientCapabilities";
import { ClientEditFormData } from "@/pages/Client/ClientSchema";
import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

type ClientCapabilitiesContextValue = {
  /** Already resolved against the override - consumers just read the flags. */
  capabilities: ClientCapabilities;
  /** True when the grant types would hide something, regardless of the override. */
  hasHiddenSettings: boolean;
  isShowingAllSettings: boolean;
  setShowAllSettings: (value: boolean) => void;
};

const ClientCapabilitiesContext =
  createContext<ClientCapabilitiesContextValue | null>(null);

/**
 * Derives the capabilities from the grant types currently in the form, so the
 * tabs follow unsaved changes, and carries the "show everything" override.
 */
export const ClientCapabilitiesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { control } = useFormContext<ClientEditFormData>();
  const allowedGrantTypes = useWatch({ control, name: "allowedGrantTypes" });

  const [isShowingAllSettings, setShowAllSettings] = useState(false);

  const value = useMemo(() => {
    const derived = getClientCapabilities(
      (allowedGrantTypes ?? []).map((grantType) => grantType.id),
    );

    return {
      capabilities: isShowingAllSettings ? ALL_CAPABILITIES : derived,
      hasHiddenSettings: hasHiddenCapabilities(derived),
      isShowingAllSettings,
      setShowAllSettings,
    };
  }, [allowedGrantTypes, isShowingAllSettings]);

  return (
    <ClientCapabilitiesContext.Provider value={value}>
      {children}
    </ClientCapabilitiesContext.Provider>
  );
};

/**
 * Outside the provider every capability is granted, so a tab rendered on its
 * own - in the wizard or a test - keeps showing everything.
 */
export const useClientCapabilities = (): ClientCapabilities =>
  useContext(ClientCapabilitiesContext)?.capabilities ?? ALL_CAPABILITIES;

export const useClientCapabilitiesOverride = () => {
  const context = useContext(ClientCapabilitiesContext);

  return {
    hasHiddenSettings: context?.hasHiddenSettings ?? false,
    isShowingAllSettings: context?.isShowingAllSettings ?? false,
    setShowAllSettings: context?.setShowAllSettings ?? (() => {}),
  };
};
