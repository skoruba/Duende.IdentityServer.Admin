import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";
import { ReactNode, useState } from "react";

export type SettingsTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
  /** Defaults to true - set it to false to leave the tab out entirely. */
  isVisible?: boolean;
};

type SettingsTabsProps = {
  tabs: SettingsTab[];
  /** Rendered on the opposite side of the tab list. */
  actions?: ReactNode;
};

export const SettingsTabs = ({ tabs, actions }: SettingsTabsProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const visibleTabs = tabs.filter((tab) => tab.isVisible !== false);

  if (visibleTabs.length === 0) {
    return null;
  }

  const active =
    selected && visibleTabs.some((tab) => tab.value === selected)
      ? selected
      : visibleTabs[0].value;

  return (
    <Tabs value={active} onValueChange={setSelected}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          {visibleTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {actions}
      </div>

      {visibleTabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
