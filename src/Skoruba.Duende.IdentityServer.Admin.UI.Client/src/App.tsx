import "./i18n/config";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useUiConfiguration } from "./contexts/UiConfigurationContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing/Router";
import Loading from "./components/Loading/Loading";
import { DirtyGuardProvider } from "./contexts/DirtyGuardContext";

const App = () => {
  const { isLoading, isAuthenticated, login } = useAuth();
  const { isLoading: isConfigurationLoading } = useUiConfiguration();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  if (isLoading || !isAuthenticated || isConfigurationLoading) {
    return <Loading fullscreen />;
  }

  return (
    <DirtyGuardProvider>
      <RouterProvider router={router} />
    </DirtyGuardProvider>
  );
};

export default App;
