import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PushAuthorizationTab from "./AuthorizationSettings/PushAuthorizationTab";
import PKCETab from "./AuthorizationSettings/PKCETab";
import CIBATab from "./AuthorizationSettings/CIBATab";
import OtherSettingsTab from "./AuthorizationSettings/OtherSettingsTab";
import { t } from "i18next";

const AuthorizationSettingsTab = () => {
  return (
    <Tabs defaultValue="pushAuthorization">
      <TabsList>
        <TabsTrigger value="pushAuthorization">
          {t("Client.Tabs.PushAuthorization")}
        </TabsTrigger>
        <TabsTrigger value="pkce">{t("Client.Tabs.PKCE")}</TabsTrigger>
        <TabsTrigger value="ciba">{t("Client.Tabs.CIBA")}</TabsTrigger>
        <TabsTrigger value="otherSettings">
          {t("Client.Tabs.OtherSettings")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pushAuthorization">
        <PushAuthorizationTab />
      </TabsContent>
      <TabsContent value="pkce">
        <PKCETab />
      </TabsContent>
      <TabsContent value="ciba">
        <CIBATab />
      </TabsContent>
      <TabsContent value="otherSettings">
        <OtherSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AuthorizationSettingsTab;
