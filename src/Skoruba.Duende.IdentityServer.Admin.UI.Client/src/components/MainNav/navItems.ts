import {
  Activity,
  Cable,
  Cog,
  FileLock2,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
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
  ConfigurationIssuesUrl,
  ConfigurationRulesUrl,
} from "@/routing/Urls";
import { ACCENTS } from "@/lib/accents";

export type Kind = keyof typeof ACCENTS;
export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export type NavItem = {
  translationKey: string;
  href: string;
  activeBasePaths?: string[];
  icon: IconType;
  kind: Kind;
};

function getBasePath(route: string) {
  const idx = route.indexOf("/:");
  return idx === -1 ? route : route.slice(0, idx);
}

export const clientsResourcesItems: NavItem[] = [
  {
    translationKey: "Home.Clients",
    href: ClientsUrl,
    activeBasePaths: [
      ClientsUrl,
      getBasePath(ClientEditUrl),
      getBasePath(ClientCloneUrl),
    ],
    icon: Laptop,
    kind: "management",
  },
  {
    translationKey: "Home.ApiResources",
    href: ApiResourcesUrl,
    activeBasePaths: [
      ApiResourcesUrl,
      getBasePath(ApiResourceEditUrl),
      getBasePath(ApiResourceCreateUrl),
    ],
    icon: Cable,
    kind: "management",
  },
  {
    translationKey: "Home.ApiScopes",
    href: ApiScopesUrl,
    activeBasePaths: [
      ApiScopesUrl,
      getBasePath(ApiScopeEditUrl),
      getBasePath(ApiScopeCreateUrl),
    ],
    icon: ShieldCheck,
    kind: "management",
  },
  {
    translationKey: "Home.IdentityResources",
    href: IdentityResourcesUrl,
    activeBasePaths: [
      IdentityResourcesUrl,
      getBasePath(IdentityResourceEditUrl),
      getBasePath(IdentityResourceCreateUrl),
    ],
    icon: Fingerprint,
    kind: "management",
  },
];

export const identityItems: NavItem[] = [
  {
    translationKey: "Home.Users",
    href: UsersUrl,
    activeBasePaths: [
      UsersUrl,
      getBasePath(UserEditUrl),
      getBasePath(UserCreateUrl),
    ],
    icon: Users,
    kind: "identity",
  },
  {
    translationKey: "Home.Roles",
    href: RolesUrl,
    activeBasePaths: [
      RolesUrl,
      getBasePath(RoleEditUrl),
      getBasePath(RoleCreateUrl),
    ],
    icon: Lock,
    kind: "identity",
  },
];

export const providersKeysItems: NavItem[] = [
  {
    translationKey: "Home.IdentityProviders",
    href: IdentityProvidersUrl,
    activeBasePaths: [
      IdentityProvidersUrl,
      getBasePath(IdentityProviderEditUrl),
      getBasePath(IdentityProviderCreateUrl),
    ],
    icon: KeyRound,
    kind: "providers",
  },
  {
    translationKey: "Home.Keys",
    href: KeysUrl,
    activeBasePaths: [KeysUrl],
    icon: FileLock2,
    kind: "providers",
  },
];

export const monitoringItems: NavItem[] = [
  {
    translationKey: "Home.AuditLogs",
    href: AuditLogsUrl,
    activeBasePaths: [AuditLogsUrl],
    icon: Activity,
    kind: "monitoring",
  },
  {
    translationKey: "Home.ConfigurationIssues",
    href: ConfigurationIssuesUrl,
    activeBasePaths: [ConfigurationIssuesUrl],
    icon: Cog,
    kind: "monitoring",
  },
  {
    translationKey: "Home.ConfigurationRules",
    href: ConfigurationRulesUrl,
    activeBasePaths: [ConfigurationRulesUrl],
    icon: Settings,
    kind: "monitoring",
  },
];
