import React, { useContext, useEffect, useState } from "react";
import { getBaseHref } from "@/lib/utils";
import {
  DEFAULT_UI_CONFIGURATION,
  parseUiConfiguration,
  type UiConfiguration,
} from "@/lib/uiConfiguration/parseUiConfiguration";

interface IUiConfigurationProvider {
  children: React.ReactNode;
}

interface IUiConfigurationContext extends UiConfiguration {
  isLoading: boolean;
}

const defaultContext: IUiConfigurationContext = {
  ...DEFAULT_UI_CONFIGURATION,
  isLoading: true,
};

export const UiConfigurationContext =
  React.createContext<IUiConfigurationContext>(defaultContext);
export const useUiConfiguration = () => useContext(UiConfigurationContext);

// Loaded once at startup, next to the session (AuthContext). The router, the
// navigation, the dashboard and the command palette decide from it which
// features exist at all, so the app waits for it before the first page renders.
export const UiConfigurationProvider = ({
  children,
}: IUiConfigurationProvider) => {
  const [configuration, setConfiguration] = useState<UiConfiguration>(
    DEFAULT_UI_CONFIGURATION,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getConfiguration = async () => {
      try {
        const response = await fetch(`${getBaseHref()}configuration`, {
          headers: {
            "X-ANTI-CSRF": "1",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setConfiguration(parseUiConfiguration(await response.json()));
      } catch (error) {
        // Without an answer the full UI stays, as before the flag existed;
        // every endpoint is still guarded by the backend.
        console.error("Failed to get UI configuration:", error);
        setConfiguration(DEFAULT_UI_CONFIGURATION);
      } finally {
        setIsLoading(false);
      }
    };

    getConfiguration();
  }, []);

  return (
    <UiConfigurationContext.Provider value={{ ...configuration, isLoading }}>
      {children}
    </UiConfigurationContext.Provider>
  );
};
