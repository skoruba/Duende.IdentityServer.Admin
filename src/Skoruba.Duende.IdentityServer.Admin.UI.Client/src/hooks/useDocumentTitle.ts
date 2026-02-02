import { useEffect } from "react";
import { useApplicationInformation } from "@/services/InfoServices";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export const useDocumentTitle = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data: applicationInfo } = useApplicationInformation({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated && applicationInfo?.applicationName) {
      document.title = applicationInfo.applicationName;
    } else {
      document.title = t("Components.Loading.Loading");
    }
  }, [isAuthenticated, applicationInfo?.applicationName, t]);
};
