import { getBaseHref } from "@/lib/utils";

class AuthHelper {
  static getLoginUrl = (): string => {
    const baseHref = getBaseHref();
    const normalized = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;

    const loginUrl = `${normalized}account/login?returnUrl=${window.location.pathname}`;

    return loginUrl;
  };

  static getLogoutUrl = (): string => {
    const baseHref = getBaseHref();
    const normalized = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;

    const logoutUrl = `${normalized}account/logout`;

    return logoutUrl;
  };

  static redirectToLoginUrl = (): void => {
    window.location.href = AuthHelper.getLoginUrl();
  };

  static redirectToLogoutUrl = (): void => {
    window.location.href = AuthHelper.getLogoutUrl();
  };
}

export default AuthHelper;
