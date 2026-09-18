import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import { type LoginCredentials } from "./helpers/auth";
import {
  expectSnippetNotToContain,
  expectSnippetToContain,
  getClientAuthenticationSelect,
  getIntegrationOptionInput,
  getIntegrationSettingsTrigger,
  getScenarioTab,
  getScopeChip,
  getSnippetStepHeading,
  getUseUserSecretsSwitch,
  openIntegrationSettings,
  openIntegrationTab,
  selectClientAuthentication,
  setAllowedScopeSelected,
  setGrantTypeSelected,
} from "./helpers/client-integration";
import { openClientDetailFromClients } from "./helpers/client-list";
import {
  acknowledgeAndUsePublicKey,
  deleteSecretRowByDescription,
  deleteSecretRowsByDescriptionPrefix,
  generateJwkKeyPair,
  openAddSecretDialog,
  openGenerateJwkDialog,
  openSecretsTab,
  selectJwkAlgorithm,
  selectSecretType,
} from "./helpers/client-secrets";
import { setSwitchByLabel } from "./helpers/form-controls";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

const TEXT = UI_TEXT.integration;

// Shares the prefix with the JWK secret tests, so one cleanup covers both.
const jwkSecretDescriptionPrefix = "jwk_ui_test_";

// The seeded client allows these API and identity scopes.
const apiScope = "skoruba_identity_admin_api";
const identityScope = "roles";
const notYetAllowedScope = "address";

/**
 * The seeded admin client is a confidential authorization code client with PKCE
 * and a shared secret. The tests change the form without saving, so the client
 * itself stays as it was - only the JWK secret test writes and cleans up.
 */
test.describe("Client integration tab", () => {
  test.beforeEach(async ({ page }) => {
    await openClientDetailFromClients(page, seedData.expectedClientId, credentials);
    await expect(page.locator('input[name="clientId"]')).toHaveValue(
      seedData.expectedClientId,
      { timeout: 60_000 },
    );
  });

  test("generates the code from the unsaved client form", async ({ page }) => {
    const unsavedClientId = `unsaved_${faker.string.alphanumeric({
      length: 8,
      casing: "lower",
    })}`;

    let panel = await openIntegrationTab(page);
    await expectSnippetToContain(panel, `"ClientId": "${seedData.expectedClientId}"`);
    await expectSnippetNotToContain(panel, "options.UsePkce = false;");
    await expect(panel.getByText(TEXT.notes.pkceDisabled)).toHaveCount(0);

    await page.getByRole("tab", { name: "Basics", exact: true }).click();
    await page.locator('input[name="clientId"]').fill(unsavedClientId);

    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    await page.getByRole("tab", { name: "Authorization", exact: true }).click();
    await page.getByRole("tab", { name: "PKCE", exact: true }).click();
    const pkcePanel = page.getByRole("tabpanel", { name: "PKCE", exact: true });
    await setSwitchByLabel(pkcePanel, "Require Pkce", false);

    panel = await openIntegrationTab(page);
    await expectSnippetToContain(panel, `"ClientId": "${unsavedClientId}"`);
    await expectSnippetNotToContain(panel, `"${seedData.expectedClientId}"`);
    await expectSnippetToContain(panel, "options.UsePkce = false;");
    await expect(panel.getByText(TEXT.notes.pkceDisabled)).toBeVisible();

    // The application name follows the client id until it is overridden.
    await expect(getIntegrationSettingsTrigger(panel)).toContainText(
      unsavedClientId.replace(/_/g, "-"),
    );
  });

  test("offers only the scenarios the grant types allow", async ({ page }) => {
    let panel = await openIntegrationTab(page);
    await expect(getScenarioTab(panel, TEXT.scenarios.webApp)).toBeVisible();
    await expect(getScenarioTab(panel, TEXT.scenarios.worker)).toHaveCount(0);

    await setGrantTypeSelected(page, UI_TEXT.grantTypes.clientCredentials, true);

    panel = await openIntegrationTab(page);
    await expect(getScenarioTab(panel, TEXT.scenarios.webApp)).toHaveAttribute(
      "data-state",
      "active",
    );
    await expectSnippetToContain(panel, ".AddOpenIdConnect(");

    await getScenarioTab(panel, TEXT.scenarios.worker).click();
    await expectSnippetToContain(panel, "AddClientCredentialsTokenManagement()");
    await expectSnippetNotToContain(panel, ".AddOpenIdConnect(");

    await setGrantTypeSelected(page, UI_TEXT.grantTypes.authorizationCode, false);

    // With the web app scenario gone the worker one is the first - and only - choice.
    panel = await openIntegrationTab(page);
    await expect(getScenarioTab(panel, TEXT.scenarios.webApp)).toHaveCount(0);
    await expect(getScenarioTab(panel, TEXT.scenarios.worker)).toHaveAttribute(
      "data-state",
      "active",
    );
    await expectSnippetToContain(panel, "AddClientCredentialsTokenManagement()");

    await setGrantTypeSelected(page, UI_TEXT.grantTypes.clientCredentials, false);

    panel = await openIntegrationTab(page);
    await expect(panel.getByText(TEXT.unsupportedGrantTypes)).toBeVisible();
    await expect(panel.locator("pre")).toHaveCount(0);
    await expect(panel.getByRole("button", { name: TEXT.copyAll })).toHaveCount(0);
  });

  test("leaves a scope out of the code and selects a newly allowed one", async ({
    page,
  }) => {
    await setGrantTypeSelected(page, UI_TEXT.grantTypes.clientCredentials, true);
    await setAllowedScopeSelected(page, notYetAllowedScope, true);

    const panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);

    // A scope allowed a moment ago is requested without any further click.
    await expect(getScopeChip(panel, notYetAllowedScope)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSnippetToContain(panel, `options.Scope.Add("${notYetAllowedScope}");`);

    const identityScopeChip = getScopeChip(panel, identityScope);
    await expect(identityScopeChip).toHaveAttribute("aria-pressed", "true");
    await expectSnippetToContain(panel, `options.Scope.Add("${identityScope}");`);

    await identityScopeChip.click();
    await expect(identityScopeChip).toHaveAttribute("aria-pressed", "false");
    await expectSnippetNotToContain(panel, `options.Scope.Add("${identityScope}");`);

    await identityScopeChip.click();
    await expect(identityScopeChip).toHaveAttribute("aria-pressed", "true");
    await expectSnippetToContain(panel, `options.Scope.Add("${identityScope}");`);

    // The worker requests API scopes only, so dropping the last one leaves nothing.
    await getScenarioTab(panel, TEXT.scenarios.worker).click();
    await expectSnippetToContain(panel, `Scope.Parse("${apiScope}")`);
    await expect(panel.getByText(TEXT.notes.noApiScope)).toHaveCount(0);

    await getScopeChip(panel, apiScope).click();
    await expect(panel.getByText(TEXT.notes.noApiScope)).toBeVisible();
    await expectSnippetNotToContain(panel, `Scope.Parse("${apiScope}")`);
  });

  test("remembers the authority and API address but not the application name", async ({
    page,
  }) => {
    const marker = faker.string.alphanumeric({ length: 8, casing: "lower" });
    const authority = `https://sts-${marker}.example.test`;
    const apiBaseUrl = `https://api-${marker}.example.test`;
    const appName = `Custom App ${marker}`;
    const appNameInCode = `custom-app-${marker}`;

    let panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);

    await getIntegrationOptionInput(panel, TEXT.authority).fill(authority);
    await getIntegrationOptionInput(panel, TEXT.apiBaseUrl).fill(apiBaseUrl);
    await getIntegrationOptionInput(panel, TEXT.appName).fill(appName);

    await expectSnippetToContain(panel, `"Authority": "${authority}"`);
    await expectSnippetToContain(panel, `new Uri("${apiBaseUrl}/")`);
    await expectSnippetToContain(panel, `"__Host-${appNameInCode}"`);
    await expect(getIntegrationSettingsTrigger(panel)).toContainText(
      `${authority} · ${appNameInCode}`,
    );

    await page.reload();
    await expect(page.locator('input[name="clientId"]')).toHaveValue(
      seedData.expectedClientId,
      { timeout: 60_000 },
    );

    panel = await openIntegrationTab(page);
    await expectSnippetToContain(panel, `"Authority": "${authority}"`);
    await expectSnippetToContain(panel, `new Uri("${apiBaseUrl}/")`);
    await expectSnippetNotToContain(panel, appNameInCode);

    // The values persist, so the panel starts collapsed and shows them in its header.
    const settingsTrigger = getIntegrationSettingsTrigger(panel);
    await expect(settingsTrigger).toHaveAttribute("data-state", "closed");
    await expect(settingsTrigger).toContainText(authority);

    await openIntegrationSettings(panel);
    await expect(getIntegrationOptionInput(panel, TEXT.authority)).toHaveValue(
      authority,
    );
    await expect(getIntegrationOptionInput(panel, TEXT.apiBaseUrl)).toHaveValue(
      apiBaseUrl,
    );
    await expect(getIntegrationOptionInput(panel, TEXT.appName)).toHaveValue("");
  });

  test("pressing Enter in a setting does not submit the client form", async ({
    page,
  }) => {
    const panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);

    const writeRequests: string[] = [];
    page.on("request", (request) => {
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
        writeRequests.push(`${request.method()} ${request.url()}`);
      }
    });

    const clientUrl = page.url();
    const authorityInput = getIntegrationOptionInput(panel, TEXT.authority);
    await authorityInput.fill("https://sts.example.test");
    await authorityInput.press("Enter");

    // A submit saves the client and leaves for the list - give it time to happen.
    await page.waitForTimeout(2_000);

    expect(writeRequests).toEqual([]);
    expect(page.url()).toBe(clientUrl);
    await expect(authorityInput).toBeVisible();
  });

  test("moves the secret between user secrets and the code", async ({ page }) => {
    const panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);

    const useUserSecrets = getUseUserSecretsSwitch(panel);
    await expect(useUserSecrets).toHaveAttribute("data-state", "checked");
    await expect(getSnippetStepHeading(panel, TEXT.steps.storeSecret)).toBeVisible();
    await expectSnippetToContain(panel, 'dotnet user-secrets set "Oidc:ClientSecret"');
    await expectSnippetToContain(
      panel,
      'options.ClientSecret = builder.Configuration["Oidc:ClientSecret"];',
    );
    await expect(panel.getByText(TEXT.notes.inlineSecret)).toHaveCount(0);

    await useUserSecrets.click();
    await expect(useUserSecrets).toHaveAttribute("data-state", "unchecked");

    await expect(getSnippetStepHeading(panel, TEXT.steps.storeSecret)).toHaveCount(0);
    await expectSnippetNotToContain(panel, "dotnet user-secrets");
    await expectSnippetToContain(panel, 'options.ClientSecret = "<your client secret>";');
    await expect(panel.getByText(TEXT.notes.inlineSecret)).toBeVisible();
  });

  test("copies every step of the active scenario only", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await setGrantTypeSelected(page, UI_TEXT.grantTypes.clientCredentials, true);

    const panel = await openIntegrationTab(page);
    const copyAll = panel.getByRole("button", { name: TEXT.copyAll, exact: true });
    const readClipboard = () => page.evaluate(() => navigator.clipboard.readText());

    await copyAll.click();
    await expect.poll(readClipboard).toContain(".AddOpenIdConnect(");

    const webAppCode = await readClipboard();
    expect(webAppCode).toContain("dotnet add package");
    expect(webAppCode).toContain(`"ClientId": "${seedData.expectedClientId}"`);
    expect(webAppCode).toContain('dotnet user-secrets set "Oidc:ClientSecret"');
    expect(webAppCode).not.toContain("AddClientCredentialsTokenManagement");

    await getScenarioTab(panel, TEXT.scenarios.worker).click();
    await copyAll.click();
    await expect.poll(readClipboard).toContain("AddClientCredentialsTokenManagement()");

    const workerCode = await readClipboard();
    expect(workerCode).toContain("dotnet add package");
    expect(workerCode).toContain("class ApiWorker");
    expect(workerCode).not.toContain(".AddOpenIdConnect(");
  });

  test("treats a client without a required secret as a public client", async ({
    page,
  }) => {
    let panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);
    await expect(getClientAuthenticationSelect(panel)).toBeVisible();

    const secretsPanel = await openSecretsTab(page);
    await setSwitchByLabel(secretsPanel, "Require Client Secret", false);

    panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);

    await expect(getClientAuthenticationSelect(panel)).toHaveCount(0);
    await expect(getSnippetStepHeading(panel, TEXT.steps.storeSecret)).toHaveCount(0);
    await expectSnippetNotToContain(panel, "ClientSecret");
    await expect(panel.getByText(TEXT.notes.publicClient)).toBeVisible();
  });

  test("preselects private key JWT once the client has a JWK secret", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const secretDescription = `${jwkSecretDescriptionPrefix}integration_${faker.string.alphanumeric(
      { length: 10, casing: "lower" },
    )}`;

    let secretsPanel = await openSecretsTab(page);
    await deleteSecretRowsByDescriptionPrefix(
      page,
      secretsPanel,
      jwkSecretDescriptionPrefix,
    );

    let panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);
    await expect(getClientAuthenticationSelect(panel)).toContainText(TEXT.sharedSecret);
    await expect(panel.getByText(TEXT.noJwkHint)).toBeVisible();

    secretsPanel = await openSecretsTab(page);
    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    const jwkDialog = await openGenerateJwkDialog(page);
    await selectJwkAlgorithm(page, jwkDialog, UI_TEXT.jwk.algorithms.es256);
    await generateJwkKeyPair(jwkDialog);
    await acknowledgeAndUsePublicKey(jwkDialog);

    await addSecretDialog
      .locator('textarea[name="secretDescription"]')
      .fill(secretDescription);
    await addSecretDialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect(addSecretDialog).toBeHidden();
    await expect(
      secretsPanel.locator("table tbody tr", { hasText: secretDescription }),
    ).toBeVisible();

    // The tab reads the secrets on its own, so it has to notice the new one.
    panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);
    await expect(getClientAuthenticationSelect(panel)).toContainText(TEXT.privateKeyJwt);
    await expect(panel.getByText(TEXT.jwkFoundHint)).toBeVisible();
    await expect(getSnippetStepHeading(panel, TEXT.steps.storePrivateKey)).toBeVisible();
    await expect(getSnippetStepHeading(panel, TEXT.steps.signAssertion)).toBeVisible();
    await expectSnippetToContain(panel, 'dotnet user-secrets set "Oidc:SigningJwk"');
    await expectSnippetToContain(panel, "class ClientAssertionService");
    await expectSnippetNotToContain(panel, "options.ClientSecret");
    // The package sends the assertion at sign-in by itself, but only a recent one.
    await expect(panel.getByText(TEXT.notes.assertionSignInVersion)).toBeVisible();

    // The preselection is a default - the user can still go back to the shared secret.
    await selectClientAuthentication(page, panel, TEXT.sharedSecret);
    await expect(getSnippetStepHeading(panel, TEXT.steps.storeSecret)).toBeVisible();
    await expect(getSnippetStepHeading(panel, TEXT.steps.signAssertion)).toHaveCount(0);
    await expectSnippetToContain(panel, 'dotnet user-secrets set "Oidc:ClientSecret"');
    await expectSnippetNotToContain(panel, "Oidc:SigningJwk");
    await expect(panel.getByText(TEXT.notes.assertionSignInVersion)).toHaveCount(0);
    await expect(panel.getByText(TEXT.jwkFoundHint)).toBeVisible();

    secretsPanel = await openSecretsTab(page);
    await deleteSecretRowByDescription(page, secretsPanel, secretDescription);

    panel = await openIntegrationTab(page);
    await openIntegrationSettings(panel);
    await expect(getClientAuthenticationSelect(panel)).toContainText(TEXT.sharedSecret);
    await expect(panel.getByText(TEXT.noJwkHint)).toBeVisible();
  });
});
