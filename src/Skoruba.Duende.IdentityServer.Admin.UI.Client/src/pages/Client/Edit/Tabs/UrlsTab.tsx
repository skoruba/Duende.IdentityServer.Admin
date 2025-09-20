import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RedirectUrisTab from "./Uris/RedirectUrisTab";
import LogoutUrisTab from "./Uris/LogoutUrisTab";
import CorsOriginsTab from "./Uris/CorsOriginsTab";
import { useTranslation } from "react-i18next";

const UrlsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
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
  );
};

export default UrlsTab;
