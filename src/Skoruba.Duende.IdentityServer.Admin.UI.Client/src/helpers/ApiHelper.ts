import { getBaseHref } from "@/lib/utils";

class ApiHelper {
  static getApiBaseUrl = (): string => {
    const baseHref = getBaseHref();
    const normalized = baseHref.endsWith("/") ? baseHref : `${baseHref}/`;

    return `${normalized}identity-server-admin-api`;
  };
}

export default ApiHelper;
