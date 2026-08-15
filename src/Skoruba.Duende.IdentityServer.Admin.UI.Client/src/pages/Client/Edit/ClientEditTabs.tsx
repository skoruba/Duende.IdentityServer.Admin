import { SettingsTabs } from "@/components/SettingsTabs/SettingsTabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ClientCapabilitiesProvider,
  useClientCapabilities,
  useClientCapabilitiesOverride,
} from "@/contexts/ClientCapabilitiesContext";
import { t } from "i18next";
import {
  Code2,
  Copy,
  Globe,
  Key,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import AdvancedSettingsTab from "./Tabs/AdvancedSettingsTab";
import BasicsTab from "./Tabs/BasicsTab";
import IntegrationTab from "./Tabs/IntegrationTab";
import ResourcesTab from "./Tabs/ResourcesTab";
import SecretsTab from "./Tabs/SecretsTab";
import UrlsTab from "./Tabs/UrlsTab";
import { ClientCloneUrl } from "@/routing/Urls";
import { useParams } from "react-router-dom";

type ClientEditTabsProps = {
  onClientDelete: () => void;
};

/** Lets the user bring back the settings the grant types hide. */
const ShowAllSettingsToggle = () => {
  const { hasHiddenSettings, isShowingAllSettings, setShowAllSettings } =
    useClientCapabilitiesOverride();

  if (!hasHiddenSettings) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 me-2">
      <Switch
        id="show-all-settings"
        checked={isShowingAllSettings}
        onCheckedChange={setShowAllSettings}
      />
      <Label
        htmlFor="show-all-settings"
        className="cursor-pointer text-xs font-normal text-muted-foreground"
      >
        {t("Client.Tabs.ShowAllSettings")}
      </Label>
    </div>
  );
};

const ClientEditTabsContent = ({ onClientDelete }: ClientEditTabsProps) => {
  const { clientId } = useParams<{ clientId: string }>();
  const capabilities = useClientCapabilities();

  return (
    <SettingsTabs
      tabs={[
        {
          value: "basics",
          label: t("Client.Tabs.Basics"),
          icon: Settings,
          content: <BasicsTab />,
        },
        {
          value: "urls",
          label: t("Client.Tabs.Urls"),
          icon: Globe,
          content: <UrlsTab />,
          isVisible: capabilities.usesBrowserFlow,
        },
        {
          value: "scopes",
          label: t("Client.Tabs.Scopes"),
          icon: ShieldCheck,
          content: <ResourcesTab />,
        },
        {
          value: "secrets",
          label: t("Client.Tabs.Secrets"),
          icon: Key,
          content: <SecretsTab />,
        },
        {
          value: "advanced_settings",
          label: t("Client.Tabs.Advanced"),
          icon: SlidersHorizontal,
          content: <AdvancedSettingsTab />,
        },
        {
          value: "integration",
          label: t("Client.Tabs.Integration"),
          icon: Code2,
          content: <IntegrationTab />,
        },
      ]}
      actions={
        <div className="inline-flex items-center">
          <ShowAllSettingsToggle />

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
      }
    />
  );
};

const ClientEditTabs = (props: ClientEditTabsProps) => (
  <ClientCapabilitiesProvider>
    <ClientEditTabsContent {...props} />
  </ClientCapabilitiesProvider>
);

export default ClientEditTabs;
