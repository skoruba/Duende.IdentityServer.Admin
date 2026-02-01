import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { urlValidationSchema } from "../../../Common/UrlListValidatorSchema";

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
        inputWithTableSettings={{
          validationSchema: urlValidationSchema(t),
        }}
      />
      <FormRow
        name="postLogoutRedirectUris"
        label={t("Client.Label.PostLogoutRedirectUris_Label")}
        description={t("Client.Label.PostLogoutRedirectUris_Info")}
        type="inputWithTable"
        inputWithTableSettings={{
          validationSchema: urlValidationSchema(t),
        }}
      />
    </>
  );
};

export default RedirectUrisTab;
