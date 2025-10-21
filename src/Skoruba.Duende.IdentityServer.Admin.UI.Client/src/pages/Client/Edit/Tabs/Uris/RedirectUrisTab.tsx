import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const RedirectUrisTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="redirectUris"
        label={t("Client.Label.RedirectUris_Label")}
        description={t("Client.Label.RedirectUris_Info")}
        type="inputWithTable"
        includeSeparator
      />
      <FormRow
        name="postLogoutRedirectUris"
        label={t("Client.Label.PostLogoutRedirectUris_Label")}
        description={t("Client.Label.PostLogoutRedirectUris_Info")}
        type="inputWithTable"
      />
    </>
  );
};

export default RedirectUrisTab;
