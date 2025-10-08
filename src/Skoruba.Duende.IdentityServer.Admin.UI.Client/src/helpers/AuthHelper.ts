import { getBaseHref } from "@/lib/utils";

const joinUrl = (base: string, path: string): string => {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}${normalizedPath}`;
};

const getSafeReturnUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const { pathname, search } = window.location;
  return `${pathname}${search}`;
};

class AuthHelper {
  static getLoginUrl = (): string => {
    const loginUrl = joinUrl(getBaseHref(), "account/login");
    const returnUrl = getSafeReturnUrl();
    return returnUrl
      ? `${loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`
      : loginUrl;
  };

  static getLogoutUrl = (): string => {
    return joinUrl(getBaseHref(), "account/logout");
  };

  static getCsrfUrl = (): string => {
    return joinUrl(getBaseHref(), "csrf/gettoken");
  };

  static redirectToLoginUrl = (): void => {
    if (typeof window === "undefined") return;
    window.location.assign(AuthHelper.getLoginUrl());
  };

  static redirectToLogoutUrl = (): void => {
    if (typeof window === "undefined") return;
    window.location.assign(AuthHelper.getLogoutUrl());
  };
}

export default AuthHelper;
