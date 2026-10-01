import "./i18n/config";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useUiConfiguration } from "./contexts/UiConfigurationContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing/Router";
import StartupScreen from "./components/StartupScreen/StartupScreen";
import { DirtyGuardProvider } from "./contexts/DirtyGuardContext";
import { useTranslation } from "react-i18next";

const App = () => {
  const { isLoading, isAuthenticated, login } = useAuth();
  const { isLoading: isConfigurationLoading } = useUiConfiguration();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  if (isLoading || !isAuthenticated || isConfigurationLoading) {
    return <StartupScreen message={t("Components.Loading.CheckingSession")} />;
  }

  return (
    <DirtyGuardProvider>
      <RouterProvider router={router} />
    </DirtyGuardProvider>
  );
};

export default App;
