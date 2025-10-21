import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons/Icons";
import { Link, useLocation } from "react-router-dom";
import { ConfigurationIssuesUrl } from "@/routing/Urls";
import { Badge } from "../ui/badge";
import { getConfigurationIssues } from "@/services/DashboardService";
import Loading from "../Loading/Loading";
import { useTranslation } from "react-i18next";
import {
  ClientsUrl,
  ClientEditUrl,
  ClientCloneUrl,
  ApiResourcesUrl,
  ApiResourceEditUrl,
  ApiResourceCreateUrl,
  ApiScopesUrl,
  ApiScopeEditUrl,
  ApiScopeCreateUrl,
  IdentityResourcesUrl,
  IdentityResourceEditUrl,
  IdentityResourceCreateUrl,
  UsersUrl,
  UserEditUrl,
  UserCreateUrl,
  RolesUrl,
  RoleEditUrl,
  RoleCreateUrl,
  IdentityProvidersUrl,
  IdentityProviderEditUrl,
  IdentityProviderCreateUrl,
  KeysUrl,
  AuditLogsUrl,
} from "@/routing/Urls";

export interface NavItem {
  translationKey: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  activeBasePaths?: string[];
}

function getBasePath(route: string) {
  const idx = route.indexOf("/:");
  return idx === -1 ? route : route.slice(0, idx);
}

function isActive(item: NavItem, pathname: string) {
  if (item.activeBasePaths && item.activeBasePaths.length > 0) {
    return item.activeBasePaths.some(
      (base) => pathname === base || pathname.startsWith(base + "/")
    );
  }
  return pathname === item.href;
}

const navItems: NavItem[] = [
  {
    translationKey: "Home.Clients",
    href: ClientsUrl,
    activeBasePaths: [
      ClientsUrl,
      getBasePath(ClientEditUrl),
      getBasePath(ClientCloneUrl),
    ],
  },
  {
    translationKey: "Home.ApiResources",
    href: ApiResourcesUrl,
    activeBasePaths: [
      ApiResourcesUrl,
      getBasePath(ApiResourceEditUrl),
      getBasePath(ApiResourceCreateUrl),
    ],
  },
  {
    translationKey: "Home.ApiScopes",
    href: ApiScopesUrl,
    activeBasePaths: [
      ApiScopesUrl,
      getBasePath(ApiScopeEditUrl),
      getBasePath(ApiScopeCreateUrl),
    ],
  },
  {
    translationKey: "Home.IdentityResources",
    href: IdentityResourcesUrl,
    activeBasePaths: [
      IdentityResourcesUrl,
      getBasePath(IdentityResourceEditUrl),
      getBasePath(IdentityResourceCreateUrl),
    ],
  },
  {
    translationKey: "Home.Users",
    href: UsersUrl,
    activeBasePaths: [
      UsersUrl,
      getBasePath(UserEditUrl),
      getBasePath(UserCreateUrl),
    ],
  },
  {
    translationKey: "Home.Roles",
    href: RolesUrl,
    activeBasePaths: [
      RolesUrl,
      getBasePath(RoleEditUrl),
      getBasePath(RoleCreateUrl),
    ],
  },
  {
    translationKey: "Home.IdentityProviders",
    href: IdentityProvidersUrl,
    activeBasePaths: [
      IdentityProvidersUrl,
      getBasePath(IdentityProviderEditUrl),
      getBasePath(IdentityProviderCreateUrl),
    ],
  },
  {
    translationKey: "Home.Keys",
    href: KeysUrl,
    activeBasePaths: [KeysUrl],
  },
  {
    translationKey: "Home.AuditLogs",
    href: AuditLogsUrl,
    activeBasePaths: [AuditLogsUrl],
  },
];

export function MainNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { data, isLoading } = getConfigurationIssues();

  return (
    <div className="flex gap-2 md:gap-4">
      <Link to="/" className="flex items-center space-x-2">
        <Icons.logo className="h-8 w-8" />
      </Link>
      {navItems.length ? (
        <nav className="flex gap-6">
          <>
            {navItems.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    to={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium",
                      item.disabled && "cursor-not-allowed opacity-80",
                      {
                        "text-foreground": isActive(item, location.pathname),
                        "text-muted-foreground": !isActive(
                          item,
                          location.pathname
                        ),
                      }
                    )}
                  >
                    {t(item.translationKey as any)}
                  </Link>
                )
            )}
            {isLoading ? (
              <Loading size="sm" />
            ) : (
              <Link
                key="issues"
                to={ConfigurationIssuesUrl}
                className={cn("flex items-center text-sm font-medium", {
                  "text-foreground":
                    location.pathname === ConfigurationIssuesUrl,
                  "text-muted-foreground":
                    location.pathname !== ConfigurationIssuesUrl,
                })}
              >
                {t("Home.ConfigurationIssues")}{" "}
                <Badge variant="secondary" className="ml-2">
                  {(data?.recommendations ?? 0) + (data?.warnings ?? 0)}
                </Badge>
              </Link>
            )}
          </>
        </nav>
      ) : null}
    </div>
  );
}
