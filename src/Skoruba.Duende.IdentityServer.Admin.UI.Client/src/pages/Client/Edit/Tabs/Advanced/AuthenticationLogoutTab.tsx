import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const AuthenticationLogoutTab = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="enableLocalLogin"
        label={t("Client.Label.EnableLocalLogin_Label")}
        description={t("Client.Label.EnableLocalLogin_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="identityProviderRestrictions"
        label={t("Client.Label.IdentityProviderRestrictions_Label")}
        description={t("Client.Label.IdentityProviderRestrictions_Info")}
        type="inputWithTable"
        includeSeparator
      />
      <FormRow
        name="useSsoLifetime"
        label={t("Client.Label.UserSsoLifetime_Label")}
        description={t("Client.Label.UserSsoLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="coordinateLifetimeWithUserSession"
        label={t("Client.Label.CoordinateLifetimeWithUserSession_Label")}
        description={t("Client.Label.CoordinateLifetimeWithUserSession_Info")}
        type="switch"
      />
    </>
  );
};

export default AuthenticationLogoutTab;
