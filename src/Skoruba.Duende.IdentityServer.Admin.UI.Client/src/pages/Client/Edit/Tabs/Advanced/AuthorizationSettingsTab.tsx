import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PushAuthorizationTab from "./AuthorizationSettings/PushAuthorizationTab";
import PKCETab from "./AuthorizationSettings/PKCETab";
import CIBATab from "./AuthorizationSettings/CIBATab";
import OtherSettingsTab from "./AuthorizationSettings/OtherSettingsTab";
import { t } from "i18next";
import { Send, Shuffle, Eye, Settings } from "lucide-react";

const AuthorizationSettingsTab = () => {
  return (
    <Tabs defaultValue="pushAuthorization">
      <TabsList>
        <TabsTrigger
          value="pushAuthorization"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {t("Client.Tabs.PushAuthorization")}
        </TabsTrigger>

        <TabsTrigger value="pkce" className="flex items-center gap-2">
          <Shuffle className="h-4 w-4" />
          {t("Client.Tabs.PKCE")}
        </TabsTrigger>

        <TabsTrigger value="ciba" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {t("Client.Tabs.CIBA")}
        </TabsTrigger>

        <TabsTrigger value="otherSettings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
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
