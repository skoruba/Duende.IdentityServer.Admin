import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import PropertiesApi from "@/components/Properties/PropertiesApi";
import {
  addApiResourceProperty,
  deleteApiResourceProperty,
  getApiResourceProperties,
} from "@/services/ApiResourceServices";
import { queryKeys } from "@/services/QueryKeys";
import { t } from "i18next";
import { Settings } from "lucide-react";
import { useParams } from "react-router-dom";

const PropertiesTab = () => {
  const { resourceId } = useParams<{ resourceId: string }>();

  return (
    <CardWrapper
      title={t("ApiResource.Tabs.Properties")}
      description={t("ApiResource.Tabs.PropertiesDescription")}
      icon={Settings}
    >
      <PropertiesApi
        resourceId={Number(resourceId)}
        queryKey={[queryKeys.apiResourceProperties, resourceId]}
        pageTitle={"Properties"}
        getProperties={getApiResourceProperties}
        addProperty={addApiResourceProperty}
        deleteProperty={deleteApiResourceProperty}
      />
    </CardWrapper>
  );
};

export default PropertiesTab;
