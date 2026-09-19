import { useMemo } from "react";
import { Link } from "react-router-dom";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useTranslation } from "react-i18next";
import { KeyRound, LayoutGrid, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/Card/Card";
import { cn } from "@/lib/utils";
import { formatCompactAge } from "@/lib/dates/compactAge";
import {
  NavItem,
  clientsResourcesItems,
  identityItems,
  providersKeysItems,
} from "@/components/MainNav/navItems";
import {
  ApiResourceCreateUrl,
  ApiResourcesUrl,
  ApiScopeCreateUrl,
  ApiScopesUrl,
  ClientsUrl,
  IdentityProviderCreateUrl,
  IdentityProvidersUrl,
  IdentityResourceCreateUrl,
  IdentityResourcesUrl,
  KeysUrl,
  RoleCreateUrl,
  RolesUrl,
  UserCreateUrl,
  UsersUrl,
} from "@/routing/Urls";
import { getAttentionByResourceType } from "@/lib/configurationIssues/issueInsights";
import {
  useConfigurationIssues,
  useDashboardIdentity,
  useDashboardIdentityServer,
  useDashboardKeys,
} from "@/services/DashboardService";
import DashboardCardHeader, { DashboardCardTone } from "./DashboardCardHeader";
import StatTile, { StatTileContext } from "./StatTile";
import { getDashboardErrorKey } from "./dashboardErrors";

type Stat = { value?: number; isLoading: boolean; context?: StatTileContext };

const quickActionClass =
  "inline-flex max-w-full items-center gap-1 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// The plus icon already says "new", so the visible text is just the noun
// ("+ Identity resource"); the full phrase stays as the accessible name.
const QuickLink = ({
  to,
  label,
  name,
}: {
  to: string;
  label: string;
  name: string;
}) => (
  <Link to={to} className={quickActionClass} title={name} aria-label={name}>
    <Plus className="h-3.5 w-3.5 shrink-0" />
    <span className="truncate">{label}</span>
  </Link>
);

type SectionCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  tone: DashboardCardTone;
  title: string;
  description: string;
  items: NavItem[];
  stats: Record<string, Stat>;
  columns: string;
  /** One action per tile, in tile order - rendered in the tiles' own grid. */
  actions: React.ReactNode[];
  /** Failed counts query: the tiles still navigate, the header says why they are empty. */
  error?: unknown;
  className?: string;
};

const SectionCard = ({
  icon,
  tone,
  title,
  description,
  items,
  stats,
  columns,
  actions,
  error,
  className,
}: SectionCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className={cn("flex h-full min-w-0 flex-col", className)}>
      <DashboardCardHeader
        icon={icon}
        tone={tone}
        title={title}
        description={error ? t(getDashboardErrorKey(error)) : description}
        descriptionClassName={
          error ? "text-amber-700 dark:text-amber-400" : undefined
        }
      />
      <CardContent className={cn("grid flex-1 gap-3 px-5 pb-4", columns)}>
        {items.map((item) => (
          <StatTile
            key={item.href}
            item={item}
            label={String(t(item.translationKey as never))}
            value={stats[item.href]?.value}
            isLoading={stats[item.href]?.isLoading ?? false}
            context={stats[item.href]?.context}
          />
        ))}
      </CardContent>
      {/* Same grid as the tiles; the inset matches the tile's border + padding,
          so every action sits under its tile, on the tile's text axis. */}
      <div
        className={cn(
          "grid min-h-[44px] items-center gap-x-3 gap-y-2 border-t px-5 py-3",
          columns,
        )}
      >
        {actions.map((action, index) => (
          <div key={index} className="flex min-w-0 pl-[15px]">
            {action}
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ClientsResourcesCard = ({
  onNewClient,
  className,
}: {
  onNewClient: () => void;
  className?: string;
}) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboardIdentityServer();
  const totals = data?.identityServerData;
  const issues = useConfigurationIssues();

  const attention = useMemo(
    () => getAttentionByResourceType(issues.data ?? []),
    [issues.data],
  );

  // "3 need attention" / "No issues" from the configuration rules engine
  const contextFor = (
    resourceType: client.ConfigurationResourceType,
  ): StatTileContext | undefined => {
    if (!issues.data) return undefined;

    const entry = attention[resourceType];
    if (!entry) return { label: t("Home.Sections.NoIssues"), tone: "ok" };

    return {
      label: t("Home.Sections.NeedAttention", { count: entry.resources }),
      tone: entry.hasErrors ? "danger" : "warning",
    };
  };

  return (
    <SectionCard
      className={className}
      icon={LayoutGrid}
      tone="indigo"
      error={error}
      title={t("Home.ClientsResourcesManagement")}
      description={t("Home.Sections.ClientsResourcesDescription")}
      items={clientsResourcesItems}
      columns="grid-cols-2 xl:grid-cols-4"
      stats={{
        [ClientsUrl]: {
          value: totals?.clientsTotal,
          isLoading,
          context: contextFor(client.ConfigurationResourceType.Client),
        },
        [ApiResourcesUrl]: {
          value: totals?.apiResourcesTotal,
          isLoading,
          context: contextFor(client.ConfigurationResourceType.ApiResource),
        },
        [ApiScopesUrl]: {
          value: totals?.apiScopesTotal,
          isLoading,
          context: contextFor(client.ConfigurationResourceType.ApiScope),
        },
        [IdentityResourcesUrl]: {
          value: totals?.identityResourcesTotal,
          isLoading,
          context: contextFor(client.ConfigurationResourceType.IdentityResource),
        },
      }}
      actions={[
        <button
          key="client"
          type="button"
          onClick={onNewClient}
          className={quickActionClass}
          title={t("QuickActions.NewClient")}
          aria-label={t("QuickActions.NewClient")}
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t("QuickActions.Short.Client")}</span>
        </button>,
        <QuickLink
          key="api-resource"
          to={ApiResourceCreateUrl}
          label={t("QuickActions.Short.ApiResource")}
          name={t("QuickActions.NewApiResource")}
        />,
        <QuickLink
          key="api-scope"
          to={ApiScopeCreateUrl}
          label={t("QuickActions.Short.ApiScope")}
          name={t("QuickActions.NewApiScope")}
        />,
        <QuickLink
          key="identity-resource"
          to={IdentityResourceCreateUrl}
          label={t("QuickActions.Short.IdentityResource")}
          name={t("QuickActions.NewIdentityResource")}
        />,
      ]}
    />
  );
};

export const IdentityCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useDashboardIdentity();

  return (
    <SectionCard
      className={className}
      icon={Users}
      tone="success"
      error={error}
      title={t("Home.IdentityManagement")}
      description={t("Home.Sections.IdentityDescription")}
      items={identityItems}
      columns="grid-cols-2"
      stats={{
        [UsersUrl]: { value: data?.usersTotal, isLoading },
        [RolesUrl]: { value: data?.rolesTotal, isLoading },
      }}
      actions={[
        <QuickLink
          key="user"
          to={UserCreateUrl}
          label={t("QuickActions.Short.User")}
          name={t("QuickActions.NewUser")}
        />,
        <QuickLink
          key="role"
          to={RoleCreateUrl}
          label={t("QuickActions.Short.Role")}
          name={t("QuickActions.NewRole")}
        />,
      ]}
    />
  );
};

export const ProvidersKeysCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const identityServer = useDashboardIdentityServer();
  const keys = useDashboardKeys();
  const newestKey = keys.data?.keys[0];

  return (
    <SectionCard
      className={className}
      icon={KeyRound}
      tone="warning"
      error={identityServer.error ?? keys.error}
      title={t("Home.ProvidersAndKeys")}
      description={t("Home.Sections.ProvidersKeysDescription")}
      items={providersKeysItems}
      columns="grid-cols-2"
      stats={{
        [IdentityProvidersUrl]: {
          value: identityServer.data?.identityServerData.identityProvidersTotal,
          isLoading: identityServer.isLoading,
        },
        [KeysUrl]: { value: keys.data?.totalCount, isLoading: keys.isLoading },
      }}
      actions={[
        <QuickLink
          key="identity-provider"
          to={IdentityProviderCreateUrl}
          label={t("QuickActions.Short.IdentityProvider")}
          name={t("QuickActions.NewIdentityProvider")}
        />,
        newestKey ? (
          <Link
            key="newest-key"
            to={KeysUrl}
            title={`${t("Home.Sections.NewestKey")}: ${newestKey.created.toLocaleString()}`}
            className={cn(quickActionClass, "gap-1.5 font-normal")}
          >
            <span className="shrink-0 font-mono font-medium text-foreground/80">
              {newestKey.algorithm}
            </span>
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
            <span className="truncate">
              <span className="hidden 2xl:inline">
                {t("Home.Sections.NewestKey")}{" "}
              </span>
              {t("Home.Sections.Ago", {
                age: formatCompactAge(newestKey.created),
              })}
            </span>
          </Link>
        ) : null,
      ]}
    />
  );
};
