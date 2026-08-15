import { SettingsTabs } from "@/components/SettingsTabs/SettingsTabs";
import { useClientCapabilities } from "@/contexts/ClientCapabilitiesContext";
import PushAuthorizationTab from "./AuthorizationSettings/PushAuthorizationTab";
import PKCETab from "./AuthorizationSettings/PKCETab";
import CIBATab from "./AuthorizationSettings/CIBATab";
import OtherSettingsTab from "./AuthorizationSettings/OtherSettingsTab";
import { t } from "i18next";
import { Send, Shuffle, Eye, Settings } from "lucide-react";

const AuthorizationSettingsTab = () => {
  const capabilities = useClientCapabilities();

  return (
    <SettingsTabs
      tabs={[
        {
          value: "pushAuthorization",
          label: t("Client.Tabs.PushAuthorization"),
          icon: Send,
          content: <PushAuthorizationTab />,
        },
        {
          value: "pkce",
          label: t("Client.Tabs.PKCE"),
          icon: Shuffle,
          content: <PKCETab />,
          isVisible: capabilities.usesPkce,
        },
        {
          value: "ciba",
          label: t("Client.Tabs.CIBA"),
          icon: Eye,
          content: <CIBATab />,
          isVisible: capabilities.usesCiba,
        },
        {
          value: "otherSettings",
          label: t("Client.Tabs.OtherSettings"),
          icon: Settings,
          content: <OtherSettingsTab />,
        },
      ]}
    />
  );
};

export default AuthorizationSettingsTab;
