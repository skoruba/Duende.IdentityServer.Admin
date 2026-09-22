import { SettingsTabs } from "@/components/SettingsTabs/SettingsTabs";
import { useClientCapabilities } from "@/contexts/ClientCapabilitiesContext";
import GrantTypesTab from "./Advanced/GrantTypesTab";
import AuthenticationLogoutTab from "./Advanced/AuthenticationLogoutTab";
import TokenTab from "./Advanced/TokenTab";
import ConsentScreenTab from "./Advanced/ConsentScreenTab";
import DeviceFlowTab from "./Advanced/DeviceFlowTab";
import { useTranslation } from "react-i18next";
import ClientPropertiesTab from "./Advanced/ClientPropertiesTab";
import ClientClaimsTab from "./Advanced/ClientClaimsTab";
import AuthorizationSettingsTab from "./Advanced/AuthorizationSettingsTab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import {
  SlidersHorizontal,
  GitBranch,
  LogOut,
  ShieldCheck,
  KeyRound,
  Monitor,
  FileText,
  ListChecks,
  Settings,
} from "lucide-react";

const AdvancedSettingsTab = () => {
  const { t } = useTranslation();
  const capabilities = useClientCapabilities();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SlidersHorizontal className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {t("Client.Tabs.Advanced")}
            </CardTitle>
            <CardDescription>
              {t("Client.Tabs.AdvancedDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SettingsTabs
          tabs={[
            {
              value: "grant_types",
              label: t("Client.Tabs.GrantTypes"),
              icon: GitBranch,
              content: <GrantTypesTab />,
            },
            {
              value: "authentication_logout",
              label: t("Client.Tabs.Authentication"),
              icon: LogOut,
              content: <AuthenticationLogoutTab />,
              isVisible: capabilities.usesUserAuthentication,
            },
            {
              value: "authorization",
              label: t("Client.Tabs.Authorization"),
              icon: ShieldCheck,
              content: <AuthorizationSettingsTab />,
              isVisible: capabilities.usesUserAuthentication,
            },
            {
              value: "token",
              label: t("Client.Tabs.Tokens"),
              icon: KeyRound,
              content: <TokenTab />,
            },
            {
              value: "consent_screen",
              label: t("Client.Tabs.Consent"),
              icon: FileText,
              content: <ConsentScreenTab />,
              isVisible: capabilities.usesConsent,
            },
            {
              value: "device_flow",
              label: t("Client.Tabs.DeviceFlow"),
              icon: Monitor,
              content: <DeviceFlowTab />,
              isVisible: capabilities.usesDeviceFlow,
            },
            {
              value: "claims",
              label: t("Client.Tabs.ClientClaims"),
              icon: ListChecks,
              content: <ClientClaimsTab />,
            },
            {
              value: "properties",
              label: t("Client.Tabs.ClientProperties"),
              icon: Settings,
              content: <ClientPropertiesTab />,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default AdvancedSettingsTab;
