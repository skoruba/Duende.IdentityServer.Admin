import "./i18n/config";
import { useAuth } from "./contexts/AuthContext";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing/Router";
import Loading from "./components/Loading/Loading";
import { DirtyGuardProvider } from "./contexts/DirtyGuardContext";

const App = () => {
  const { isLoading } = useAuth();

  return isLoading ? (
    <Loading />
  ) : (
    <DirtyGuardProvider>
      <RouterProvider router={router} />
    </DirtyGuardProvider>
  );
};

export default App;
