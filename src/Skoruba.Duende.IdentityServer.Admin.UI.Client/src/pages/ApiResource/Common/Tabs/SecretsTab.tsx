import * as React from "react";
import Secrets from "@/components/Secrets/Secrets";
import {
  addApiResourceSecret,
  deleteApiResourceSecret,
  getApiResourceSecrets,
} from "@/services/ApiResourceServices";
import { useParams } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";
import { t } from "i18next";
import { Key } from "lucide-react";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

const SecretsTab: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  return (
    <CardWrapper
      title={t("ApiResource.Tabs.Secrets")}
      description={t("ApiResource.Tabs.SecretsDescription")}
      icon={Key}
    >
      <Secrets
        resourceId={Number(resourceId)}
        queryKey={[queryKeys.apiResourceSecrets]}
        getSecrets={getApiResourceSecrets}
        addSecret={addApiResourceSecret}
        deleteSecret={deleteApiResourceSecret}
      />
    </CardWrapper>
  );
};

export default SecretsTab;
