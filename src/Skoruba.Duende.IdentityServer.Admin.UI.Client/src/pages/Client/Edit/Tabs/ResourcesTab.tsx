import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import Loading from "@/components/Loading/Loading";
import { useClientScopes } from "@/services/ClientServices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import { ShieldCheck } from "lucide-react";

const ResourcesTab: React.FC = () => {
  const { t } = useTranslation();
  const clientResources = useClientScopes(false, false);

  if (clientResources.isLoading) {
    return <Loading />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{t("Client.Tabs.Scopes")}</CardTitle>
            <CardDescription>
              {t("Client.Tabs.ScopesDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FormRow
          name="allowedScopes"
          label={t("Client.Label.AllowedScopes_Label")}
          description={t("Client.Label.AllowedScopes_Info")}
          type="dualList"
          dualListSettings={{ initialItems: clientResources.data ?? [] }}
          includeSeparator
        />
      </CardContent>
    </Card>
  );
};

export default ResourcesTab;
