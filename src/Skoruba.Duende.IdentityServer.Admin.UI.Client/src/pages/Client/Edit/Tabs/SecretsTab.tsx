import * as React from "react";
import { useTranslation } from "react-i18next";
import { FormRow } from "@/components/FormRow/FormRow";
import Secrets from "@/components/Secrets/Secrets";
import {
  addClientSecret,
  deleteClientSecret,
  getClientSecrets,
} from "@/services/ClientServices";
import { useParams } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";
import { Key } from "lucide-react";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { Tip } from "@/components/Tip/Tip";
import { ClientEditFormData } from "../../ClientSchema";
import { useFormContext, useWatch } from "react-hook-form";

const SecretsTab: React.FC = () => {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();
  const { control } = useFormContext<ClientEditFormData>();

  const requireClientSecret = useWatch({
    control,
    name: "requireClientSecret",
  });

  return (
    <CardWrapper
      title={t("Client.Tabs.Secrets")}
      description={t("Client.Tabs.SecretsDescription")}
      icon={Key}
    >
      <FormRow
        name="requireClientSecret"
        label={t("Client.Label.RequireClientSecret_Label")}
        description={t("Client.Label.RequireClientSecret_Info")}
        type="switch"
      />
      <FormRow
        name="allowOfflineAccess"
        label={t("Client.Label.AllowOfflineAccess_Label")}
        description={t("Client.Label.AllowOfflineAccess_Info")}
        type="switch"
        includeSeparator
      />

      {!requireClientSecret && (
        <Tip className="mb-4">{t("Client.Tabs.SecretsNotUsed")}</Tip>
      )}

      <Secrets
        resourceId={Number(clientId)}
        queryKey={[queryKeys.clientSecrets]}
        getSecrets={getClientSecrets}
        addSecret={addClientSecret}
        deleteSecret={deleteClientSecret}
      />
    </CardWrapper>
  );
};

export default SecretsTab;
