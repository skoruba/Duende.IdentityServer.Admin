import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { useDPoPValidationModes } from "@/services/ClientServices";

const DPoPSettingsTab = () => {
  const { t } = useTranslation();
  const { data: dPoPValidationModes } = useDPoPValidationModes();

  return (
    <>
      <FormRow
        name="requireDPoP"
        label={t("Client.Label.RequireDPoP_Label")}
        description={t("Client.Label.RequireDPoP_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="dPoPClockSkew"
        label={t("Client.Label.DPoPClockSkew_Label")}
        description={t("Client.Label.DPoPClockSkew_Info")}
        type="time"
        includeSeparator
      />
      <FormRow
        name="dPoPValidationMode"
        label={t("Client.Label.DPoPValidationMode_Label")}
        description={t("Client.Label.DPoPValidationMode_Info")}
        type="select"
        selectSettings={{
          options: dPoPValidationModes ?? [],
        }}
        includeSeparator
      />
    </>
  );
};

export default DPoPSettingsTab;
