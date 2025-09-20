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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import { Key } from "lucide-react";

const SecretsTab: React.FC = () => {
  const { t } = useTranslation();
  const { clientId } = useParams<{ clientId: string }>();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {t("Client.Tabs.Secrets")}
            </CardTitle>
            <CardDescription>
              {t("Client.Tabs.SecretsDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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

        <Secrets
          resourceId={Number(clientId)}
          queryKey={[queryKeys.clientSecrets]}
          getSecrets={getClientSecrets}
          addSecret={addClientSecret}
          deleteSecret={deleteClientSecret}
        />
      </CardContent>
    </Card>
  );
};

export default SecretsTab;
