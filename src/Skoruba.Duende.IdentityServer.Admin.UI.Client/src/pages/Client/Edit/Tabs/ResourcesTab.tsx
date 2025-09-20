import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import Loading from "@/components/Loading/Loading";
import { useClientScopes } from "@/services/ClientServices";

const ResourcesTab: React.FC = () => {
  const { t } = useTranslation();
  const clientResources = useClientScopes(false, false);

  if (clientResources.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormRow
        name="allowedScopes"
        label={t("Client.Label.AllowedScopes_Label")}
        description={t("Client.Label.AllowedScopes_Info")}
        type="dualList"
        dualListSettings={{ initialItems: clientResources.data ?? [] }}
        includeSeparator
      />
    </>
  );
};

export default ResourcesTab;
