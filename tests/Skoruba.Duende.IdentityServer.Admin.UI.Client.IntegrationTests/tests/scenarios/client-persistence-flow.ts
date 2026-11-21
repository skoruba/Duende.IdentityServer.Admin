import { faker } from "@faker-js/faker";
import { expect, type Page } from "@playwright/test";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "../helpers/auth";
import { showAllClientSettings } from "../helpers/client-tabs";
import { openClientDetailFromClients } from "../helpers/client-list";
import { createConfidentialClientViaWizard } from "../helpers/client-wizard";
import { apiGet } from "../helpers/admin-api";
import {
  addInputWithTableItemByLabel,
  clearNumberByLabel,
  expectInputWithTableHasItem,
  expectNumberByLabel,
  expectSelectValueByLabel,
  expectSwitchByLabel,
  expectTextInputByLabel,
  expectTimeByLabel,
  fillNumberByLabel,
  fillTextInputByLabel,
  fillTimeByLabel,
  getSelectValueByLabel,
  removeTableRowByCell,
  selectDifferentOptionByLabel,
  setDualListToAllSelected,
  setDualListToNoneSelected,
  setSwitchByLabel,
} from "../helpers/form-controls";
import { clickPageSave } from "../helpers/ui-navigation";
import { UI_TEXT } from "../helpers/ui-texts";

export async function runCreateUpdateAndVerifyClientPersistence(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
    const marker = faker.string.alphanumeric({ length: 10, casing: "lower" });
    const createdClientId = `guid_ui_test_${marker}`;
    const createdClientName = `guid_ui_test_${marker}`;
    const createdDescription = faker.lorem.sentence();
    const wizardRedirectUri = `https://wizard-${marker}.example.com/signin-oidc`;
    const wizardLogoutUri = `https://wizard-${marker}.example.com/signout-callback-oidc`;
    const wizardSecretValue = `WizardSecret_${marker}_A1!`;
    const wizardSecretDescription = `Wizard secret ${marker}`;

    const updatedClientId = `guid_ui_test_${marker}_updated`;
    const updatedClientName = `Client ${marker} Updated`;
    const updatedDescription = `Updated description ${marker}`;
    const updatedRedirectUri = `https://app-${marker}.example.com/signin-oidc`;
    const updatedPostLogoutRedirectUri = `https://app-${marker}.example.com/signout-callback-oidc`;
    const updatedFrontChannelLogoutUri = `https://app-${marker}.example.com/front-channel-logout`;
    const updatedBackChannelLogoutUri = `https://app-${marker}.example.com/back-channel-logout`;
    const updatedCorsOrigin = `https://spa-${marker}.example.com`;
    const updatedIdentityProviderRestriction = `idp-${marker}`;
    const updatedPairWiseSubjectSalt = faker.string.alphanumeric({
      length: 20,
      casing: "lower",
    });
    const updatedInitiateLoginUri = `https://portal-${marker}.example.com/start-login`;
    const updatedClientUri = `https://app-${marker}.example.com/client-info`;
    const updatedLogoUri = `https://app-${marker}.example.com/logo.png`;
    const updatedUserCodeType = `user-code-${marker}`;
    const updatedClientClaimsPrefix = `client_${marker}_`;
    const updatedClaimKey = `claim_${marker}`;
    const updatedClaimValue = `value_${marker}`;
    const updatedPropertyKey = `property_${marker}`;
    const updatedPropertyValue = `property_value_${marker}`;

    const switchValues = {
      enabled: false,
      frontChannelLogoutSessionRequired: false,
      backChannelLogoutSessionRequired: false,
      requireClientSecret: true,
      allowOfflineAccess: true,
      enableLocalLogin: false,
      coordinateLifetimeWithUserSession: true,
      requirePushedAuthorization: true,
      requirePkce: true,
      allowPlainTextPkce: true,
      requireRequestObject: true,
      alwaysIncludeUserClaimsInIdToken: true,
      includeJti: true,
      allowAccessTokenViaBrowser: true,
      updateAccessTokenClaimsOnRefresh: true,
      requireDPoP: true,
      requireConsent: false,
      allowRememberConsent: false,
      alwaysSendClientClaims: true,
    } as const;

    const numberValues = {
      useSsoLifetime: 3333,
      pushedAuthorizationLifetime: 120,
      cibaLifetime: 500,
      pollingInterval: 15,
      identityTokenLifetime: 800,
      accessTokenLifetime: 7200,
      authorizationCodeLifetime: 600,
      absoluteRefreshTokenLifetime: 2_600_000,
      slidingRefreshTokenLifetime: 1_300_000,
      deviceCodeLifetime: 901,
      consentLifetime: 444,
    } as const;

    const dpopClockSkewValue = "00:09";
    const signingAlgorithmValue = "RS256";

    await ensureLoggedInAndOpenClients(page, credentials);

    await createConfidentialClientViaWizard(page, {
      clientId: createdClientId,
      clientName: createdClientName,
      description: createdDescription,
      redirectUri: wizardRedirectUri,
      logoutUri: wizardLogoutUri,
      secretValue: wizardSecretValue,
      secretDescription: wizardSecretDescription,
    });

    await expect(page.locator('input[name="clientId"]')).toHaveValue(createdClientId);

    // The wizard creates a confidential client, so CIBA and device flow are
    // hidden - this walk covers every field, hidden or not.
    await showAllClientSettings(page);

    const basicsPanel = page.getByRole("tabpanel", { name: "Basics", exact: true });
    await expect(basicsPanel).toBeVisible();
    await page.locator('input[name="clientId"]').fill(updatedClientId);
    await page.locator('input[name="clientName"]').fill(updatedClientName);
    await page.locator('textarea[name="description"]').fill(updatedDescription);
    await setSwitchByLabel(basicsPanel, "Enabled", switchValues.enabled);

    await page.getByRole("tab", { name: "Urls", exact: true }).click();
    const urlsPanel = page.getByRole("tabpanel", { name: "Urls", exact: true });
    await expect(urlsPanel).toBeVisible();

    await page.getByRole("tab", { name: "Redirect Uris", exact: true }).click();
    const redirectUrisPanel = page.getByRole("tabpanel", {
      name: "Redirect Uris",
      exact: true,
    });
    await expect(redirectUrisPanel).toBeVisible();
    await addInputWithTableItemByLabel(
      redirectUrisPanel,
      "Redirect Uris",
      updatedRedirectUri,
    );
    await addInputWithTableItemByLabel(
      redirectUrisPanel,
      "Post Logout Redirect Uris",
      updatedPostLogoutRedirectUri,
    );

    await page.getByRole("tab", { name: "Logout Uris", exact: true }).click();
    const logoutUrisPanel = page.getByRole("tabpanel", {
      name: "Logout Uris",
      exact: true,
    });
    await expect(logoutUrisPanel).toBeVisible();
    await fillTextInputByLabel(
      logoutUrisPanel,
      "Front Channel Logout Uri",
      updatedFrontChannelLogoutUri,
    );
    await setSwitchByLabel(
      logoutUrisPanel,
      "Front Channel Logout Session Required",
      switchValues.frontChannelLogoutSessionRequired,
    );
    await fillTextInputByLabel(
      logoutUrisPanel,
      "Back Channel Logout Uri",
      updatedBackChannelLogoutUri,
    );
    await setSwitchByLabel(
      logoutUrisPanel,
      "Back Channel Logout Session Required",
      switchValues.backChannelLogoutSessionRequired,
    );

    await page.getByRole("tab", { name: "Cors Origins", exact: true }).click();
    const corsOriginsPanel = page.getByRole("tabpanel", {
      name: "Cors Origins",
      exact: true,
    });
    await expect(corsOriginsPanel).toBeVisible();
    await addInputWithTableItemByLabel(
      corsOriginsPanel,
      "Allowed Cors Origins",
      updatedCorsOrigin,
    );

    await page.getByRole("tab", { name: "Scopes", exact: true }).click();
    const scopesPanel = page.getByRole("tabpanel", { name: "Scopes", exact: true });
    await expect(scopesPanel).toBeVisible();
    await setDualListToAllSelected(scopesPanel, "Allowed Scopes");

    await page.getByRole("tab", { name: "Secrets", exact: true }).click();
    const secretsPanel = page.getByRole("tabpanel", {
      name: "Secrets",
      exact: true,
    });
    await expect(secretsPanel).toBeVisible();
    await setSwitchByLabel(
      secretsPanel,
      "Require Client Secret",
      switchValues.requireClientSecret,
    );
    await setSwitchByLabel(
      secretsPanel,
      "Allow Offline Access",
      switchValues.allowOfflineAccess,
    );

    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    const advancedPanel = page.getByRole("tabpanel", {
      name: "Advanced",
      exact: true,
    });
    await expect(advancedPanel).toBeVisible();

    await setDualListToAllSelected(advancedPanel, "Allowed Grant Types");

    await page.getByRole("tab", { name: "Authentication", exact: true }).click();
    const authenticationPanel = page.getByRole("tabpanel", {
      name: "Authentication",
      exact: true,
    });
    await expect(authenticationPanel).toBeVisible();
    await setSwitchByLabel(
      authenticationPanel,
      "Enable Local Login",
      switchValues.enableLocalLogin,
    );
    await addInputWithTableItemByLabel(
      authenticationPanel,
      "Identity Provider Restrictions",
      updatedIdentityProviderRestriction,
    );
    await fillNumberByLabel(
      authenticationPanel,
      "User Sso Lifetime",
      numberValues.useSsoLifetime,
    );
    await setSwitchByLabel(
      authenticationPanel,
      "Coordinate Lifetime With User Session",
      switchValues.coordinateLifetimeWithUserSession,
    );

    await page.getByRole("tab", { name: "Authorization", exact: true }).click();
    const authorizationPanel = page.getByRole("tabpanel", {
      name: "Authorization",
      exact: true,
    });
    await expect(authorizationPanel).toBeVisible();

    await page.getByRole("tab", { name: "Pushed Authorization", exact: true }).click();
    const pushedAuthorizationPanel = page.getByRole("tabpanel", {
      name: "Pushed Authorization",
      exact: true,
    });
    await expect(pushedAuthorizationPanel).toBeVisible();
    await setSwitchByLabel(
      pushedAuthorizationPanel,
      "Require Pushed Authorization",
      switchValues.requirePushedAuthorization,
    );
    await fillNumberByLabel(
      pushedAuthorizationPanel,
      "Pushed Authorization Lifetime",
      numberValues.pushedAuthorizationLifetime,
    );

    await page.getByRole("tab", { name: "PKCE", exact: true }).click();
    const pkcePanel = page.getByRole("tabpanel", { name: "PKCE", exact: true });
    await expect(pkcePanel).toBeVisible();
    await setSwitchByLabel(pkcePanel, "Require Pkce", switchValues.requirePkce);
    await setSwitchByLabel(
      pkcePanel,
      "Allow Plain Text Pkce",
      switchValues.allowPlainTextPkce,
    );

    await page.getByRole("tab", { name: "CIBA", exact: true }).click();
    const cibaPanel = page.getByRole("tabpanel", { name: "CIBA", exact: true });
    await expect(cibaPanel).toBeVisible();
    await fillNumberByLabel(cibaPanel, "Ciba Lifetime", numberValues.cibaLifetime);
    await fillNumberByLabel(
      cibaPanel,
      "Polling Interval",
      numberValues.pollingInterval,
    );

    await page.getByRole("tab", { name: "Other Settings", exact: true }).click();
    const otherSettingsPanel = page.getByRole("tabpanel", {
      name: "Other Settings",
      exact: true,
    });
    await expect(otherSettingsPanel).toBeVisible();
    await setSwitchByLabel(
      otherSettingsPanel,
      "Require Request Object",
      switchValues.requireRequestObject,
    );
    await fillTextInputByLabel(
      otherSettingsPanel,
      "Pair Wise Subject Salt",
      updatedPairWiseSubjectSalt,
    );
    await fillTextInputByLabel(
      otherSettingsPanel,
      "Initiate Login Uri",
      updatedInitiateLoginUri,
    );

    await page.getByRole("tab", { name: "Tokens", exact: true }).click();
    const tokensPanel = page.getByRole("tabpanel", { name: "Tokens", exact: true });
    await expect(tokensPanel).toBeVisible();

    const identityTokenPanel = page.getByRole("tabpanel", {
      name: "Identity Token",
      exact: true,
    });
    await expect(identityTokenPanel).toBeVisible();
    await fillNumberByLabel(
      identityTokenPanel,
      "Identity Token Lifetime",
      numberValues.identityTokenLifetime,
    );
    await addInputWithTableItemByLabel(
      identityTokenPanel,
      "Allowed Identity Token Signing Algorithms",
      signingAlgorithmValue,
      "Search",
    );
    await setSwitchByLabel(
      identityTokenPanel,
      "Always Include User Claims In IdToken",
      switchValues.alwaysIncludeUserClaimsInIdToken,
    );
    await setSwitchByLabel(identityTokenPanel, "Include Jwt Id", switchValues.includeJti);

    await page.getByRole("tab", { name: "Access Token", exact: true }).click();
    const accessTokenPanel = page.getByRole("tabpanel", {
      name: "Access Token",
      exact: true,
    });
    await expect(accessTokenPanel).toBeVisible();
    await fillNumberByLabel(
      accessTokenPanel,
      "Access Token Lifetime",
      numberValues.accessTokenLifetime,
    );
    await setSwitchByLabel(
      accessTokenPanel,
      "Allow Access Token Via Browser",
      switchValues.allowAccessTokenViaBrowser,
    );
    const selectedAccessTokenType = await selectDifferentOptionByLabel(
      page,
      accessTokenPanel,
      "Access Token Type",
    );
    await fillNumberByLabel(
      accessTokenPanel,
      "Authorization Code Lifetime",
      numberValues.authorizationCodeLifetime,
    );
    await setSwitchByLabel(
      accessTokenPanel,
      "Update Access Token Claims On Refresh",
      switchValues.updateAccessTokenClaimsOnRefresh,
    );

    await page.getByRole("tab", { name: "Refresh Token", exact: true }).click();
    const refreshTokenPanel = page.getByRole("tabpanel", {
      name: "Refresh Token",
      exact: true,
    });
    await expect(refreshTokenPanel).toBeVisible();
    await fillNumberByLabel(
      refreshTokenPanel,
      "Absolute Refresh Token Lifetime",
      numberValues.absoluteRefreshTokenLifetime,
    );
    await fillNumberByLabel(
      refreshTokenPanel,
      "Sliding Refresh Token Lifetime",
      numberValues.slidingRefreshTokenLifetime,
    );
    const selectedRefreshTokenUsage = await selectDifferentOptionByLabel(
      page,
      refreshTokenPanel,
      "Refresh Token Usage",
      0,
    );
    const selectedRefreshTokenExpiration = await selectDifferentOptionByLabel(
      page,
      refreshTokenPanel,
      "Refresh Token Expiration",
      1,
    );

    await page.getByRole("tab", { name: "DPoP Settings", exact: true }).click();
    const dpopSettingsPanel = page.getByRole("tabpanel", {
      name: "DPoP Settings",
      exact: true,
    });
    await expect(dpopSettingsPanel).toBeVisible();
    await setSwitchByLabel(
      dpopSettingsPanel,
      "Require DPoP",
      switchValues.requireDPoP,
    );
    await fillTimeByLabel(dpopSettingsPanel, "DPoP Clock Skew", dpopClockSkewValue);
    const selectedDpopValidationMode = await getSelectValueByLabel(
      dpopSettingsPanel,
      "DPoP Validation Mode",
    );

    await page.getByRole("tab", { name: "Consent", exact: true }).click();
    const consentPanel = page.getByRole("tabpanel", { name: "Consent", exact: true });
    await expect(consentPanel).toBeVisible();
    await setSwitchByLabel(
      consentPanel,
      "Require Consent",
      switchValues.requireConsent,
    );
    await fillNumberByLabel(
      consentPanel,
      "Consent Lifetime",
      numberValues.consentLifetime,
    );
    await setSwitchByLabel(
      consentPanel,
      "Allow Remember Consent",
      switchValues.allowRememberConsent,
    );
    await fillTextInputByLabel(consentPanel, "Client Uri", updatedClientUri);
    await fillTextInputByLabel(consentPanel, "Logo Uri", updatedLogoUri);

    await page.getByRole("tab", { name: "Device Flow", exact: true }).click();
    const deviceFlowPanel = page.getByRole("tabpanel", {
      name: "Device Flow",
      exact: true,
    });
    await expect(deviceFlowPanel).toBeVisible();
    await fillTextInputByLabel(deviceFlowPanel, "User Code Type", updatedUserCodeType);
    await fillNumberByLabel(
      deviceFlowPanel,
      "Device Code Lifetime",
      numberValues.deviceCodeLifetime,
    );

    await page.getByRole("tab", { name: "Client Claims", exact: true }).click();
    const clientClaimsPanel = page.getByRole("tabpanel", {
      name: "Client Claims",
      exact: true,
    });
    await expect(clientClaimsPanel).toBeVisible();
    await setSwitchByLabel(
      clientClaimsPanel,
      "Always Send Client Claims",
      switchValues.alwaysSendClientClaims,
    );
    await fillTextInputByLabel(
      clientClaimsPanel,
      "Client Claims Prefix",
      updatedClientClaimsPrefix,
    );
    await clientClaimsPanel
      .getByRole("button", { name: "Add Claim", exact: true })
      .click();
    const claimModal = page.getByRole("dialog", { name: "Add Claim", exact: true });
    await expect(claimModal).toBeVisible();
    await claimModal.getByPlaceholder("Search").fill(updatedClaimKey);
    await claimModal.getByPlaceholder("Enter value").fill(updatedClaimValue);
    await claimModal.getByRole("button", { name: "Add Claim", exact: true }).click();
    await expect(claimModal).not.toBeVisible();
    await expect(clientClaimsPanel.getByRole("cell", { name: updatedClaimKey })).toBeVisible();
    await expect(
      clientClaimsPanel.getByRole("cell", { name: updatedClaimValue }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Client Properties", exact: true }).click();
    const clientPropertiesPanel = page.getByRole("tabpanel", {
      name: "Client Properties",
      exact: true,
    });
    await expect(clientPropertiesPanel).toBeVisible();
    await clientPropertiesPanel
      .getByRole("button", { name: "Add Property", exact: true })
      .click();
    const propertyModal = page.getByRole("dialog", {
      name: "Add Property",
      exact: true,
    });
    await expect(propertyModal).toBeVisible();
    await propertyModal.locator("#key").fill(updatedPropertyKey);
    await propertyModal.locator("#value").fill(updatedPropertyValue);
    await propertyModal
      .getByRole("button", { name: "Add Property", exact: true })
      .click();
    await expect(propertyModal).not.toBeVisible();
    await expect(
      clientPropertiesPanel.getByRole("cell", { name: updatedPropertyKey }),
    ).toBeVisible();
    await expect(
      clientPropertiesPanel.getByRole("cell", { name: updatedPropertyValue }),
    ).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/clients(?:[/?#]|$)/i, { timeout: 60_000 }),
      clickPageSave(page),
    ]);

    await openClientDetailFromClients(page, updatedClientId, credentials);

    const reopenedBasicsPanel = page.getByRole("tabpanel", {
      name: "Basics",
      exact: true,
    });
    await expect(page.locator('input[name="clientId"]')).toHaveValue(updatedClientId);

    // The update selected every grant type, so nothing is hidden any more and
    // the "show all settings" switch is gone - every tab is already there.
    await expect(
      page.getByRole("switch", { name: UI_TEXT.clientTabs.showAllSettings }),
    ).toHaveCount(0);
    await expect(page.locator('input[name="clientName"]')).toHaveValue(updatedClientName);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(updatedDescription);
    await expectSwitchByLabel(
      reopenedBasicsPanel,
      "Enabled",
      switchValues.enabled,
    );

    await page.getByRole("tab", { name: "Urls", exact: true }).click();
    await page.getByRole("tab", { name: "Redirect Uris", exact: true }).click();
    const reopenedRedirectUrisPanel = page.getByRole("tabpanel", {
      name: "Redirect Uris",
      exact: true,
    });
    await expectInputWithTableHasItem(
      reopenedRedirectUrisPanel,
      "Redirect Uris",
      updatedRedirectUri,
    );
    await expectInputWithTableHasItem(
      reopenedRedirectUrisPanel,
      "Post Logout Redirect Uris",
      updatedPostLogoutRedirectUri,
    );

    await page.getByRole("tab", { name: "Logout Uris", exact: true }).click();
    const reopenedLogoutUrisPanel = page.getByRole("tabpanel", {
      name: "Logout Uris",
      exact: true,
    });
    await expectTextInputByLabel(
      reopenedLogoutUrisPanel,
      "Front Channel Logout Uri",
      updatedFrontChannelLogoutUri,
    );
    await expectSwitchByLabel(
      reopenedLogoutUrisPanel,
      "Front Channel Logout Session Required",
      switchValues.frontChannelLogoutSessionRequired,
    );
    await expectTextInputByLabel(
      reopenedLogoutUrisPanel,
      "Back Channel Logout Uri",
      updatedBackChannelLogoutUri,
    );
    await expectSwitchByLabel(
      reopenedLogoutUrisPanel,
      "Back Channel Logout Session Required",
      switchValues.backChannelLogoutSessionRequired,
    );

    await page.getByRole("tab", { name: "Cors Origins", exact: true }).click();
    const reopenedCorsOriginsPanel = page.getByRole("tabpanel", {
      name: "Cors Origins",
      exact: true,
    });
    await expectInputWithTableHasItem(
      reopenedCorsOriginsPanel,
      "Allowed Cors Origins",
      updatedCorsOrigin,
    );

    await page.getByRole("tab", { name: "Scopes", exact: true }).click();
    const reopenedScopesPanel = page.getByRole("tabpanel", {
      name: "Scopes",
      exact: true,
    });
    await expect(
      reopenedScopesPanel.getByRole("button", {
        name: UI_TEXT.actions.selectAll,
        exact: true,
      }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Secrets", exact: true }).click();
    const reopenedSecretsPanel = page.getByRole("tabpanel", {
      name: "Secrets",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedSecretsPanel,
      "Require Client Secret",
      switchValues.requireClientSecret,
    );
    await expectSwitchByLabel(
      reopenedSecretsPanel,
      "Allow Offline Access",
      switchValues.allowOfflineAccess,
    );

    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    const reopenedAdvancedPanel = page.getByRole("tabpanel", {
      name: "Advanced",
      exact: true,
    });
    await expect(
      reopenedAdvancedPanel.getByRole("button", {
        name: UI_TEXT.actions.selectAll,
        exact: true,
      }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Authentication", exact: true }).click();
    const reopenedAuthenticationPanel = page.getByRole("tabpanel", {
      name: "Authentication",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedAuthenticationPanel,
      "Enable Local Login",
      switchValues.enableLocalLogin,
    );
    await expectInputWithTableHasItem(
      reopenedAuthenticationPanel,
      "Identity Provider Restrictions",
      updatedIdentityProviderRestriction,
    );
    await expectNumberByLabel(
      reopenedAuthenticationPanel,
      "User Sso Lifetime",
      numberValues.useSsoLifetime,
    );
    await expectSwitchByLabel(
      reopenedAuthenticationPanel,
      "Coordinate Lifetime With User Session",
      switchValues.coordinateLifetimeWithUserSession,
    );

    await page.getByRole("tab", { name: "Authorization", exact: true }).click();
    await page.getByRole("tab", { name: "Pushed Authorization", exact: true }).click();
    const reopenedPushAuthorizationPanel = page.getByRole("tabpanel", {
      name: "Pushed Authorization",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedPushAuthorizationPanel,
      "Require Pushed Authorization",
      switchValues.requirePushedAuthorization,
    );
    await expectNumberByLabel(
      reopenedPushAuthorizationPanel,
      "Pushed Authorization Lifetime",
      numberValues.pushedAuthorizationLifetime,
    );

    await page.getByRole("tab", { name: "PKCE", exact: true }).click();
    const reopenedPkcePanel = page.getByRole("tabpanel", {
      name: "PKCE",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedPkcePanel,
      "Require Pkce",
      switchValues.requirePkce,
    );
    await expectSwitchByLabel(
      reopenedPkcePanel,
      "Allow Plain Text Pkce",
      switchValues.allowPlainTextPkce,
    );

    await page.getByRole("tab", { name: "CIBA", exact: true }).click();
    const reopenedCibaPanel = page.getByRole("tabpanel", {
      name: "CIBA",
      exact: true,
    });
    await expectNumberByLabel(
      reopenedCibaPanel,
      "Ciba Lifetime",
      numberValues.cibaLifetime,
    );
    await expectNumberByLabel(
      reopenedCibaPanel,
      "Polling Interval",
      numberValues.pollingInterval,
    );

    await page.getByRole("tab", { name: "Other Settings", exact: true }).click();
    const reopenedOtherSettingsPanel = page.getByRole("tabpanel", {
      name: "Other Settings",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedOtherSettingsPanel,
      "Require Request Object",
      switchValues.requireRequestObject,
    );
    await expectTextInputByLabel(
      reopenedOtherSettingsPanel,
      "Pair Wise Subject Salt",
      updatedPairWiseSubjectSalt,
    );
    await expectTextInputByLabel(
      reopenedOtherSettingsPanel,
      "Initiate Login Uri",
      updatedInitiateLoginUri,
    );

    await page.getByRole("tab", { name: "Tokens", exact: true }).click();
    const reopenedIdentityTokenPanel = page.getByRole("tabpanel", {
      name: "Identity Token",
      exact: true,
    });
    await expectNumberByLabel(
      reopenedIdentityTokenPanel,
      "Identity Token Lifetime",
      numberValues.identityTokenLifetime,
    );
    await expectInputWithTableHasItem(
      reopenedIdentityTokenPanel,
      "Allowed Identity Token Signing Algorithms",
      signingAlgorithmValue,
    );
    await expectSwitchByLabel(
      reopenedIdentityTokenPanel,
      "Always Include User Claims In IdToken",
      switchValues.alwaysIncludeUserClaimsInIdToken,
    );
    await expectSwitchByLabel(
      reopenedIdentityTokenPanel,
      "Include Jwt Id",
      switchValues.includeJti,
    );

    await page.getByRole("tab", { name: "Access Token", exact: true }).click();
    const reopenedAccessTokenPanel = page.getByRole("tabpanel", {
      name: "Access Token",
      exact: true,
    });
    await expectNumberByLabel(
      reopenedAccessTokenPanel,
      "Access Token Lifetime",
      numberValues.accessTokenLifetime,
    );
    await expectSwitchByLabel(
      reopenedAccessTokenPanel,
      "Allow Access Token Via Browser",
      switchValues.allowAccessTokenViaBrowser,
    );
    await expectSelectValueByLabel(
      reopenedAccessTokenPanel,
      "Access Token Type",
      selectedAccessTokenType,
    );
    await expectNumberByLabel(
      reopenedAccessTokenPanel,
      "Authorization Code Lifetime",
      numberValues.authorizationCodeLifetime,
    );
    await expectSwitchByLabel(
      reopenedAccessTokenPanel,
      "Update Access Token Claims On Refresh",
      switchValues.updateAccessTokenClaimsOnRefresh,
    );

    await page.getByRole("tab", { name: "Refresh Token", exact: true }).click();
    const reopenedRefreshTokenPanel = page.getByRole("tabpanel", {
      name: "Refresh Token",
      exact: true,
    });
    await expectNumberByLabel(
      reopenedRefreshTokenPanel,
      "Absolute Refresh Token Lifetime",
      numberValues.absoluteRefreshTokenLifetime,
    );
    await expectNumberByLabel(
      reopenedRefreshTokenPanel,
      "Sliding Refresh Token Lifetime",
      numberValues.slidingRefreshTokenLifetime,
    );
    await expectSelectValueByLabel(
      reopenedRefreshTokenPanel,
      "Refresh Token Usage",
      selectedRefreshTokenUsage,
      0,
    );
    await expectSelectValueByLabel(
      reopenedRefreshTokenPanel,
      "Refresh Token Expiration",
      selectedRefreshTokenExpiration,
      1,
    );

    await page.getByRole("tab", { name: "DPoP Settings", exact: true }).click();
    const reopenedDpopSettingsPanel = page.getByRole("tabpanel", {
      name: "DPoP Settings",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedDpopSettingsPanel,
      "Require DPoP",
      switchValues.requireDPoP,
    );
    await expectTimeByLabel(
      reopenedDpopSettingsPanel,
      "DPoP Clock Skew",
      dpopClockSkewValue,
    );
    await expectSelectValueByLabel(
      reopenedDpopSettingsPanel,
      "DPoP Validation Mode",
      selectedDpopValidationMode,
    );

    await page.getByRole("tab", { name: "Consent", exact: true }).click();
    const reopenedConsentPanel = page.getByRole("tabpanel", {
      name: "Consent",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedConsentPanel,
      "Require Consent",
      switchValues.requireConsent,
    );
    await expectNumberByLabel(
      reopenedConsentPanel,
      "Consent Lifetime",
      numberValues.consentLifetime,
    );
    await expectSwitchByLabel(
      reopenedConsentPanel,
      "Allow Remember Consent",
      switchValues.allowRememberConsent,
    );
    await expectTextInputByLabel(reopenedConsentPanel, "Client Uri", updatedClientUri);
    await expectTextInputByLabel(reopenedConsentPanel, "Logo Uri", updatedLogoUri);

    await page.getByRole("tab", { name: "Device Flow", exact: true }).click();
    const reopenedDeviceFlowPanel = page.getByRole("tabpanel", {
      name: "Device Flow",
      exact: true,
    });
    await expectTextInputByLabel(
      reopenedDeviceFlowPanel,
      "User Code Type",
      updatedUserCodeType,
    );
    await expectNumberByLabel(
      reopenedDeviceFlowPanel,
      "Device Code Lifetime",
      numberValues.deviceCodeLifetime,
    );

    await page.getByRole("tab", { name: "Client Claims", exact: true }).click();
    const reopenedClientClaimsPanel = page.getByRole("tabpanel", {
      name: "Client Claims",
      exact: true,
    });
    await expectSwitchByLabel(
      reopenedClientClaimsPanel,
      "Always Send Client Claims",
      switchValues.alwaysSendClientClaims,
    );
    await expectTextInputByLabel(
      reopenedClientClaimsPanel,
      "Client Claims Prefix",
      updatedClientClaimsPrefix,
    );
    await expect(
      reopenedClientClaimsPanel.getByRole("cell", { name: updatedClaimKey }),
    ).toBeVisible();
    await expect(
      reopenedClientClaimsPanel.getByRole("cell", { name: updatedClaimValue }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Client Properties", exact: true }).click();
    const reopenedClientPropertiesPanel = page.getByRole("tabpanel", {
      name: "Client Properties",
      exact: true,
    });
    await expect(
      reopenedClientPropertiesPanel.getByRole("cell", { name: updatedPropertyKey }),
    ).toBeVisible();
    await expect(
      reopenedClientPropertiesPanel.getByRole("cell", { name: updatedPropertyValue }),
    ).toBeVisible();

    await runClearAndVerifyClientPersistence(page, credentials, {
      clientId: updatedClientId,
      redirectUris: [wizardRedirectUri, updatedRedirectUri],
      postLogoutRedirectUris: [wizardLogoutUri, updatedPostLogoutRedirectUri],
      corsOrigin: updatedCorsOrigin,
      identityProviderRestriction: updatedIdentityProviderRestriction,
      signingAlgorithm: signingAlgorithmValue,
      claimKey: updatedClaimKey,
      propertyKey: updatedPropertyKey,
      switchValues,
    });
}

type FilledClient = {
  clientId: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  corsOrigin: string;
  identityProviderRestriction: string;
  signingAlgorithm: string;
  claimKey: string;
  propertyKey: string;
  switchValues: Record<SwitchField, boolean>;
};

type SwitchField =
  | "enabled"
  | "frontChannelLogoutSessionRequired"
  | "backChannelLogoutSessionRequired"
  | "requireClientSecret"
  | "allowOfflineAccess"
  | "enableLocalLogin"
  | "coordinateLifetimeWithUserSession"
  | "requirePushedAuthorization"
  | "requirePkce"
  | "allowPlainTextPkce"
  | "requireRequestObject"
  | "alwaysIncludeUserClaimsInIdToken"
  | "includeJti"
  | "allowAccessTokenViaBrowser"
  | "updateAccessTokenClaimsOnRefresh"
  | "requireDPoP"
  | "requireConsent"
  | "allowRememberConsent"
  | "alwaysSendClientClaims";

/** Where every switch lives and which API field it writes. */
const switchFields: Record<
  SwitchField,
  { tabs: string[]; label: string; apiField: string }
> = {
  enabled: { tabs: ["Basics"], label: "Enabled", apiField: "enabled" },
  frontChannelLogoutSessionRequired: {
    tabs: ["Urls", "Logout Uris"],
    label: "Front Channel Logout Session Required",
    apiField: "frontChannelLogoutSessionRequired",
  },
  backChannelLogoutSessionRequired: {
    tabs: ["Urls", "Logout Uris"],
    label: "Back Channel Logout Session Required",
    apiField: "backChannelLogoutSessionRequired",
  },
  requireClientSecret: {
    tabs: ["Secrets"],
    label: "Require Client Secret",
    apiField: "requireClientSecret",
  },
  allowOfflineAccess: {
    tabs: ["Secrets"],
    label: "Allow Offline Access",
    apiField: "allowOfflineAccess",
  },
  enableLocalLogin: {
    tabs: ["Advanced", "Authentication"],
    label: "Enable Local Login",
    apiField: "enableLocalLogin",
  },
  coordinateLifetimeWithUserSession: {
    tabs: ["Advanced", "Authentication"],
    label: "Coordinate Lifetime With User Session",
    apiField: "coordinateLifetimeWithUserSession",
  },
  requirePushedAuthorization: {
    tabs: ["Advanced", "Authorization", "Pushed Authorization"],
    label: "Require Pushed Authorization",
    apiField: "requirePushedAuthorization",
  },
  requirePkce: {
    tabs: ["Advanced", "Authorization", "PKCE"],
    label: "Require Pkce",
    apiField: "requirePkce",
  },
  allowPlainTextPkce: {
    tabs: ["Advanced", "Authorization", "PKCE"],
    label: "Allow Plain Text Pkce",
    apiField: "allowPlainTextPkce",
  },
  requireRequestObject: {
    tabs: ["Advanced", "Authorization", "Other Settings"],
    label: "Require Request Object",
    apiField: "requireRequestObject",
  },
  alwaysIncludeUserClaimsInIdToken: {
    tabs: ["Advanced", "Tokens", "Identity Token"],
    label: "Always Include User Claims In IdToken",
    apiField: "alwaysIncludeUserClaimsInIdToken",
  },
  includeJti: {
    tabs: ["Advanced", "Tokens", "Identity Token"],
    label: "Include Jwt Id",
    apiField: "includeJwtId",
  },
  allowAccessTokenViaBrowser: {
    tabs: ["Advanced", "Tokens", "Access Token"],
    label: "Allow Access Token Via Browser",
    apiField: "allowAccessTokensViaBrowser",
  },
  updateAccessTokenClaimsOnRefresh: {
    tabs: ["Advanced", "Tokens", "Access Token"],
    label: "Update Access Token Claims On Refresh",
    apiField: "updateAccessTokenClaimsOnRefresh",
  },
  requireDPoP: {
    tabs: ["Advanced", "Tokens", "DPoP Settings"],
    label: "Require DPoP",
    apiField: "requireDPoP",
  },
  requireConsent: {
    tabs: ["Advanced", "Consent"],
    label: "Require Consent",
    apiField: "requireConsent",
  },
  allowRememberConsent: {
    tabs: ["Advanced", "Consent"],
    label: "Allow Remember Consent",
    apiField: "allowRememberConsent",
  },
  alwaysSendClientClaims: {
    tabs: ["Advanced", "Client Claims"],
    label: "Always Send Client Claims",
    apiField: "alwaysSendClientClaims",
  },
};

async function openClientTab(page: Page, tabs: string[]) {
  for (const tab of tabs) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
  }

  const panel = page.getByRole("tabpanel", {
    name: tabs[tabs.length - 1],
    exact: true,
  });
  await expect(panel).toBeVisible();
  return panel;
}

function expectEmpty(stored: Record<string, unknown>, field: string): void {
  const value = stored[field];
  expect(
    value === null || value === "" || (Array.isArray(value) && value.length === 0),
    `${field} has to stay empty after it was cleared, but is ${JSON.stringify(value)}`,
  ).toBe(true);
}

/**
 * The second pass goes the other way: every optional value is cleared, every
 * list emptied and every switch flipped. Values the form leaves out of the
 * request get the server's default instead of the empty value, which only an
 * empty value can reveal - so the stored client is read back through the API.
 */
async function runClearAndVerifyClientPersistence(
  page: Page,
  credentials: LoginCredentials,
  filled: FilledClient,
): Promise<void> {
  const id = /\/client\/(\d+)/i.exec(page.url())?.[1];
  expect(id, "the client detail URL carries the id").toBeTruthy();

  const basicsPanel = await openClientTab(page, ["Basics"]);
  await basicsPanel.locator('textarea[name="description"]').fill("");

  const redirectUrisPanel = await openClientTab(page, ["Urls", "Redirect Uris"]);
  for (const uri of [...filled.redirectUris, ...filled.postLogoutRedirectUris]) {
    await removeTableRowByCell(redirectUrisPanel, uri);
  }

  const logoutUrisPanel = await openClientTab(page, ["Urls", "Logout Uris"]);
  await fillTextInputByLabel(logoutUrisPanel, "Front Channel Logout Uri", "");
  await fillTextInputByLabel(logoutUrisPanel, "Back Channel Logout Uri", "");

  const corsOriginsPanel = await openClientTab(page, ["Urls", "Cors Origins"]);
  await removeTableRowByCell(corsOriginsPanel, filled.corsOrigin);

  const authenticationPanel = await openClientTab(page, [
    "Advanced",
    "Authentication",
  ]);
  await removeTableRowByCell(
    authenticationPanel,
    filled.identityProviderRestriction,
  );
  await clearNumberByLabel(authenticationPanel, "User Sso Lifetime");

  const pushedAuthorizationPanel = await openClientTab(page, [
    "Advanced",
    "Authorization",
    "Pushed Authorization",
  ]);
  await clearNumberByLabel(pushedAuthorizationPanel, "Pushed Authorization Lifetime");

  const cibaPanel = await openClientTab(page, ["Advanced", "Authorization", "CIBA"]);
  await clearNumberByLabel(cibaPanel, "Ciba Lifetime");
  await clearNumberByLabel(cibaPanel, "Polling Interval");

  const otherSettingsPanel = await openClientTab(page, [
    "Advanced",
    "Authorization",
    "Other Settings",
  ]);
  await fillTextInputByLabel(otherSettingsPanel, "Pair Wise Subject Salt", "");
  await fillTextInputByLabel(otherSettingsPanel, "Initiate Login Uri", "");

  const identityTokenPanel = await openClientTab(page, [
    "Advanced",
    "Tokens",
    "Identity Token",
  ]);
  await removeTableRowByCell(identityTokenPanel, filled.signingAlgorithm);

  const consentPanel = await openClientTab(page, ["Advanced", "Consent"]);
  await clearNumberByLabel(consentPanel, "Consent Lifetime");
  await fillTextInputByLabel(consentPanel, "Client Uri", "");
  await fillTextInputByLabel(consentPanel, "Logo Uri", "");

  const deviceFlowPanel = await openClientTab(page, ["Advanced", "Device Flow"]);
  await fillTextInputByLabel(deviceFlowPanel, "User Code Type", "");

  const clientClaimsPanel = await openClientTab(page, ["Advanced", "Client Claims"]);
  await fillTextInputByLabel(clientClaimsPanel, "Client Claims Prefix", "");
  await removeTableRowByCell(clientClaimsPanel, filled.claimKey);

  const clientPropertiesPanel = await openClientTab(page, [
    "Advanced",
    "Client Properties",
  ]);
  await removeTableRowByCell(clientPropertiesPanel, filled.propertyKey);

  for (const [field, location] of Object.entries(switchFields)) {
    const panel = await openClientTab(page, location.tabs);
    await setSwitchByLabel(
      panel,
      location.label,
      !filled.switchValues[field as SwitchField],
    );
  }

  // Emptying the lists last - without grant types the form hides the tabs
  // that belong to them.
  await setDualListToNoneSelected(await openClientTab(page, ["Scopes"]));
  await setDualListToNoneSelected(await openClientTab(page, ["Advanced"]));

  await Promise.all([
    page.waitForURL(/\/clients(?:[/?#]|$)/i, { timeout: 60_000 }),
    clickPageSave(page),
  ]);

  const stored = await apiGet(page, `Clients/${id}`);

  for (const field of [
    "description",
    "frontChannelLogoutUri",
    "backChannelLogoutUri",
    "pairWiseSubjectSalt",
    "initiateLoginUri",
    "clientUri",
    "logoUri",
    "userCodeType",
    "clientClaimsPrefix",
    "userSsoLifetime",
    "pushedAuthorizationLifetime",
    "cibaLifetime",
    "pollingInterval",
    "consentLifetime",
    "redirectUris",
    "postLogoutRedirectUris",
    "allowedCorsOrigins",
    "identityProviderRestrictions",
    "allowedIdentityTokenSigningAlgorithms",
    "allowedScopes",
    "allowedGrantTypes",
    "claims",
  ]) {
    expectEmpty(stored, field);
  }

  // The wizard marks the client type with a property of its own.
  expect(
    (stored.properties as Array<{ key: string }>).map((property) => property.key),
  ).not.toContain(filled.propertyKey);

  for (const [field, location] of Object.entries(switchFields)) {
    expect(stored[location.apiField], `${location.apiField} after flipping`).toBe(
      !filled.switchValues[field as SwitchField],
    );
  }

  // The form shows what got stored, not a default in its place.
  await openClientDetailFromClients(page, filled.clientId, credentials);
  const reopenedClientClaimsPanel = await openClientTab(page, [
    "Advanced",
    "Client Claims",
  ]);
  await expectTextInputByLabel(reopenedClientClaimsPanel, "Client Claims Prefix", "");
}
