import React, { useState, useEffect, useContext } from "react";
import AuthHelper from "../helpers/AuthHelper";

interface IUser {
  userName?: string;
  userId?: string;
}

interface IAuthProvider {
  children: React.ReactNode;
}

interface IAuthContext {
  isAuthenticated: boolean;
  user?: IUser;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const defaultContext: IAuthContext = {
  isAuthenticated: false,
  user: undefined,
  isLoading: true,
  login: () => {},
  logout: () => {},
};

export const AuthContext = React.createContext<IAuthContext>(defaultContext);
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }: IAuthProvider) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser>();
  const [isLoading, setIsLoading] = useState(true);

  const getUser = async () => {
    const userResponse = await fetch("/user", {
      headers: {
        "X-ANTI-CSRF": "1",
      },
    });

    const userResult = await userResponse.json();

    setIsAuthenticated(userResult.isAuthenticated);

    if (userResult.isAuthenticated) {
      const user: IUser = {
        userName: userResult.userName,
        userId: userResult.userId,
      };

      setUser(user);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  const login = () => {
    const loginUrl = AuthHelper.getLoginUrl();

    window.location.href = loginUrl;
  };

  const logout = () => {
    const logoutUrl = AuthHelper.getLogoutUrl();

    window.location.href = logoutUrl;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
