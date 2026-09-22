import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { ConfigurationIssuesUrl } from "@/routing/Urls";
import { useConfigurationIssuesSummary } from "@/services/DashboardService";
import { useAuth } from "@/contexts/AuthContext";
import { getIssuesTotal } from "@/lib/configurationIssues/issueInsights";
import {
  Activity,
  Cog,
  Home,
  KeyRound,
  ShieldCheck,
  Users,
  LayoutGrid,
  Menu,
  Loader2,
} from "lucide-react";

import { ACCENTS } from "@/lib/accents";
import {
  NavItem,
  clientsResourcesItems,
  identityItems,
  providersKeysItems,
  monitoringItems,
} from "./navItems";

function isActive(item: NavItem, pathname: string) {
  if (item.activeBasePaths?.length) {
    return item.activeBasePaths.some(
      (base) => pathname === base || pathname.startsWith(base + "/")
    );
  }
  return pathname === item.href;
}

function NavDropdown({
  label,
  icon,
  children,
  badge,
  active = false,
}: {
  label: string;
  icon: JSX.Element;
  children: React.ReactNode;
  badge?: React.ReactNode;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const triggerClass = useMemo(
    () =>
      cn(
        "px-3",
        "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
        "data-[state=open]:bg-transparent data-[state=open]:shadow-none data-[state=open]:ring-0",
        "data-[state=open]:outline-none",
        // Current section: primary tint plus an underline sitting on the header border
        active &&
          "relative bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary after:absolute after:inset-x-3 after:-bottom-3 after:h-0.5 after:rounded-full after:bg-primary"
      ),
    [active]
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
        <Button
          ref={btnRef}
          variant="ghost"
          className={triggerClass}
          aria-current={active ? "page" : undefined}
        >
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
  const translate = useCallback(
    (key: string) => String(t(key as never)),
    [t]
  );
  // The header renders before ProtectedRoute. Querying a protected API without a
  // session answers 401, and the global query error handler would then redirect
  // to /unauthorized while the login flow is still running.
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useConfigurationIssuesSummary({
    enabled: isAuthenticated,
  });

  const issuesCount = getIssuesTotal(data);
  // Without a session the count is unknown - show nothing rather than "0".
  const showIssuesBadge = isLoading || data !== undefined;

  const isGroupActive = (items: NavItem[]) =>
    items.some((item) => isActive(item, location.pathname));

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
          <span>{translate(item.translationKey)}</span>
        </Link>
      </DropdownMenuItem>
    );
  };

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <Link to="/" className="flex cursor-pointer items-center gap-2">
        <Icons.logo className="h-8 w-8" />
        <span className="sr-only">{t("Common.Home")}</span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        <NavDropdown
          active={isGroupActive(clientsResourcesItems)}
          label={t("Home.ClientsResourcesManagement")}
          icon={<LayoutGrid className="h-4 w-4" />}
        >
          <div className="grid min-w-[520px] grid-cols-2 gap-2">
            {clientsResourcesItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          active={isGroupActive(identityItems)}
          label={t("Home.IdentityManagement")}
          icon={<Users className="h-4 w-4" />}
        >
          <div className="grid min-w-[360px] grid-cols-1 gap-2">
            {identityItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          active={isGroupActive(providersKeysItems)}
          label={t("Home.ProvidersAndKeys")}
          icon={<KeyRound className="h-4 w-4" />}
        >
          <div className="grid min-w-[360px] grid-cols-1 gap-2">
            {providersKeysItems.map((it) => renderDropdownItem(it))}
          </div>
        </NavDropdown>

        <NavDropdown
          active={isGroupActive(monitoringItems)}
          label={t("Home.Monitoring")}
          icon={<Activity className="h-4 w-4" />}
          badge={
            showIssuesBadge && (
              <Badge variant="secondary">
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  issuesCount
                )}
              </Badge>
            )
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
                {showIssuesBadge && (
                  <Badge variant="secondary" className="ml-2">
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      issuesCount
                    )}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            {renderDropdownItem(monitoringItems[2])}
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
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useConfigurationIssuesSummary({
    enabled: isAuthenticated,
  });
  const [open, setOpen] = useState(false);
  const translate = useCallback(
    (key: string) => String(t(key as never)),
    [t]
  );

  const issuesCount = getIssuesTotal(data);
  const showIssuesBadge = isLoading || data !== undefined;

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
        <span>{translate(it.translationKey)}</span>
        {it.href === ConfigurationIssuesUrl && showIssuesBadge && (
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
          <span className="sr-only">{t("Common.Menu")}</span>
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
                {showIssuesBadge &&
                  String(g.title).toLowerCase().includes("monitor") && (
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
