import React from "react";
import { useParams } from "react-router-dom";
import PropertiesTab from "@/components/Properties/PropertiesApi";
import {
  addIdentityResourceProperty,
  deleteIdentityResourceProperty,
  getIdentityResourceProperties,
} from "@/services/IdentityResourceServices";
import { useTranslation } from "react-i18next";
import { queryKeys } from "@/services/QueryKeys";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { Settings } from "lucide-react";

const IdentityResourcePropertiesTab: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  const { t } = useTranslation();

  if (!resourceId) return null;

  return (
    <CardWrapper
      title={t("IdentityResource.Tabs.Properties")}
      description={t("IdentityResource.Tabs.PropertiesDescription")}
      icon={Settings}
    >
      <PropertiesTab
        resourceId={Number(resourceId)}
        queryKey={[queryKeys.identityResourceProperties, resourceId]}
        pageTitle={t("IdentityResource.Tabs.Properties")}
        getProperties={getIdentityResourceProperties}
        addProperty={addIdentityResourceProperty}
        deleteProperty={deleteIdentityResourceProperty}
      />
    </CardWrapper>
  );
};

export default IdentityResourcePropertiesTab;
