import PropertiesApi from "@/components/Properties/PropertiesApi";
import {
  addApiScopeProperty,
  deleteApiScopeProperty,
  getApiScopeProperties,
} from "@/services/ApiScopeServices";
import { useParams } from "react-router-dom";

const PropertiesTab = () => {
  const { scopeId } = useParams<{ scopeId: string }>();

  if (!scopeId) return null;

  return (
    <PropertiesApi
      resourceId={Number(scopeId)}
      queryKey={["apiScopeProperties", scopeId]}
      pageTitle={"Properties"}
      getProperties={getApiScopeProperties}
      addProperty={addApiScopeProperty}
      deleteProperty={deleteApiScopeProperty}
    />
  );
};

export default PropertiesTab;
