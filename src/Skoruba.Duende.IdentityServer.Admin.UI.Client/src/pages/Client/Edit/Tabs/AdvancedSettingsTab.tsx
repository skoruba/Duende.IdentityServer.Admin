import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrantTypesTab from "./Advanced/GrantTypesTab";
import AuthenticationLogoutTab from "./Advanced/AuthenticationLogoutTab";
import TokenTab from "./Advanced/TokenTab";
import ConsentScreenTab from "./Advanced/ConsentScreenTab";
import DeviceFlowTab from "./Advanced/DeviceFlowTab";
import { useTranslation } from "react-i18next";
import ClientPropertiesTab from "./Advanced/ClientPropertiesTab";
import ClientClaimsTab from "./Advanced/ClientClaimsTab";
import OtherSettingsTab from "./Advanced/AuthorizationSettings/OtherSettingsTab";
import AuthorizationSettingsTab from "./Advanced/AuthorizationSettingsTab";

const AdvancedSettingsTab = () => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="grant_types">
      <TabsList>
        <TabsTrigger value="grant_types">
          {t("Client.Tabs.GrantTypes")}
        </TabsTrigger>
        <TabsTrigger value="authentication_logout">
          {t("Client.Tabs.Authentication")}
        </TabsTrigger>
        <TabsTrigger value="authorization">
          {t("Client.Tabs.Authorization")}
        </TabsTrigger>
        <TabsTrigger value="token">{t("Client.Tabs.Tokens")}</TabsTrigger>
        <TabsTrigger value="consent_screen">
          {t("Client.Tabs.Consent")}
        </TabsTrigger>
        <TabsTrigger value="device_flow">
          {t("Client.Tabs.DeviceFlow")}
        </TabsTrigger>
        <TabsTrigger value="claims">
          {t("Client.Tabs.ClientClaims")}
        </TabsTrigger>
        <TabsTrigger value="properties">
          {t("Client.Tabs.ClientProperties")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grant_types">
        <GrantTypesTab />
      </TabsContent>

      <TabsContent value="authorization">
        <AuthorizationSettingsTab />
      </TabsContent>

      <TabsContent value="authentication_logout">
        <AuthenticationLogoutTab />
      </TabsContent>

      <TabsContent value="token">
        <TokenTab />
      </TabsContent>

      <TabsContent value="consent_screen">
        <ConsentScreenTab />
      </TabsContent>

      <TabsContent value="device_flow">
        <DeviceFlowTab />
      </TabsContent>

      <TabsContent value="properties">
        <ClientPropertiesTab />
      </TabsContent>

      <TabsContent value="claims">
        <ClientClaimsTab />
      </TabsContent>
      <TabsContent value="otherSettings">
        <OtherSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdvancedSettingsTab;
