import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import {
  getClientAuthenticationSelect,
  openIntegrationSettings,
  openIntegrationTab,
} from "./helpers/client-integration";
import {
  acknowledgeAndUsePublicKey,
  generateJwkKeyPair,
  getSecretValueInput,
  getSecretValueTextarea,
  openGenerateJwkDialog,
  openSecretsTab,
  readSecretValueAsJwk,
  selectJwkAlgorithm,
  selectSecretType,
} from "./helpers/client-secrets";
import {
  fillWizardUpToSecretStep,
  finishWizardFromSecretStep,
  openClientWizard,
} from "./helpers/client-wizard";
import { expectSwitchByLabel, expectTimeByLabel } from "./helpers/form-controls";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

/**
 * FAPI 2.0 allows private key JWT or mTLS only, so the wizard starts a high
 * security client with a JWK instead of merely recommending one.
 */
test.describe("Client wizard - high secure client", () => {
  test("starts with a JWK, warns about a shared secret and creates a private key JWT client", async ({
    page,
  }) => {
    test.setTimeout(240_000);

    const marker = faker.string.alphanumeric({ length: 10, casing: "lower" });
    const clientId = `high_secure_ui_test_${marker}`;
    const secretDescription = `jwk_ui_test_wizard_${marker}`;

    await ensureLoggedInAndOpenClients(page, credentials);
    await openClientWizard(page, UI_TEXT.wizard.highSecureClientType);
    await fillWizardUpToSecretStep(page, {
      clientId,
      clientName: `High Secure ${marker}`,
      description: "Created by the high secure wizard UI test",
      redirectUri: `https://${marker}.example.test/signin-oidc`,
      logoutUri: `https://${marker}.example.test/signout-callback-oidc`,
    });

    const wizard = page.getByRole("dialog").filter({
      has: page.locator('textarea[name="secretDescription"]'),
    });
    const secretTypeSelect = wizard.locator('button[role="combobox"]').first();
    const jwkTip = wizard.getByText(UI_TEXT.wizard.jwkPreselectedTip);
    const sharedSecretWarning = wizard.getByText(
      UI_TEXT.wizard.sharedSecretWarning,
    );

    // JWK is where the step starts - nobody had to pick it.
    await expect(secretTypeSelect).toContainText(UI_TEXT.secrets.jwkType);
    await expect(getSecretValueTextarea(wizard)).toBeVisible();
    await expect(jwkTip).toBeVisible();
    await expect(sharedSecretWarning).toHaveCount(0);

    // A shared secret stays possible, but not without saying what it costs.
    await selectSecretType(page, wizard, UI_TEXT.secrets.sharedSecretType);
    await expect(sharedSecretWarning).toBeVisible();
    await expect(jwkTip).toHaveCount(0);
    await expect(getSecretValueInput(wizard)).toBeVisible();

    await selectSecretType(page, wizard, UI_TEXT.secrets.jwkType);
    await expect(jwkTip).toBeVisible();
    await expect(sharedSecretWarning).toHaveCount(0);

    const jwkDialog = await openGenerateJwkDialog(page);
    await selectJwkAlgorithm(page, jwkDialog, UI_TEXT.jwk.algorithms.es256);
    await generateJwkKeyPair(jwkDialog);
    await acknowledgeAndUsePublicKey(jwkDialog);

    const publicJwk = await readSecretValueAsJwk(wizard);
    expect(publicJwk.alg).toBe("ES256");
    expect(publicJwk).not.toHaveProperty("d");

    await wizard
      .locator('textarea[name="secretDescription"]')
      .fill(secretDescription);

    // FAPI 2.0 rejects a JWT dated more than 60 seconds ahead, so the review step
    // has to show the DPoP clock skew the type enforces instead of the 5 minute default.
    await finishWizardFromSecretStep(page, async () => {
      const dPoPClockSkewRow = page
        .getByRole("dialog")
        .getByText(`${UI_TEXT.wizard.dPoPClockSkewLabel}:`, { exact: true })
        .locator("..");

      await expect(dPoPClockSkewRow).toContainText(
        UI_TEXT.wizard.highSecureDPoPClockSkewSummary,
      );
    });

    await expect(page.locator('input[name="clientId"]')).toHaveValue(clientId, {
      timeout: 60_000,
    });

    // The summary is not just a label - the client is saved with that clock skew.
    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    await page.getByRole("tab", { name: "Tokens", exact: true }).click();
    await page.getByRole("tab", { name: "DPoP Settings", exact: true }).click();
    const dPoPSettingsPanel = page.getByRole("tabpanel", {
      name: "DPoP Settings",
      exact: true,
    });
    await expectSwitchByLabel(dPoPSettingsPanel, "Require DPoP", true);
    await expectTimeByLabel(
      dPoPSettingsPanel,
      UI_TEXT.wizard.dPoPClockSkewLabel,
      UI_TEXT.wizard.highSecureDPoPClockSkewValue,
    );

    // The key really is the client's secret, next to what the type enforces.
    const secretsPanel = await openSecretsTab(page);
    const secretRow = secretsPanel.locator("table tbody tr", {
      hasText: secretDescription,
    });
    await expect(secretRow).toBeVisible();
    await expect(
      secretRow.getByRole("cell", { name: UI_TEXT.secrets.jwkType, exact: true }),
    ).toBeVisible();
    await expectSwitchByLabel(secretsPanel, "Require Client Secret", true);

    // And the rest of the admin picks it up: the setup code signs an assertion.
    const integrationPanel = await openIntegrationTab(page);
    await openIntegrationSettings(integrationPanel);
    await expect(getClientAuthenticationSelect(integrationPanel)).toContainText(
      UI_TEXT.integration.privateKeyJwt,
    );

    await page.getByRole("button", { name: "Delete Client", exact: true }).click();
    const deleteDialog = page.getByRole("alertdialog");
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole("button", { name: /delete/i }).click();
    await expect(page).toHaveURL(/\/clients(?:[/?#]|$)/i, { timeout: 60_000 });
  });

  test("keeps the shared secret as the starting point of a confidential client", async ({
    page,
  }) => {
    const marker = faker.string.alphanumeric({ length: 10, casing: "lower" });

    await ensureLoggedInAndOpenClients(page, credentials);
    await openClientWizard(page);
    await fillWizardUpToSecretStep(page, {
      clientId: `confidential_ui_test_${marker}`,
      clientName: `Confidential ${marker}`,
      description: "Never saved - the test stops on the secret step",
      redirectUri: `https://${marker}.example.test/signin-oidc`,
      logoutUri: `https://${marker}.example.test/signout-callback-oidc`,
    });

    const wizard = page.getByRole("dialog").filter({
      has: page.locator('textarea[name="secretDescription"]'),
    });

    await expect(wizard.locator('button[role="combobox"]').first()).toContainText(
      UI_TEXT.secrets.sharedSecretType,
    );
    await expect(getSecretValueInput(wizard)).toBeVisible();
    await expect(wizard.getByText(UI_TEXT.wizard.jwkPreselectedTip)).toHaveCount(0);
    await expect(wizard.getByText(UI_TEXT.wizard.sharedSecretWarning)).toHaveCount(0);
  });
});
