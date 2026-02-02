import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RedirectUrisTab from "./Uris/RedirectUrisTab";
import LogoutUrisTab from "./Uris/LogoutUrisTab";
import CorsOriginsTab from "./Uris/CorsOriginsTab";
import { useTranslation } from "react-i18next";

import { Globe } from "lucide-react";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

const UrlsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("Client.Tabs.Urls")}
      description={t("Client.Tabs.UrlsDescription")}
      icon={Globe}
    >
      <Tabs defaultValue="redirectUris">
        <TabsList>
          <TabsTrigger value="redirectUris">
            {t("Client.Tabs.RedirectUris")}
          </TabsTrigger>
          <TabsTrigger value="logoutUris">
            {t("Client.Tabs.LogoutUris")}
          </TabsTrigger>
          <TabsTrigger value="corsOrigins">
            {t("Client.Tabs.CorsOrigins")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="redirectUris">
          <RedirectUrisTab />
        </TabsContent>
        <TabsContent value="logoutUris">
          <LogoutUrisTab />
        </TabsContent>
        <TabsContent value="corsOrigins">
          <CorsOriginsTab />
        </TabsContent>
      </Tabs>
    </CardWrapper>
  );
};

export default UrlsTab;
