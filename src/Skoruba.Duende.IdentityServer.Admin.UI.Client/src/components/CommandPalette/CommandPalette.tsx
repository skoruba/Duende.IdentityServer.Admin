import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Cable,
  Home,
  Laptop,
  Loader2,
  PlusCircle,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  clientsResourcesItems,
  identityItems,
  providersKeysItems,
  monitoringItems,
  IconType,
} from "@/components/MainNav/navItems";
import {
  ApiResourceCreateUrl,
  ApiResourceEditUrl,
  ApiScopeCreateUrl,
  ApiScopeEditUrl,
  ClientEditUrl,
  ClientsUrl,
  HomeUrl,
  IdentityProviderCreateUrl,
  IdentityResourceCreateUrl,
  RoleCreateUrl,
  UserCreateUrl,
  UserEditUrl,
} from "@/routing/Urls";
import { getClients } from "@/services/ClientServices";
import { getUsers } from "@/services/UserServices";
import { getApiResources } from "@/services/ApiResourceServices";
import { getApiScopes } from "@/services/ApiScopeServices";
import { queryKeys } from "@/services/QueryKeys";
import { OPEN_NEW_CLIENT_STATE } from "./commandPaletteState";

const MIN_SEARCH_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 250;
const SEARCH_PAGE_SIZE = 5;

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  icon: IconType;
  onSelect: () => void;
};

// Apple keyboards get "⌘K", everything else (Windows, Linux) "Ctrl K".
// navigator.platform is deprecated, so the UA client hints are preferred.
const isMac = () => {
  if (typeof navigator === "undefined") return false;

  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform;

  return /Mac|iPhone|iPad|iOS/i.test(platform);
};

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};

export function CommandPalette() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  const translate = useCallback((key: string) => String(t(key as never)), [t]);

  const searchTerm = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const searchEnabled = open && searchTerm.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const go = useCallback(
    (to: string, state?: unknown) => {
      setOpen(false);
      setQuery("");
      navigate(to, { state });
    },
    [navigate],
  );

  const search = useQuery({
    queryKey: [queryKeys.commandPaletteSearch, searchTerm],
    enabled: searchEnabled,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      // A missing permission on one resource must not hide the other results.
      const [clients, users, apiResources, apiScopes] = await Promise.allSettled(
        [
          getClients(searchTerm, 0, SEARCH_PAGE_SIZE),
          getUsers(searchTerm, 0, SEARCH_PAGE_SIZE),
          getApiResources(searchTerm, 0, SEARCH_PAGE_SIZE),
          getApiScopes(searchTerm, 0, SEARCH_PAGE_SIZE),
        ],
      );

      return {
        clients: clients.status === "fulfilled" ? clients.value.items : [],
        users: users.status === "fulfilled" ? users.value.items : [],
        apiResources:
          apiResources.status === "fulfilled" ? apiResources.value.items : [],
        apiScopes: apiScopes.status === "fulfilled" ? apiScopes.value.items : [],
      };
    },
  });

  const actions: PaletteItem[] = useMemo(
    () => [
      {
        id: "new-client",
        label: t("Clients.AddNewClient"),
        icon: PlusCircle,
        onSelect: () => go(ClientsUrl, OPEN_NEW_CLIENT_STATE),
      },
      ...[
        ["QuickActions.NewApiResource", ApiResourceCreateUrl],
        ["QuickActions.NewApiScope", ApiScopeCreateUrl],
        ["QuickActions.NewIdentityResource", IdentityResourceCreateUrl],
        ["QuickActions.NewUser", UserCreateUrl],
        ["QuickActions.NewRole", RoleCreateUrl],
        ["QuickActions.NewIdentityProvider", IdentityProviderCreateUrl],
      ].map(([key, url]) => ({
        id: key,
        label: translate(key),
        icon: PlusCircle,
        onSelect: () => go(url),
      })),
    ],
    [t, translate, go],
  );

  const pages: PaletteItem[] = useMemo(
    () => [
      {
        id: HomeUrl,
        label: t("CommandPalette.Dashboard"),
        icon: Home,
        onSelect: () => go(HomeUrl),
      },
      ...[
        ...clientsResourcesItems,
        ...identityItems,
        ...providersKeysItems,
        ...monitoringItems,
      ].map((item) => ({
        id: item.href,
        label: translate(item.translationKey),
        icon: item.icon,
        onSelect: () => go(item.href),
      })),
    ],
    [t, translate, go],
  );

  const matches = (item: PaletteItem) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase());

  const visibleActions = actions.filter(matches);
  const visiblePages = pages.filter(matches);

  const resultGroups: Array<{ heading: string; items: PaletteItem[] }> =
    searchEnabled && search.data
      ? [
          {
            heading: t("Home.Clients"),
            items: search.data.clients.map((c) => ({
              id: `client-${c.id}`,
              label: c.clientName || c.clientId,
              hint: c.clientId,
              icon: Laptop,
              onSelect: () =>
                go(ClientEditUrl.replace(":clientId", String(c.id))),
            })),
          },
          {
            heading: t("Home.Users"),
            items: search.data.users.map((u) => ({
              id: `user-${u.id}`,
              label: u.userName,
              hint: u.email,
              icon: Users,
              onSelect: () => go(UserEditUrl.replace(":userId", u.id)),
            })),
          },
          {
            heading: t("Home.ApiResources"),
            items: search.data.apiResources.map((r) => ({
              id: `api-resource-${r.id}`,
              label: r.apiResourceName ?? "",
              icon: Cable,
              onSelect: () =>
                go(ApiResourceEditUrl.replace(":resourceId", String(r.id))),
            })),
          },
          {
            heading: t("Home.ApiScopes"),
            items: search.data.apiScopes.map((s) => ({
              id: `api-scope-${s.id}`,
              label: s.name,
              hint: s.displayName,
              icon: ShieldCheck,
              onSelect: () =>
                go(ApiScopeEditUrl.replace(":scopeId", String(s.id))),
            })),
          },
        ].filter((group) => group.items.length > 0)
      : [];

  const isSearching =
    searchEnabled && (search.isFetching || searchTerm !== query.trim());
  const hasResults =
    visibleActions.length + visiblePages.length + resultGroups.length > 0;

  // Filtering is done here (shouldFilter={false}), so cmdk does not re-select
  // the first row when async results arrive - keep the selection on top.
  const firstVisibleId =
    resultGroups[0]?.items[0]?.id ??
    visibleActions[0]?.id ??
    visiblePages[0]?.id ??
    "";

  useEffect(() => {
    setSelected(firstVisibleId);
  }, [firstVisibleId, open]);

  const renderItem = (item: PaletteItem) => {
    const Icon = item.icon;
    return (
      <CommandItem
        key={item.id}
        value={item.id}
        onSelect={item.onSelect}
        className="cursor-pointer gap-3"
      >
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{item.label}</span>
        {item.hint && item.hint !== item.label && (
          <span className="ml-auto truncate pl-4 text-xs text-muted-foreground">
            {item.hint}
          </span>
        )}
      </CommandItem>
    );
  };

  const shortcut = isMac() ? "⌘K" : "Ctrl K";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-52 justify-start gap-2 bg-transparent px-3 text-sm font-normal text-muted-foreground xl:flex"
      >
        <Search className="h-4 w-4" />
        <span>{t("CommandPalette.Trigger")}</span>
        <kbd className="pointer-events-none ml-auto rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          {shortcut}
        </kbd>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="bg-transparent xl:hidden"
        title={`${t("CommandPalette.Trigger")} (${shortcut})`}
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">{t("CommandPalette.Trigger")}</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          onInteractOutside={() => undefined}
          className="top-[20%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 data-[state=closed]:slide-out-to-top-[18%] data-[state=open]:slide-in-from-top-[18%] [&>button]:hidden"
        >
          <DialogTitle className="sr-only">
            {t("CommandPalette.Title")}
          </DialogTitle>
          <Command
            shouldFilter={false}
            loop
            value={selected}
            onValueChange={setSelected}
          >
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t("CommandPalette.Placeholder")}
            />
            <CommandList className="max-h-[420px]">
              {!hasResults && !isSearching && (
                <CommandEmpty>{t("CommandPalette.Empty")}</CommandEmpty>
              )}

              {resultGroups.map((group) => (
                <CommandGroup key={group.heading} heading={group.heading}>
                  {group.items.map(renderItem)}
                </CommandGroup>
              ))}

              {isSearching && (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("CommandPalette.Searching")}
                </div>
              )}

              {visibleActions.length > 0 && (
                <CommandGroup heading={t("CommandPalette.Actions")}>
                  {visibleActions.map(renderItem)}
                </CommandGroup>
              )}

              {visiblePages.length > 0 && (
                <CommandGroup heading={t("CommandPalette.GoTo")}>
                  {visiblePages.map(renderItem)}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CommandPalette;
