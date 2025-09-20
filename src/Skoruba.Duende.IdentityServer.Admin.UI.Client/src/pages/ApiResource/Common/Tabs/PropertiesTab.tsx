import PropertiesApi from "@/components/Properties/PropertiesApi";
import {
  addApiResourceProperty,
  deleteApiResourceProperty,
  getApiResourceProperties,
} from "@/services/ApiResourceServices";
import { queryKeys } from "@/services/QueryKeys";
import { useParams } from "react-router-dom";

const PropertiesTab = () => {
  const { resourceId } = useParams<{ resourceId: string }>();

  return (
    <PropertiesApi
      resourceId={Number(resourceId)}
      queryKey={[queryKeys.apiResourceProperties, resourceId]}
      pageTitle={"Properties"}
      getProperties={getApiResourceProperties}
      addProperty={addApiResourceProperty}
      deleteProperty={deleteApiResourceProperty}
    />
  );
};

export default PropertiesTab;
