import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import PropertiesApi from "@/components/Properties/PropertiesApi";
import {
  addApiScopeProperty,
  deleteApiScopeProperty,
  getApiScopeProperties,
} from "@/services/ApiScopeServices";
import { t } from "i18next";
import { Settings } from "lucide-react";
import { useParams } from "react-router-dom";

const PropertiesTab = () => {
  const { scopeId } = useParams<{ scopeId: string }>();

  if (!scopeId) return null;

  return (
    <CardWrapper
      title={t("ApiScope.Tabs.Properties")}
      description={t("ApiScope.Tabs.PropertiesDescription")}
      icon={Settings}
    >
      <PropertiesApi
        resourceId={Number(scopeId)}
        queryKey={["apiScopeProperties", scopeId]}
        pageTitle={"Properties"}
        getProperties={getApiScopeProperties}
        addProperty={addApiScopeProperty}
        deleteProperty={deleteApiScopeProperty}
      />
    </CardWrapper>
  );
};

export default PropertiesTab;
