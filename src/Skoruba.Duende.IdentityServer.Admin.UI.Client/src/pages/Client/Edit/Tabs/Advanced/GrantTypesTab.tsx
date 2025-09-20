import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { useGrantTypes } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";

const GrantTypesTab = () => {
  const { t } = useTranslation();

  const grantTypes = useGrantTypes();

  if (grantTypes.isLoading) {
    return <Loading />;
  }

  return (
    <FormRow
      name="allowedGrantTypes"
      label={t("Client.Label.AllowedGrantTypes_Label")}
      description={t("Client.Label.AllowedGrantTypes_Info")}
      type="dualList"
      dualListSettings={{ initialItems: grantTypes.data ?? [] }}
    />
  );
};

export default GrantTypesTab;
