import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicsTab from "./Tabs/BasicsTab";
import SecretsTab from "./Tabs/SecretsTab";
import PropertiesTab from "./Tabs/PropertiesTab";
import ScopesTab from "./Tabs/ScopeTab";
import UserClaimsTab from "./Tabs/UserClaimsTab";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Info, Key, Shield, User, Settings } from "lucide-react";

type ApiResourceTabsProps = {
  onApiResourceDelete?: () => void;
};

const ApiResourceTabs: React.FC<ApiResourceTabsProps> = ({
  onApiResourceDelete,
}) => {
  const { t } = useTranslation();
  const { resourceId } = useParams<{ resourceId: string }>();

  return (
    <Tabs defaultValue="basics">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="basics" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t("ApiResource.Tabs.Basics")}
          </TabsTrigger>

          {resourceId && (
            <TabsTrigger value="secrets" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("ApiResource.Tabs.Secrets")}
            </TabsTrigger>
          )}

          <TabsTrigger value="scopes" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("ApiResource.Tabs.Scopes")}
          </TabsTrigger>

          <TabsTrigger value="userClaims" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("ApiResource.Tabs.UserClaims")}
          </TabsTrigger>

          {resourceId && (
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("ApiResource.Tabs.Properties")}
            </TabsTrigger>
          )}
        </TabsList>

        <div className="inline-flex">
          {onApiResourceDelete && (
            <Button
              variant="destructive"
              onClick={onApiResourceDelete}
              type="button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("ApiResource.Actions.Delete")}
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="basics">
        <BasicsTab />
      </TabsContent>
      <TabsContent value="secrets">
        <SecretsTab />
      </TabsContent>
      <TabsContent value="properties">
        <PropertiesTab />
      </TabsContent>
      <TabsContent value="scopes">
        <ScopesTab />
      </TabsContent>
      <TabsContent value="userClaims">
        <UserClaimsTab />
      </TabsContent>
    </Tabs>
  );
};

export default ApiResourceTabs;
