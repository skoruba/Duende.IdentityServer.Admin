import { SettingsTabs } from "@/components/SettingsTabs/SettingsTabs";
import { useClientCapabilities } from "@/contexts/ClientCapabilitiesContext";
import IdentityTokenTab from "./Token/IdentityTokenTab";
import AccessTokenTab from "./Token/AccessTokenTab";
import RefreshTokenTab from "./Token/RefreshTokenTab";
import DPoPSettingsTab from "./Token/DPoPSettingsTab";
import { useTranslation } from "react-i18next";
import { IdCard, KeyRound, RefreshCcw, ShieldCheck } from "lucide-react";

const TokenTab = () => {
  const { t } = useTranslation();
  const capabilities = useClientCapabilities();

  return (
    <SettingsTabs
      tabs={[
        {
          value: "identityToken",
          label: t("Client.Tabs.IdentityToken"),
          icon: IdCard,
          content: <IdentityTokenTab />,
          isVisible: capabilities.usesUserAuthentication,
        },
        {
          value: "accessToken",
          label: t("Client.Tabs.AccessToken"),
          icon: KeyRound,
          content: <AccessTokenTab />,
        },
        {
          value: "refreshToken",
          label: t("Client.Tabs.RefreshToken"),
          icon: RefreshCcw,
          content: <RefreshTokenTab />,
          isVisible: capabilities.usesRefreshTokens,
        },
        {
          value: "dpopSettings",
          label: t("Client.Tabs.DPoPSettings"),
          icon: ShieldCheck,
          content: <DPoPSettingsTab />,
        },
      ]}
    />
  );
};

export default TokenTab;
