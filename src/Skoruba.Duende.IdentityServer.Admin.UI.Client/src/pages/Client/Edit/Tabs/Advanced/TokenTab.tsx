import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdentityTokenTab from "./Token/IdentityTokenTab";
import AccessTokenTab from "./Token/AccessTokenTab";
import RefreshTokenTab from "./Token/RefreshTokenTab";
import DPoPSettingsTab from "./Token/DPoPSettingsTab";
import { useTranslation } from "react-i18next";
import { IdCard, KeyRound, RefreshCcw, ShieldCheck } from "lucide-react";

const TokenTab = () => {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="identityToken">
      <TabsList>
        <TabsTrigger value="identityToken" className="flex items-center gap-2">
          <IdCard className="h-4 w-4" />
          {t("Client.Tabs.IdentityToken")}
        </TabsTrigger>

        <TabsTrigger value="accessToken" className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          {t("Client.Tabs.AccessToken")}
        </TabsTrigger>

        <TabsTrigger value="refreshToken" className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          {t("Client.Tabs.RefreshToken")}
        </TabsTrigger>

        <TabsTrigger value="dpopSettings" className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
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
