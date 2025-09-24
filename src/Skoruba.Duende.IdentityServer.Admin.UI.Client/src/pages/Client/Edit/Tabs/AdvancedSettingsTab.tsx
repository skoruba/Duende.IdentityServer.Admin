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
        <Tabs defaultValue="grant_types">
          <TabsList>
            <TabsTrigger
              value="grant_types"
              className="flex items-center gap-2"
            >
              <GitBranch className="h-4 w-4" />
              {t("Client.Tabs.GrantTypes")}
            </TabsTrigger>

            <TabsTrigger
              value="authentication_logout"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t("Client.Tabs.Authentication")}
            </TabsTrigger>

            <TabsTrigger
              value="authorization"
              className="flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("Client.Tabs.Authorization")}
            </TabsTrigger>

            <TabsTrigger value="token" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              {t("Client.Tabs.Tokens")}
            </TabsTrigger>

            <TabsTrigger
              value="consent_screen"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {t("Client.Tabs.Consent")}
            </TabsTrigger>

            <TabsTrigger
              value="device_flow"
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              {t("Client.Tabs.DeviceFlow")}
            </TabsTrigger>

            <TabsTrigger value="claims" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              {t("Client.Tabs.ClientClaims")}
            </TabsTrigger>

            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
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
      </CardContent>
    </Card>
  );
};

export default AdvancedSettingsTab;
