import { FormRow } from "@/components/FormRow/FormRow";
import { t } from "i18next";

const PKCETab = () => {
  return (
    <>
      <FormRow
        name="requirePkce"
        label={t("Client.Label.RequirePkce_Label")}
        description={t("Client.Label.RequirePkce_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="allowPlainTextPkce"
        label={t("Client.Label.AllowPlainTextPkce_Label")}
        description={t("Client.Label.AllowPlainTextPkce_Info")}
        type="switch"
        includeSeparator
      />
    </>
  );
};

export default PKCETab;
