import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons/Icons";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../DropdownMenu/DropdownMenu";
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
} from "@/routing/Urls";
import { getConfigurationIssues } from "@/services/DashboardService";
import {
  Activity,
  Cog,
  Home,
  KeyRound,
  Laptop,
  Cable,
  ShieldCheck,
  Fingerprint,
  Users,
  Lock,
  FileLock2,
  LayoutGrid,
  Menu,
  Loader2,
} from "lucide-react";

import { ACCENTS } from "@/pages/Home/Home";

type Kind = keyof typeof ACCENTS;
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type NavItem = {
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

function isActive(item: NavItem, pathname: string) {
  if (item.activeBasePaths?.length) {
    return item.activeBasePaths.some(
      (base) => pathname === base || pathname.startsWith(base + "/")
    );
  }
  return pathname === item.href;
}

const clientsResourcesItems: NavItem[] = [
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

const identityItems: NavItem[] = [
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

const providersKeysItems: NavItem[] = [
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

const monitoringItems: NavItem[] = [
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
];

function NavDropdown({
  label,
  icon,
  children,
  badge,
}: {
  label: string;
  icon: JSX.Element;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const triggerClass = useMemo(
    () =>
      cn(
        "px-3",
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
        "data-[state=open]:bg-transparent data-[state=open]:shadow-none data-[state=open]:ring-0",
        "data-[state=open]:outline-none"
      ),
    []
  );

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) btnRef.current?.blur();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button ref={btnRef} variant="ghost" className={triggerClass}>
          {icon}
          <span className="ml-2">{label}</span>
          {badge && <span className="ml-2">{badge}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-3">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MainNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { data, isLoading } = getConfigurationIssues();

  const issuesCount = (data?.recommendations ?? 0) + (data?.warnings ?? 0);

  const renderDropdownItem = (item: NavItem, onAfterClick?: () => void) => {
    const accent = ACCENTS[item.kind];
    const Icon = item.icon;
    return (
      <DropdownMenuItem
        asChild
        key={item.translationKey}
        onSelect={onAfterClick}
      >
        <Link
          to={item.href}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive(item, location.pathname)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full",
              accent.bg,
              accent.ring
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", accent.text)} />
          </span>
          <span>{t(item.translationKey as any)}</span>
        </Link>
      </DropdownMenuItem>
    );
  };

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Link to="/" className="flex cursor-pointer items-center gap-2">
        <Icons.logo className="h-8 w-8" />
        <span className="sr-only">Home</span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        <NavDropdown
          label={t("Home.ClientsResourcesManagement")}
          icon={<LayoutGrid className="h-4 w-4" />}
        >
          <div className="grid min-w-[520px] grid-cols-2 gap-2">
            {clientsResourcesItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          label={t("Home.IdentityManagement")}
          icon={<ShieldCheck className="h-4 w-4" />}
        >
          <div className="grid min-w-[360px] grid-cols-1 gap-2">
            {identityItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          label={t("Home.ProvidersAndKeys")}
          icon={<ShieldCheck className="h-4 w-4" />}
        >
          <div className="grid min-w-[360px] grid-cols-1 gap-2">
            {providersKeysItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          label={t("Home.Monitoring")}
          icon={<Activity className="h-4 w-4" />}
          badge={
            <Badge variant="secondary">
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                issuesCount
              )}
            </Badge>
          }
        >
          <div className="grid min-w-[420px] grid-cols-1 gap-2">
            {renderDropdownItem(monitoringItems[0])}
            <DropdownMenuItem asChild>
              <Link
                to={ConfigurationIssuesUrl}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  location.pathname === ConfigurationIssuesUrl
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full",
                    ACCENTS.monitoring.bg,
                    ACCENTS.monitoring.ring
                  )}
                >
                  <Cog className={cn("h-3.5 w-3.5", ACCENTS.monitoring.text)} />
                </span>
                <span>{t("Home.ConfigurationIssues")}</span>
                <Badge variant="secondary" className="ml-2">
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    issuesCount
                  )}
                </Badge>
              </Link>
            </DropdownMenuItem>
          </div>
        </NavDropdown>
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

function MobileNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { data, isLoading } = getConfigurationIssues();
  const [open, setOpen] = useState(false);

  const issuesCount = (data?.recommendations ?? 0) + (data?.warnings ?? 0);

  const groups = [
    {
      title: t("Home.ClientsResourcesManagement"),
      icon: <LayoutGrid className="h-4 w-4" />,
      items: clientsResourcesItems,
    },
    {
      title: t("Home.IdentityManagement"),
      icon: <ShieldCheck className="h-4 w-4" />,
      items: identityItems,
    },
    {
      title: t("Home.ProvidersAndKeys"),
      icon: <ShieldCheck className="h-4 w-4" />,
      items: providersKeysItems,
    },
    {
      title: t("Home.Monitoring"),
      icon: <Activity className="h-4 w-4" />,
      items: monitoringItems,
    },
  ];

  const renderMobileLink = (it: NavItem) => {
    const accent = ACCENTS[it.kind];
    const Icon = it.icon;
    return (
      <Link
        key={it.translationKey}
        to={it.href}
        onClick={() => setOpen(false)}
        className={cn(
          "mx-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm",
          isActive(it, location.pathname)
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full",
            accent.bg,
            accent.ring
          )}
        >
          <Icon className={cn("h-3.5 w-3.5", accent.text)} />
        </span>
        <span>{t(it.translationKey as any)}</span>
        {it.href === ConfigurationIssuesUrl && (
          <Badge variant="secondary" className="ml-auto">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              issuesCount
            )}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] p-0">
        <SheetHeader className="px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6" />
              Skoruba Admin
            </SheetTitle>
            <ModeToggle />
          </div>
        </SheetHeader>
        <Separator />
        <div className="space-y-3 p-3">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm",
              location.pathname === "/"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="h-4 w-4" /> Home
          </Link>

          {groups.map((g) => (
            <div key={String(g.title)} className="space-y-1">
              <div className="flex items-center gap-2 px-3 text-xs uppercase text-muted-foreground">
                {g.icon}
                <span>{g.title}</span>
                {g.title.toLowerCase().includes("monitor") && (
                  <Badge variant="secondary" className="ml-2">
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      issuesCount
                    )}
                  </Badge>
                )}
              </div>
              <div className="grid gap-1">{g.items.map(renderMobileLink)}</div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
