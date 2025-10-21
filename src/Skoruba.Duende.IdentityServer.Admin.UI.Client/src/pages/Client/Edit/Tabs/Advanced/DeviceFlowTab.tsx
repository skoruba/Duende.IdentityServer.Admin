import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const DeviceFlowTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="userCodeType"
        label={t("Client.Label.UserCodeType_Label")}
        description={t("Client.Label.UserCodeType_Info")}
        type="input"
        includeSeparator
      />
      <FormRow
        name="deviceCodeLifetime"
        label={t("Client.Label.DeviceCodeLifetime_Label")}
        description={t("Client.Label.DeviceCodeLifetime_Info")}
        type="number"
      />
    </>
  );
};

export default DeviceFlowTab;
