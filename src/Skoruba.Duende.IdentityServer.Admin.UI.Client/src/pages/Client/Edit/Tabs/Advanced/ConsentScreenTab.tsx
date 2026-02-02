import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const ConsentScreenTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="requireConsent"
        label={t("Client.Label.RequireConsent_Label")}
        description={t("Client.Label.RequireConsent_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="consentLifetime"
        label={t("Client.Label.ConsentLifetime_Label")}
        description={t("Client.Label.ConsentLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="allowRememberConsent"
        label={t("Client.Label.AllowRememberConsent_Label")}
        description={t("Client.Label.AllowRememberConsent_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="clientUri"
        label={t("Client.Label.ClientUri_Label")}
        description={t("Client.Label.ClientUri_Info")}
        type="input"
        includeSeparator
      />
      <FormRow
        name="logoUri"
        label={t("Client.Label.LogoUri_Label")}
        description={t("Client.Label.LogoUri_Info")}
        type="input"
      />
    </>
  );
};

export default ConsentScreenTab;
