import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const PushAuthorizationTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="requirePushedAuthorization"
        label={t("Client.Label.RequirePushedAuthorization_Label")}
        description={t("Client.Label.RequirePushedAuthorization_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="pushedAuthorizationLifetime"
        label={t("Client.Label.PushedAuthorizationLifetime_Label")}
        description={t("Client.Label.PushedAuthorizationLifetime_Info")}
        type="number"
        includeSeparator
      />
    </>
  );
};

export default PushAuthorizationTab;
