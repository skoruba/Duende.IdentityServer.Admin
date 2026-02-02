import {
  ClientApiDto,
  IClientApiDto,
} from "@skoruba/duende.identityserver.admin.api.client/dist/types/client";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { z } from "zod";
import { ClientWizardFormSummaryData } from "./Wizard/Web/ClientSummaryStep";
import { DPoPMode, GrantType } from "@/models/Clients/ClientModels";
import { t } from "i18next";
import { urlValidationSchema } from "./Common/UrlListValidatorSchema";

const DualListTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const formSchema = z.object({
  clientId: z
    .string()
    .min(
      1,
      t("Validation.FieldRequired", { field: t("Client.Label.ClientId_Label") })
    ),
  clientName: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("Client.Label.ClientName_Label"),
    })
  ),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  redirectUris: z.array(urlValidationSchema(t)).optional(),
  postLogoutRedirectUris: z.array(urlValidationSchema(t)).optional(),
  frontChannelLogoutUri: urlValidationSchema(t).or(z.literal("")).optional(),
  frontChannelLogoutSessionRequired: z.boolean().optional(),
  backChannelLogoutUri: urlValidationSchema(t).or(z.literal("")).optional(),
  backChannelLogoutSessionRequired: z.boolean().optional(),
  allowedCorsOrigins: z.array(z.string()).optional(),
  allowedScopes: z.array(DualListTypeSchema).optional(),
  allowOfflineAccess: z.boolean().optional(),
  requireClientSecret: z.boolean().optional(),
  allowedGrantTypes: z.array(DualListTypeSchema).optional(),
  enableLocalLogin: z.boolean().optional(),
  identityProviderRestrictions: z.array(z.string()).optional(),
  useSsoLifetime: z.number().optional(),
  coordinateLifetimeWithUserSession: z.boolean().optional(),
  identityTokenLifetime: z.number().optional(),
  allowedIdentityTokenSigningAlgorithms: z.array(z.string()).optional(),
  accessTokenLifetime: z.number().optional(),
  allowAccessTokenViaBrowser: z.boolean().optional(),
  accessTokenType: z.number().optional(),
  authorizationCodeLifetime: z.number().optional(),
  requireRequestObject: z.boolean().optional(),
  requirePkce: z.boolean().optional(),
  allowPlainTextPkce: z.boolean().optional(),
  absoluteRefreshTokenLifetime: z.number().optional(),
  slidingRefreshTokenLifetime: z.number().optional(),
  cibaLifetime: z.number().optional(),
  pollingInterval: z.number().optional(),
  refreshTokenUsage: z.number().optional(),
  refreshTokenExpiration: z.number().optional(),
  updateAccessTokenClaimsOnRefresh: z.boolean().optional(),
  includeJti: z.boolean().optional(),
  alwaysSendClientClaims: z.boolean().optional(),
  alwaysIncludeUserClaimsInIdToken: z.boolean().optional(),
  clientClaimsPrefix: z.string().optional(),
  pairWiseSubjectSalt: z.string().optional(),
  requireDPoP: z.boolean().optional(),
  dPoPClockSkew: z.string().optional(),
  dPoPValidationMode: z.string().optional(),
  requirePushedAuthorization: z.boolean().optional(),
  pushedAuthorizationLifetime: z.number().optional(),
  initiateLoginUri: z.string().optional(),
  requireConsent: z.boolean().optional(),
  allowRememberConsent: z.boolean().optional(),
  clientUri: z.string().optional(),
  logoUri: z.string().optional(),
  userCodeType: z.string().optional(),
  deviceCodeLifetime: z.number().optional(),
  consentLifetime: z.number().optional(),
  protocolType: z.string().optional(),
  userSsoLifetime: z.number().optional(),
  properties: z
    .array(z.object({ id: z.number(), key: z.string(), value: z.string() }))
    .optional(),
  claims: z
    .array(z.object({ id: z.number(), key: z.string(), value: z.string() }))
    .optional(),
});

export type ClientEditFormData = z.infer<typeof formSchema>;

export const clientDefaultValues: ClientEditFormData = {
  clientId: "",
  clientName: "",
  description: undefined,
  enabled: true,
  redirectUris: [],
  postLogoutRedirectUris: [],
  frontChannelLogoutUri: undefined,
  frontChannelLogoutSessionRequired: true,
  backChannelLogoutUri: undefined,
  backChannelLogoutSessionRequired: true,
  allowedCorsOrigins: [],
  allowedScopes: [],
  allowOfflineAccess: false,
  requireClientSecret: true,
  allowedGrantTypes: [],
  enableLocalLogin: true,
  identityProviderRestrictions: [],
  useSsoLifetime: 0,
  coordinateLifetimeWithUserSession: false,
  identityTokenLifetime: 300,
  allowedIdentityTokenSigningAlgorithms: [],
  accessTokenLifetime: 3600,
  allowAccessTokenViaBrowser: false,
  accessTokenType: 0,
  authorizationCodeLifetime: 300,
  requireRequestObject: false,
  requirePkce: false,
  allowPlainTextPkce: false,
  absoluteRefreshTokenLifetime: 2592000,
  slidingRefreshTokenLifetime: 1296000,
  cibaLifetime: 0,
  pollingInterval: 0,
  refreshTokenUsage: 1,
  refreshTokenExpiration: 0,
  updateAccessTokenClaimsOnRefresh: false,
  includeJti: false,
  alwaysSendClientClaims: false,
  alwaysIncludeUserClaimsInIdToken: false,
  clientClaimsPrefix: "client_",
  pairWiseSubjectSalt: undefined,
  requireDPoP: false,
  dPoPClockSkew: "00:05:00",
  dPoPValidationMode: DPoPMode.Iat.toString(),
  requirePushedAuthorization: false,
  pushedAuthorizationLifetime: 0,
  initiateLoginUri: undefined,
  requireConsent: true,
  allowRememberConsent: true,
  clientUri: undefined,
  logoUri: undefined,
  userCodeType: undefined,
  deviceCodeLifetime: 300,
  consentLifetime: undefined,
  protocolType: "oidc",
  userSsoLifetime: undefined,
  properties: [],
  claims: [],
};

export const mapEditClientToFormData = (
  client: ClientApiDto,
  grantTypes: GrantType[]
): ClientEditFormData => {
  return {
    clientId: client.clientId ?? clientDefaultValues.clientId,
    clientName: client.clientName ?? clientDefaultValues.clientName,
    description: client.description ?? clientDefaultValues.description,
    enabled: client.enabled ?? clientDefaultValues.enabled,
    redirectUris: client.redirectUris ?? clientDefaultValues.redirectUris,
    postLogoutRedirectUris:
      client.postLogoutRedirectUris ??
      clientDefaultValues.postLogoutRedirectUris,
    frontChannelLogoutUri:
      client.frontChannelLogoutUri ?? clientDefaultValues.frontChannelLogoutUri,
    frontChannelLogoutSessionRequired:
      client.frontChannelLogoutSessionRequired ??
      clientDefaultValues.frontChannelLogoutSessionRequired,
    backChannelLogoutUri:
      client.backChannelLogoutUri ?? clientDefaultValues.backChannelLogoutUri,
    backChannelLogoutSessionRequired:
      client.backChannelLogoutSessionRequired ??
      clientDefaultValues.backChannelLogoutSessionRequired,
    allowedCorsOrigins:
      client.allowedCorsOrigins ?? clientDefaultValues.allowedCorsOrigins,
    allowedScopes:
      client.allowedScopes?.map((scope) => ({ id: scope, label: scope })) ??
      clientDefaultValues.allowedScopes,
    allowOfflineAccess:
      client.allowOfflineAccess ?? clientDefaultValues.allowOfflineAccess,
    requireClientSecret:
      client.requireClientSecret ?? clientDefaultValues.requireClientSecret,
    allowedGrantTypes:
      client.allowedGrantTypes?.map((type) => {
        const grantType = grantTypes.find((grant) => grant.id === type);
        if (!grantType) {
          return { id: type, label: type };
        }
        return grantType;
      }) ?? clientDefaultValues.allowedGrantTypes,
    enableLocalLogin:
      client.enableLocalLogin ?? clientDefaultValues.enableLocalLogin,
    identityProviderRestrictions:
      client.identityProviderRestrictions ??
      clientDefaultValues.identityProviderRestrictions,
    useSsoLifetime:
      client.userSsoLifetime ?? clientDefaultValues.useSsoLifetime,
    coordinateLifetimeWithUserSession:
      client.coordinateLifetimeWithUserSession ??
      clientDefaultValues.coordinateLifetimeWithUserSession,
    identityTokenLifetime:
      client.identityTokenLifetime ?? clientDefaultValues.identityTokenLifetime,
    allowedIdentityTokenSigningAlgorithms:
      client.allowedIdentityTokenSigningAlgorithms ??
      clientDefaultValues.allowedIdentityTokenSigningAlgorithms,
    accessTokenLifetime:
      client.accessTokenLifetime ?? clientDefaultValues.accessTokenLifetime,
    allowAccessTokenViaBrowser:
      client.allowAccessTokensViaBrowser ??
      clientDefaultValues.allowAccessTokenViaBrowser,
    accessTokenType:
      client.accessTokenType ?? clientDefaultValues.accessTokenType,
    authorizationCodeLifetime:
      client.authorizationCodeLifetime ??
      clientDefaultValues.authorizationCodeLifetime,
    requireRequestObject:
      client.requireRequestObject ?? clientDefaultValues.requireRequestObject,
    requirePkce: client.requirePkce ?? clientDefaultValues.requirePkce,
    allowPlainTextPkce:
      client.allowPlainTextPkce ?? clientDefaultValues.allowPlainTextPkce,
    absoluteRefreshTokenLifetime:
      client.absoluteRefreshTokenLifetime ??
      clientDefaultValues.absoluteRefreshTokenLifetime,
    slidingRefreshTokenLifetime:
      client.slidingRefreshTokenLifetime ??
      clientDefaultValues.slidingRefreshTokenLifetime,
    cibaLifetime: client.cibaLifetime ?? clientDefaultValues.cibaLifetime,
    pollingInterval:
      client.pollingInterval ?? clientDefaultValues.pollingInterval,
    refreshTokenUsage:
      client.refreshTokenUsage ?? clientDefaultValues.refreshTokenUsage,
    refreshTokenExpiration:
      client.refreshTokenExpiration ??
      clientDefaultValues.refreshTokenExpiration,
    updateAccessTokenClaimsOnRefresh:
      client.updateAccessTokenClaimsOnRefresh ??
      clientDefaultValues.updateAccessTokenClaimsOnRefresh,
    includeJti: client.includeJwtId ?? clientDefaultValues.includeJti,
    alwaysSendClientClaims:
      client.alwaysSendClientClaims ??
      clientDefaultValues.alwaysSendClientClaims,
    alwaysIncludeUserClaimsInIdToken:
      client.alwaysIncludeUserClaimsInIdToken ??
      clientDefaultValues.alwaysIncludeUserClaimsInIdToken,
    clientClaimsPrefix:
      client.clientClaimsPrefix ?? clientDefaultValues.clientClaimsPrefix,
    pairWiseSubjectSalt:
      client.pairWiseSubjectSalt ?? clientDefaultValues.pairWiseSubjectSalt,
    requireDPoP: client.requireDPoP ?? clientDefaultValues.requireDPoP,
    dPoPClockSkew:
      client.dPoPClockSkew?.toString() ?? clientDefaultValues.dPoPClockSkew,
    dPoPValidationMode:
      client.dPoPValidationMode.toString() ??
      clientDefaultValues.dPoPValidationMode,
    requirePushedAuthorization:
      client.requirePushedAuthorization ??
      clientDefaultValues.requirePushedAuthorization,
    pushedAuthorizationLifetime:
      client.pushedAuthorizationLifetime ??
      clientDefaultValues.pushedAuthorizationLifetime,
    initiateLoginUri:
      client.initiateLoginUri ?? clientDefaultValues.initiateLoginUri,
    requireConsent: client.requireConsent ?? clientDefaultValues.requireConsent,
    allowRememberConsent:
      client.allowRememberConsent ?? clientDefaultValues.allowRememberConsent,
    clientUri: client.clientUri ?? clientDefaultValues.clientUri,
    logoUri: client.logoUri ?? clientDefaultValues.logoUri,
    userCodeType: client.userCodeType ?? clientDefaultValues.userCodeType,
    deviceCodeLifetime:
      client.deviceCodeLifetime ?? clientDefaultValues.deviceCodeLifetime,
    consentLifetime:
      client.consentLifetime ?? clientDefaultValues.consentLifetime,
    properties:
      client.properties?.map((property) => ({
        id: property.id,
        key: property.key!,
        value: property.value!,
      })) ?? clientDefaultValues.properties,
    claims:
      client.claims?.map((claim) => ({
        id: claim.id,
        key: claim.type!,
        value: claim.value!,
      })) ?? clientDefaultValues.claims,
  };
};

export const mapFormDataToCreateClient = (
  formData: Partial<ClientWizardFormSummaryData>,
  grantTypes: string[]
): IClientApiDto => {
  return {
    id: 0,
    clientId: formData.clientId ?? clientDefaultValues.clientId,
    clientName: formData.clientName ?? clientDefaultValues.clientName,
    description: formData.description ?? clientDefaultValues.description,
    requireConsent:
      formData.requireConsent ?? clientDefaultValues.requireConsent!,
    redirectUris: formData.redirectUris ?? clientDefaultValues.redirectUris,
    postLogoutRedirectUris: formData.logoutUri ? [formData.logoutUri] : [],
    allowedScopes: (formData.scopes ?? []).map((scope) => scope.id),
    allowedGrantTypes: grantTypes,
    allowedCorsOrigins: [],
    requireDPoP: formData.requireDPoP ?? clientDefaultValues.requireDPoP!,
    requirePushedAuthorization:
      formData.requirePushedAuthorization ??
      clientDefaultValues.requirePushedAuthorization!,
    allowOfflineAccess:
      formData.allowOfflineAccess ?? clientDefaultValues.allowOfflineAccess!,
    requirePkce: formData.requirePkce ?? clientDefaultValues.requirePkce!,
    requireClientSecret:
      formData.requireClientSecret ?? clientDefaultValues.requireClientSecret!,
    authorizationCodeLifetime:
      formData.authorizationCodeLifetime ??
      clientDefaultValues.authorizationCodeLifetime!,

    absoluteRefreshTokenLifetime:
      clientDefaultValues.absoluteRefreshTokenLifetime!,
    accessTokenLifetime: clientDefaultValues.accessTokenLifetime!,
    consentLifetime: clientDefaultValues.consentLifetime!,
    accessTokenType: clientDefaultValues.accessTokenType!,
    allowAccessTokensViaBrowser:
      clientDefaultValues.allowAccessTokenViaBrowser!,
    allowPlainTextPkce: clientDefaultValues.allowPlainTextPkce!,
    allowRememberConsent: clientDefaultValues.allowRememberConsent!,
    alwaysIncludeUserClaimsInIdToken:
      clientDefaultValues.alwaysIncludeUserClaimsInIdToken!,
    alwaysSendClientClaims: clientDefaultValues.alwaysSendClientClaims!,

    frontChannelLogoutUri: clientDefaultValues.frontChannelLogoutUri,
    frontChannelLogoutSessionRequired:
      clientDefaultValues.frontChannelLogoutSessionRequired!,
    backChannelLogoutUri: clientDefaultValues.backChannelLogoutUri,
    backChannelLogoutSessionRequired:
      clientDefaultValues.backChannelLogoutSessionRequired!,
    clientUri: clientDefaultValues.clientUri,
    enabled: clientDefaultValues.enabled!,
    enableLocalLogin: clientDefaultValues.enableLocalLogin!,
    identityTokenLifetime: clientDefaultValues.identityTokenLifetime!,
    includeJwtId: clientDefaultValues.includeJti!,
    logoUri: clientDefaultValues.logoUri,
    clientClaimsPrefix: clientDefaultValues.clientClaimsPrefix,
    pairWiseSubjectSalt: clientDefaultValues.pairWiseSubjectSalt,
    protocolType: clientDefaultValues.protocolType,
    refreshTokenExpiration: clientDefaultValues.refreshTokenExpiration!,
    refreshTokenUsage: clientDefaultValues.refreshTokenUsage!,
    slidingRefreshTokenLifetime:
      clientDefaultValues.slidingRefreshTokenLifetime!,
    updateAccessTokenClaimsOnRefresh:
      clientDefaultValues.updateAccessTokenClaimsOnRefresh!,
    coordinateLifetimeWithUserSession:
      clientDefaultValues.coordinateLifetimeWithUserSession!,
    identityProviderRestrictions:
      clientDefaultValues.identityProviderRestrictions,
    userCodeType: clientDefaultValues.userCodeType,
    deviceCodeLifetime: clientDefaultValues.deviceCodeLifetime!,
    requireRequestObject: clientDefaultValues.requireRequestObject!,
    cibaLifetime: clientDefaultValues.cibaLifetime,
    pollingInterval: clientDefaultValues.pollingInterval,
    dPoPValidationMode: Number(clientDefaultValues.dPoPValidationMode!),
    dPoPClockSkew: clientDefaultValues.dPoPClockSkew!,
    pushedAuthorizationLifetime:
      clientDefaultValues.pushedAuthorizationLifetime,
    initiateLoginUri: clientDefaultValues.initiateLoginUri,
    allowedIdentityTokenSigningAlgorithms:
      clientDefaultValues.allowedIdentityTokenSigningAlgorithms!,
    userSsoLifetime: clientDefaultValues.userSsoLifetime,
    claims:
      clientDefaultValues.claims?.map(
        (claim) =>
          new client.ClientClaimApiDto({
            id: claim.id,
            value: claim.value,
            type: claim.key,
          })
      ) ?? [],
    properties:
      formData.clientProperties?.map(
        (property) =>
          new client.ClientPropertyApiDto({
            id: 0,
            key: property.key,
            value: property.value,
          })
      ) ?? [],
    updated: undefined,
    lastAccessed: undefined,
    nonEditable: false,
  };
};

export const mapFormDataToEditClient = (
  formData: ClientEditFormData,
  id: number
): IClientApiDto => {
  return {
    absoluteRefreshTokenLifetime: formData.absoluteRefreshTokenLifetime!,
    accessTokenLifetime: formData.accessTokenLifetime!,
    consentLifetime: formData.consentLifetime!,
    accessTokenType: formData.accessTokenType!,
    allowAccessTokensViaBrowser: formData.allowAccessTokenViaBrowser!,
    allowOfflineAccess: formData.allowOfflineAccess!,
    allowPlainTextPkce: formData.allowPlainTextPkce!,
    allowRememberConsent: formData.allowRememberConsent!,
    alwaysIncludeUserClaimsInIdToken:
      formData.alwaysIncludeUserClaimsInIdToken!,
    alwaysSendClientClaims: formData.alwaysSendClientClaims!,
    authorizationCodeLifetime: formData.authorizationCodeLifetime!,
    frontChannelLogoutUri: formData.frontChannelLogoutUri || undefined,
    frontChannelLogoutSessionRequired:
      formData.frontChannelLogoutSessionRequired!,
    backChannelLogoutUri: formData.backChannelLogoutUri || undefined,
    backChannelLogoutSessionRequired:
      formData.backChannelLogoutSessionRequired!,
    clientId: formData.clientId,
    clientName: formData.clientName,
    clientUri: formData.clientUri || undefined,
    description: formData.description || undefined,
    enabled: formData.enabled!,
    enableLocalLogin: formData.enableLocalLogin!,
    id: id,
    identityTokenLifetime: formData.identityTokenLifetime!,
    includeJwtId: formData.includeJti!,
    logoUri: formData.logoUri || undefined,
    clientClaimsPrefix: formData.clientClaimsPrefix || undefined,
    pairWiseSubjectSalt: formData.pairWiseSubjectSalt || undefined,
    protocolType: formData.protocolType || undefined,
    refreshTokenExpiration: formData.refreshTokenExpiration!,
    refreshTokenUsage: formData.refreshTokenUsage!,
    slidingRefreshTokenLifetime: formData.slidingRefreshTokenLifetime!,
    requireClientSecret: formData.requireClientSecret!,
    requireConsent: formData.requireConsent!,
    requirePkce: formData.requirePkce!,
    updateAccessTokenClaimsOnRefresh:
      formData.updateAccessTokenClaimsOnRefresh!,
    postLogoutRedirectUris:
      formData.postLogoutRedirectUris ??
      clientDefaultValues.postLogoutRedirectUris,
    identityProviderRestrictions:
      formData.identityProviderRestrictions ??
      clientDefaultValues.identityProviderRestrictions,
    redirectUris: formData.redirectUris ?? clientDefaultValues.redirectUris,
    allowedCorsOrigins:
      formData.allowedCorsOrigins ?? clientDefaultValues.allowedCorsOrigins,
    allowedGrantTypes:
      formData.allowedGrantTypes?.map((grant) => grant.id) ??
      clientDefaultValues.allowedGrantTypes?.map((grant) => grant.id),
    allowedScopes:
      formData.allowedScopes?.map((scope) => scope.id) ??
      clientDefaultValues.allowedScopes?.map((scope) => scope.id),

    userSsoLifetime:
      formData.useSsoLifetime ?? clientDefaultValues.useSsoLifetime,
    userCodeType: formData.userCodeType ?? clientDefaultValues.userCodeType,
    deviceCodeLifetime:
      formData.deviceCodeLifetime ?? clientDefaultValues.deviceCodeLifetime!,
    requireRequestObject:
      formData.requireRequestObject ??
      clientDefaultValues.requireRequestObject!,
    cibaLifetime: formData.cibaLifetime ?? clientDefaultValues.cibaLifetime,
    pollingInterval:
      formData.pollingInterval ?? clientDefaultValues.pollingInterval,
    coordinateLifetimeWithUserSession:
      formData.coordinateLifetimeWithUserSession!,
    requireDPoP: formData.requireDPoP!,
    dPoPValidationMode: Number(
      formData.dPoPValidationMode ?? clientDefaultValues.dPoPValidationMode!
    ),
    dPoPClockSkew: formData.dPoPClockSkew ?? clientDefaultValues.dPoPClockSkew!,
    pushedAuthorizationLifetime:
      formData.pushedAuthorizationLifetime ??
      clientDefaultValues.pushedAuthorizationLifetime,
    requirePushedAuthorization: formData.requirePushedAuthorization!,
    initiateLoginUri:
      formData.initiateLoginUri ?? clientDefaultValues.initiateLoginUri,
    allowedIdentityTokenSigningAlgorithms:
      formData.allowedIdentityTokenSigningAlgorithms ??
      clientDefaultValues.allowedIdentityTokenSigningAlgorithms,
    claims:
      formData.claims?.map(
        (claim) =>
          new client.ClientClaimApiDto({
            id: claim.id,
            value: claim.value,
            type: claim.key,
          })
      ) ?? [],
    properties:
      formData.properties?.map(
        (property) =>
          new client.ClientPropertyApiDto({
            id: property.id,
            key: property.key,
            value: property.value,
          })
      ) ?? [],
    updated: undefined,
    lastAccessed: undefined,
    nonEditable: false,
  };
};
