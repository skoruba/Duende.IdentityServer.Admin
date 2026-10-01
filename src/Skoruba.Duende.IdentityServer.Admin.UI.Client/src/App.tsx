import "./i18n/config";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useUiConfiguration } from "./contexts/UiConfigurationContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing/Router";
import Loading from "./components/Loading/Loading";
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

  if (isLoading) return <Loading fullscreen />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loading size="sm" />
          <span>{t("Components.Loading.CheckingSession")}</span>
        </div>
      </div>
    );
  }

  // The host says which features the UI has. The router waits for the answer,
  // so nothing shows up only to disappear a moment later.
  if (isConfigurationLoading) return <Loading fullscreen />;

  return (
    <DirtyGuardProvider>
      <RouterProvider router={router} />
    </DirtyGuardProvider>
  );
};

export default App;
