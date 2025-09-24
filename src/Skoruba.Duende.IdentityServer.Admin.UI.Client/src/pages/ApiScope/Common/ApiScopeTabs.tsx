import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import ApiScopeBasicsTab from "./Tabs/ApiScopeBasicsTab";
import ApiScopeClaimsTab from "./Tabs/ApiScopeClaimsTab";
import ApiScopeProperties from "./Tabs/ApiScopeProperties";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Info, User, Settings } from "lucide-react";

type ApiScopeTabsProps = {
  apiScopeDelete?: () => void;
};

const ApiScopeTabs: React.FC<ApiScopeTabsProps> = ({ apiScopeDelete }) => {
  const { t } = useTranslation();
  const { scopeId } = useParams<{ scopeId: string }>();

  return (
    <Tabs defaultValue="basics" className="w-full">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="basics" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t("ApiScope.Tabs.Basics")}
          </TabsTrigger>

          <TabsTrigger value="claims" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("ApiScope.Tabs.UserClaims")}
          </TabsTrigger>

          {scopeId && (
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("ApiScope.Tabs.Properties")}
            </TabsTrigger>
          )}
        </TabsList>

        <div className="inline-flex">
          {apiScopeDelete && (
            <Button
              variant="destructive"
              onClick={apiScopeDelete}
              type="button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("ApiScope.Actions.Delete")}
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="basics">
        <ApiScopeBasicsTab />
      </TabsContent>
      <TabsContent value="claims">
        <ApiScopeClaimsTab />
      </TabsContent>
      {scopeId && (
        <TabsContent value="properties">
          <ApiScopeProperties />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ApiScopeTabs;
