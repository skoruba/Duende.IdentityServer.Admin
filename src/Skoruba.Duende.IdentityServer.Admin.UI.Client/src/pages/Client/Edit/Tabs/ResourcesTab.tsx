import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import Loading from "@/components/Loading/Loading";
import { useClientScopes } from "@/services/ClientServices";
import { ShieldCheck } from "lucide-react";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

const ResourcesTab: React.FC = () => {
  const { t } = useTranslation();
  const clientResources = useClientScopes(false, false);

  if (clientResources.isLoading) {
    return <Loading />;
  }

  return (
    <CardWrapper
      title={t("Client.Tabs.Scopes")}
      description={t("Client.Tabs.ScopesDescription")}
      icon={ShieldCheck}
    >
      <FormRow
        name="allowedScopes"
        label={t("Client.Label.AllowedScopes_Label")}
        description={t("Client.Label.AllowedScopes_Info")}
        type="dualList"
        dualListSettings={{ initialItems: clientResources.data ?? [] }}
        includeSeparator
      />
    </CardWrapper>
  );
};

export default ResourcesTab;
