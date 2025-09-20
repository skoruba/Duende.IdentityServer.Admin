import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RedirectUrisTab from "./Uris/RedirectUrisTab";
import LogoutUrisTab from "./Uris/LogoutUrisTab";
import CorsOriginsTab from "./Uris/CorsOriginsTab";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/Card/Card";
import { Globe } from "lucide-react";

const UrlsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{t("Client.Tabs.Urls")}</CardTitle>
            <CardDescription>
              {t("Client.Tabs.UrlsDescription")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default UrlsTab;
