import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecretTypes } from "@/components/SecretForm/SecretForm";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import {
  ClientAuthentication,
  SnippetClientConfig,
  SnippetOptions,
  buildAuthorizationCodeSnippet,
  buildClientCredentialsSnippet,
  flattenSnippetDocument,
  toApplicationName,
} from "@/lib/snippets/dotnetSnippets";
import { GrantTypeIds } from "@/models/Clients/ClientModels";
import { getClientSecrets } from "@/services/ClientServices";
import { queryKeys } from "@/services/QueryKeys";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCopy, Code2, Globe, Server } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { ClientEditFormData } from "../../ClientSchema";
import { SnippetSteps } from "./Integration/SnippetSteps";

type Scenario = "authorization_code" | "client_credentials";

const AUTHORITY_STORAGE_KEY = "skoruba_snippet_authority";
const API_BASE_URL_STORAGE_KEY = "skoruba_snippet_api_base_url";

const DEFAULT_AUTHORITY = "https://localhost:44310";
const DEFAULT_API_BASE_URL = "https://localhost:5001";

/** Keeps a text option in local storage so it survives navigation and reloads. */
const useStoredState = (key: string, fallback: string) => {
  const [value, setValue] = useState(
    () => localStorage.getItem(key) ?? fallback,
  );

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
};

type OptionFieldProps = {
  label: string;
  description: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const OptionField = ({
  label,
  description,
  value,
  placeholder,
  onChange,
}: OptionFieldProps) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    <Input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      // The tab lives inside the client form - Enter must not submit it.
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
        }
      }}
    />
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

const IntegrationTab = () => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const { control } = useFormContext<ClientEditFormData>();
  const { clientId: resourceId } = useParams<{ clientId: string }>();

  const clientId = useWatch({ control, name: "clientId" });
  const allowedGrantTypes = useWatch({ control, name: "allowedGrantTypes" });
  const allowedScopes = useWatch({ control, name: "allowedScopes" });
  const requireClientSecret = useWatch({
    control,
    name: "requireClientSecret",
  });
  const requirePkce = useWatch({ control, name: "requirePkce" });
  const allowOfflineAccess = useWatch({ control, name: "allowOfflineAccess" });
  const requirePushedAuthorization = useWatch({
    control,
    name: "requirePushedAuthorization",
  });
  const requireDPoP = useWatch({ control, name: "requireDPoP" });
  const redirectUris = useWatch({ control, name: "redirectUris" });
  const postLogoutRedirectUris = useWatch({
    control,
    name: "postLogoutRedirectUris",
  });

  const [authority, setAuthority] = useStoredState(
    AUTHORITY_STORAGE_KEY,
    DEFAULT_AUTHORITY,
  );
  const [apiBaseUrl, setApiBaseUrl] = useStoredState(
    API_BASE_URL_STORAGE_KEY,
    DEFAULT_API_BASE_URL,
  );
  const [appNameOverride, setAppNameOverride] = useState("");
  const [useUserSecrets, setUseUserSecrets] = useState(true);
  // Null until the user picks - the default comes from the registered secrets.
  const [authenticationOverride, setAuthenticationOverride] =
    useState<ClientAuthentication | null>(null);
  // Tracking the excluded scopes keeps newly added scopes selected by default.
  const [excludedScopes, setExcludedScopes] = useState<string[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(
    null,
  );

  // A registered JWK secret means the client authenticates with private_key_jwt.
  const clientSecrets = useQuery({
    queryKey: [queryKeys.clientSecrets, "integration", resourceId],
    queryFn: () => getClientSecrets(Number(resourceId), 0, 100),
    enabled: !!resourceId,
  });

  const hasJwkSecret = (clientSecrets.data?.items ?? []).some(
    (secret) => secret.type === SecretTypes.Jwk,
  );

  const clientAuthentication: ClientAuthentication =
    authenticationOverride ?? (hasJwkSecret ? "jwk" : "shared_secret");

  const grantTypeIds = useMemo(
    () => new Set((allowedGrantTypes ?? []).map((grantType) => grantType.id)),
    [allowedGrantTypes],
  );

  const scenarios = useMemo(() => {
    const available: Scenario[] = [];

    if (grantTypeIds.has(GrantTypeIds.AuthorizationCode)) {
      available.push("authorization_code");
    }

    if (grantTypeIds.has(GrantTypeIds.ClientCredentials)) {
      available.push("client_credentials");
    }

    return available;
  }, [grantTypeIds]);

  const scopes = useMemo(
    () => (allowedScopes ?? []).map((scope) => scope.id),
    [allowedScopes],
  );

  const selectedScopes = useMemo(
    () => scopes.filter((scope) => !excludedScopes.includes(scope)),
    [scopes, excludedScopes],
  );

  const applicationName = toApplicationName(
    appNameOverride.trim() || clientId || "",
  );

  const clientConfig: SnippetClientConfig = useMemo(
    () => ({
      clientId: clientId?.trim() || "my_client",
      scopes: selectedScopes,
      requireClientSecret: requireClientSecret ?? true,
      requirePkce: requirePkce ?? false,
      allowOfflineAccess: allowOfflineAccess ?? false,
      requirePushedAuthorization: requirePushedAuthorization ?? false,
      requireDPoP: requireDPoP ?? false,
      redirectUris: redirectUris ?? [],
      postLogoutRedirectUris: postLogoutRedirectUris ?? [],
    }),
    [
      clientId,
      selectedScopes,
      requireClientSecret,
      requirePkce,
      allowOfflineAccess,
      requirePushedAuthorization,
      requireDPoP,
      redirectUris,
      postLogoutRedirectUris,
    ],
  );

  const options: SnippetOptions = useMemo(
    () => ({
      authority: authority.trim() || DEFAULT_AUTHORITY,
      appName: applicationName,
      apiBaseUrl: apiBaseUrl.trim() || DEFAULT_API_BASE_URL,
      useUserSecrets,
      clientAuthentication,
    }),
    [
      authority,
      applicationName,
      apiBaseUrl,
      useUserSecrets,
      clientAuthentication,
    ],
  );

  const documents = useMemo(
    () => ({
      authorization_code: buildAuthorizationCodeSnippet(clientConfig, options),
      client_credentials: buildClientCredentialsSnippet(clientConfig, options),
    }),
    [clientConfig, options],
  );

  if (scenarios.length === 0) {
    return (
      <CardWrapper
        title={t("Client.Tabs.Integration")}
        description={t("Client.Tabs.IntegrationDescription")}
        icon={Code2}
      >
        <p className="text-sm text-muted-foreground">
          {t("Client.Integration.UnsupportedGrantTypes")}
        </p>
      </CardWrapper>
    );
  }

  const activeScenario =
    selectedScenario && scenarios.includes(selectedScenario)
      ? selectedScenario
      : scenarios[0];

  return (
    <CardWrapper
      title={t("Client.Tabs.Integration")}
      description={t("Client.Tabs.IntegrationDescription")}
      icon={Code2}
    >
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <OptionField
              label={t("Client.Integration.Options.Authority")}
              description={t("Client.Integration.Options.AuthorityInfo")}
              value={authority}
              placeholder={DEFAULT_AUTHORITY}
              onChange={setAuthority}
            />
            <OptionField
              label={t("Client.Integration.Options.ApiBaseUrl")}
              description={t("Client.Integration.Options.ApiBaseUrlInfo")}
              value={apiBaseUrl}
              placeholder={DEFAULT_API_BASE_URL}
              onChange={setApiBaseUrl}
            />
            <OptionField
              label={t("Client.Integration.Options.AppName")}
              description={t("Client.Integration.Options.AppNameInfo")}
              value={appNameOverride}
              placeholder={applicationName}
              onChange={setAppNameOverride}
            />
          </div>

          {requireClientSecret && (
            <div className="mt-4 space-y-1.5 border-t pt-4">
              <Label>
                {t("Client.Integration.Options.ClientAuthentication")}
              </Label>
              <Select
                value={clientAuthentication}
                onValueChange={(value) =>
                  setAuthenticationOverride(value as ClientAuthentication)
                }
              >
                <SelectTrigger className="md:w-1/3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared_secret">
                    {t("Client.Integration.Options.SharedSecret")}
                  </SelectItem>
                  <SelectItem value="jwk">
                    {t("Client.Integration.Options.PrivateKeyJwt")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {hasJwkSecret
                  ? t("Client.Integration.Options.ClientAuthenticationJwkFound")
                  : t("Client.Integration.Options.ClientAuthenticationInfo")}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
            <div>
              <Label>{t("Client.Integration.Options.UseUserSecrets")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("Client.Integration.Options.UseUserSecretsInfo")}
              </p>
            </div>
            <Switch
              checked={useUserSecrets}
              onCheckedChange={setUseUserSecrets}
            />
          </div>

          {scopes.length > 0 && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <Label>{t("Client.Integration.Options.Scopes")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("Client.Integration.Options.ScopesInfo")}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {scopes.map((scope) => {
                  const isSelected = !excludedScopes.includes(scope);

                  return (
                    <button
                      key={scope}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setExcludedScopes((current) =>
                          isSelected
                            ? [...current, scope]
                            : current.filter((item) => item !== scope),
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 font-mono text-xs transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-muted-foreground line-through",
                      )}
                    >
                      {scope}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Tabs
          value={activeScenario}
          onValueChange={(value) => setSelectedScenario(value as Scenario)}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              {scenarios.includes("authorization_code") && (
                <TabsTrigger
                  value="authorization_code"
                  className="flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" />
                  {t("Client.Integration.Scenarios.AuthorizationCode")}
                </TabsTrigger>
              )}
              {scenarios.includes("client_credentials") && (
                <TabsTrigger
                  value="client_credentials"
                  className="flex items-center gap-2"
                >
                  <Server className="h-4 w-4" />
                  {t("Client.Integration.Scenarios.ClientCredentials")}
                </TabsTrigger>
              )}
            </TabsList>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                copyToClipboard(
                  flattenSnippetDocument(documents[activeScenario]),
                )
              }
            >
              <ClipboardCopy className="me-2 h-4 w-4" />
              {t("Client.Integration.CopyAll")}
            </Button>
          </div>

          {scenarios.map((scenario) => (
            <TabsContent key={scenario} value={scenario}>
              <SnippetSteps document={documents[scenario]} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </CardWrapper>
  );
};

export default IntegrationTab;
