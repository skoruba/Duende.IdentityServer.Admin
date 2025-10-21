import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { useAccessTokenTypes } from "@/services/ClientServices";

const AccessTokenTab = () => {
  const { t } = useTranslation();
  const { data: accessTokenTypes } = useAccessTokenTypes();

  return (
    <>
      <FormRow
        name="accessTokenLifetime"
        label={t("Client.Label.AccessTokenLifetime_Label")}
        description={t("Client.Label.AccessTokenLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="allowAccessTokenViaBrowser"
        label={t("Client.Label.AllowAccessTokensViaBrowser_Label")}
        description={t("Client.Label.AllowAccessTokensViaBrowser_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="accessTokenType"
        label={t("Client.Label.AccessTokenTypes_Label")}
        description={t("Client.Label.AccessTokenTypes_Info")}
        type="select"
        selectSettings={{ options: accessTokenTypes ?? [] }}
        includeSeparator
      />
      <FormRow
        name="authorizationCodeLifetime"
        label={t("Client.Label.AuthorizationCodeLifetime_Label")}
        description={t("Client.Label.AuthorizationCodeLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="updateAccessTokenClaimsOnRefresh"
        label={t("Client.Label.UpdateAccessTokenClaimsOnRefresh_Label")}
        description={t("Client.Label.UpdateAccessTokenClaimsOnRefresh_Info")}
        type="switch"
        includeSeparator
      />
    </>
  );
};

export default AccessTokenTab;
