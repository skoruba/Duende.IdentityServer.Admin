import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const OtherSettingsTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="requireRequestObject"
        label={t("Client.Label.RequireRequestObject_Label")}
        description={t("Client.Label.RequireRequestObject_Info")}
        type="switch"
        includeSeparator
      />

      <FormRow
        name="pairWiseSubjectSalt"
        label={t("Client.Label.PairWiseSubjectSalt_Label")}
        description={t("Client.Label.PairWiseSubjectSalt_Info")}
        type="input"
        includeSeparator
      />

      <FormRow
        name="initiateLoginUri"
        label={t("Client.Label.InitiateLoginUri_Label")}
        description={t("Client.Label.InitiateLoginUri_Info")}
        type="input"
      />
    </>
  );
};

export default OtherSettingsTab;
