import React, { useState, useEffect, useContext } from "react";
import AuthHelper from "../helpers/AuthHelper";
import { getBaseHref } from "@/lib/utils";

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
    try {
      const baseHref = getBaseHref();
      const userUrl = `${baseHref}user`;
      const userResponse = await fetch(userUrl, {
        headers: {
          "X-ANTI-CSRF": "1",
        },
      });

      if (userResponse.status === 401) {
        setIsAuthenticated(false);
        setUser(undefined);
        return;
      }

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userResult = (await userResponse.json()) as {
        isAuthenticated?: boolean;
        userName?: string;
        userId?: string;
      };

      const authenticated = !!userResult.isAuthenticated;
      setIsAuthenticated(authenticated);

      setUser(
        authenticated
          ? { userName: userResult.userName, userId: userResult.userId }
          : undefined
      );
    } catch (error) {
      console.error("Failed to get user info:", error);
      setIsAuthenticated(false);
      setUser(undefined);
    } finally {
      setIsLoading(false);
    }
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
