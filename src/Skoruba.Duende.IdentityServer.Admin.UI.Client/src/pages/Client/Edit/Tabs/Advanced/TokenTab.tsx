import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdentityTokenTab from "./Token/IdentityTokenTab";
import AccessTokenTab from "./Token/AccessTokenTab";
import RefreshTokenTab from "./Token/RefreshTokenTab";
import DPoPSettingsTab from "./Token/DPoPSettingsTab";
import { useTranslation } from "react-i18next";

const TokenTab = () => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="identityToken">
      <TabsList>
        <TabsTrigger value="identityToken">
          {t("Client.Tabs.IdentityToken")}
        </TabsTrigger>
        <TabsTrigger value="accessToken">
          {t("Client.Tabs.AccessToken")}
        </TabsTrigger>
        <TabsTrigger value="refreshToken">
          {t("Client.Tabs.RefreshToken")}
        </TabsTrigger>
        <TabsTrigger value="dpopSettings">
          {t("Client.Tabs.DPoPSettings")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="identityToken">
        <IdentityTokenTab />
      </TabsContent>
      <TabsContent value="accessToken">
        <AccessTokenTab />
      </TabsContent>
      <TabsContent value="refreshToken">
        <RefreshTokenTab />
      </TabsContent>
      <TabsContent value="dpopSettings">
        <DPoPSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default TokenTab;
