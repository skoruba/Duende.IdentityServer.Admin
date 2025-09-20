import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
const CIBATab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="cibaLifetime"
        label={t("Client.Label.CibaLifetime_Label")}
        description={t("Client.Label.CibaLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="pollingInterval"
        label={t("Client.Label.PollingInterval_Label")}
        description={t("Client.Label.PollingInterval_Info")}
        type="number"
        includeSeparator
      />
    </>
  );
};

export default CIBATab;
