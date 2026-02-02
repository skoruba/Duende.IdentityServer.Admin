import { FormRow } from "@/components/FormRow/FormRow";
import ClaimsForm from "@/components/Claims/ClaimsForm";
import { useTranslation } from "react-i18next";

const ClientClaimsTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <FormRow
          name="alwaysSendClientClaims"
          label={t("Client.Label.AlwaysSendClientClaims_Label")}
          description={t("Client.Label.AlwaysSendClientClaims_Info")}
          type="switch"
          includeSeparator
        />
        <FormRow
          name="clientClaimsPrefix"
          label={t("Client.Label.ClientClaimsPrefix_Label")}
          description={t("Client.Label.ClientClaimsPrefix_Info")}
          type="input"
          includeSeparator
        />
      </div>
      <ClaimsForm />
    </>
  );
};

export default ClientClaimsTab;
