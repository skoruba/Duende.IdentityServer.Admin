import * as React from "react";
import Secrets from "@/components/Secrets/Secrets";
import {
  addApiResourceSecret,
  deleteApiResourceSecret,
  getApiResourceSecrets,
} from "@/services/ApiResourceServices";
import { useParams } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";

const SecretsTab: React.FC = () => {
  const { resourceId } = useParams<{ resourceId: string }>();
  return (
    <>
      <Secrets
        resourceId={Number(resourceId)}
        queryKey={[queryKeys.apiResourceSecrets]}
        getSecrets={getApiResourceSecrets}
        addSecret={addApiResourceSecret}
        deleteSecret={deleteApiResourceSecret}
      />
    </>
  );
};

export default SecretsTab;
