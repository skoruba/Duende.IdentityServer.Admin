import { useEffect } from "react";

export type GuardProps = {
  isAuthenticated: boolean;
  login: () => void;
  children: JSX.Element;
};

const Login = ({ login }: { login: () => void }) => {
  useEffect(() => {
    login();
  }, [login]);
  return <></>;
};

export const ProtectedRoute = ({
  children,
  isAuthenticated,
  login,
}: GuardProps) => {
  if (isAuthenticated) {
    return children;
  } else {
    return <Login login={login} />;
  }
};

export default ProtectedRoute;
