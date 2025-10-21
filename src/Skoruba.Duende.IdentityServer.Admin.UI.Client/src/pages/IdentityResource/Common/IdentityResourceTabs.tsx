import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdentityResourceBasicsTab from "./Tabs/IdentityResourceBasicsTab";
import IdentityResourceClaimsTab from "./Tabs/IdentityResourceClaimsTab";
import IdentityResourcePropertiesTab from "./Tabs/IdentityResourcePropertiesTab";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Info, User, Settings } from "lucide-react";

type IdentityResourceTabsProps = {
  onIdentityResourceDelete?: () => void;
};

const IdentityResourceTabs: React.FC<IdentityResourceTabsProps> = ({
  onIdentityResourceDelete,
}) => {
  const { t } = useTranslation();
  const { resourceId } = useParams<{ resourceId: string }>();

  return (
    <Tabs defaultValue="basics" className="w-full">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="basics" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t("IdentityResource.Tabs.Basics")}
          </TabsTrigger>

          <TabsTrigger value="claims" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t("IdentityResource.Tabs.UserClaims")}
          </TabsTrigger>

          {resourceId && (
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t("IdentityResource.Tabs.Properties")}
            </TabsTrigger>
          )}
        </TabsList>

        <div className="inline-flex">
          {onIdentityResourceDelete && (
            <Button
              variant="destructive"
              onClick={onIdentityResourceDelete}
              type="button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("IdentityResource.Actions.Delete")}
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="basics">
        <IdentityResourceBasicsTab />
      </TabsContent>
      <TabsContent value="claims">
        <IdentityResourceClaimsTab />
      </TabsContent>
      {resourceId && (
        <TabsContent value="properties">
          <IdentityResourcePropertiesTab />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default IdentityResourceTabs;
