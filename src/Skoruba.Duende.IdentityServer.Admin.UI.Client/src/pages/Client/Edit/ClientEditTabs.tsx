import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "i18next";
import { Copy, Trash2 } from "lucide-react";
import AdvancedSettingsTab from "./Tabs/AdvancedSettingsTab";
import BasicsTab from "./Tabs/BasicsTab";
import ResourcesTab from "./Tabs/ResourcesTab";
import SecretsTab from "./Tabs/SecretsTab";
import UrlsTab from "./Tabs/UrlsTab";
import { ClientCloneUrl } from "@/routing/Urls";
import { useParams } from "react-router-dom";

type ClientEditTabsProps = {
  onClientDelete: () => void;
};

const ClientEditTabs = ({ onClientDelete }: ClientEditTabsProps) => {
  const { clientId } = useParams<{ clientId: string }>();

  return (
    <Tabs defaultValue="basics">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="basics">{t("Client.Tabs.Basics")}</TabsTrigger>
          <TabsTrigger value="urls">{t("Client.Tabs.Urls")}</TabsTrigger>
          <TabsTrigger value="scopes">{t("Client.Tabs.Scopes")}</TabsTrigger>
          <TabsTrigger value="secrets">{t("Client.Tabs.Secrets")}</TabsTrigger>
          <TabsTrigger value="advanced_settings">
            {t("Client.Tabs.Advanced")}
          </TabsTrigger>
        </TabsList>

        <div className="inline-flex">
          <Button variant="outline" className="ms-1 me-1" asChild>
            <a
              href={ClientCloneUrl.replace(":clientId", clientId!)}
              target="_blank"
            >
              <Copy className="mr-2 h-4 w-4" />
              {t("Client.Tabs.CloneClient")}
            </a>
          </Button>
          <Button variant="destructive" onClick={onClientDelete} type="button">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("Client.Tabs.DeleteClient")}
          </Button>
        </div>
      </div>

      <TabsContent value="basics">
        <BasicsTab />
      </TabsContent>

      <TabsContent value="urls">
        <UrlsTab />
      </TabsContent>

      <TabsContent value="scopes">
        <ResourcesTab />
      </TabsContent>

      <TabsContent value="secrets">
        <SecretsTab />
      </TabsContent>

      <TabsContent value="advanced_settings">
        <AdvancedSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ClientEditTabs;
