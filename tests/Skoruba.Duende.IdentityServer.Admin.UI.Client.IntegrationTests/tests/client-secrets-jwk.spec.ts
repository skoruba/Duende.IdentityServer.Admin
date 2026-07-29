import { faker } from "@faker-js/faker";
import { expect, test, type Locator } from "@playwright/test";
import fs from "node:fs";
import { loadE2ESeedData } from "../utils/seed-data";
import { type LoginCredentials } from "./helpers/auth";
import { openClientDetailFromClients } from "./helpers/client-list";
import {
  acknowledgeAndUsePublicKey,
  deleteSecretRowByDescription,
  discardGeneratedKeyPair,
  generateJwkKeyPair,
  getSecretValueInput,
  getSecretValueTextarea,
  openAddSecretDialog,
  openGenerateJwkDialog,
  openSecretsTab,
  readSecretValueAsJwk,
  selectJwkAlgorithm,
  selectSecretType,
} from "./helpers/client-secrets";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

const privateRsaJwkMembers = ["d", "p", "q", "dp", "dq", "qi"];
const validPublicRsaJwk = '{"kty":"RSA","n":"sXchDf-Wc","e":"AQAB"}';

async function readDownloadedText(download: {
  path: () => Promise<string | null>;
}): Promise<string> {
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  return fs.readFileSync(downloadPath as string, "utf8");
}

function getCodeBlock(jwkDialog: Locator): Locator {
  return jwkDialog.locator("pre");
}

test.describe("Client secrets - JWK", () => {
  test.beforeEach(async ({ page }) => {
    await openClientDetailFromClients(page, seedData.expectedClientId, credentials);
    await openSecretsTab(page);
  });

  test("generates an RSA key pair in the browser and stores only the public JWK", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const secretDescription = `jwk_ui_test_${faker.string.alphanumeric({
      length: 10,
      casing: "lower",
    })}`;

    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    // JWK is not hashed, so the value is a visible textarea instead of a password input.
    await expect(getSecretValueTextarea(addSecretDialog)).toBeVisible();
    await expect(getSecretValueInput(addSecretDialog)).toHaveCount(0);

    const jwkDialog = await openGenerateJwkDialog(page);
    await expect(
      jwkDialog.getByText(
        "The key pair is generated in your browser. The private key is never sent to the server.",
        { exact: true },
      ),
    ).toBeVisible();

    // RSA exposes the key size, and the private key stays masked until revealed.
    await expect(
      jwkDialog.getByText(UI_TEXT.jwk.keySize, { exact: true }),
    ).toBeVisible();

    await generateJwkKeyPair(jwkDialog);
    await expect(
      jwkDialog.getByRole("button", { name: UI_TEXT.jwk.reveal, exact: true }),
    ).toBeVisible();

    await acknowledgeAndUsePublicKey(jwkDialog);

    await expect(
      page.getByText(UI_TEXT.jwk.publicKeyApplied, { exact: true }),
    ).toBeVisible();
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.publicKeyValidated, { exact: true }),
    ).toBeVisible();

    const publicJwk = await readSecretValueAsJwk(addSecretDialog);
    expect(publicJwk.kty).toBe("RSA");
    expect(publicJwk.alg).toBe("RS256");
    expect(publicJwk.use).toBe("sig");
    expect(publicJwk.e).toBe("AQAB");
    expect(typeof publicJwk.n).toBe("string");
    expect(typeof publicJwk.kid).toBe("string");
    for (const member of privateRsaJwkMembers) {
      expect(publicJwk).not.toHaveProperty(member);
    }

    await addSecretDialog
      .locator('textarea[name="secretDescription"]')
      .fill(secretDescription);
    await addSecretDialog
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await expect(addSecretDialog).toBeHidden();

    const secretsPanel = page.getByRole("tabpanel", {
      name: "Secrets",
      exact: true,
    });
    const createdRow = secretsPanel.locator("table tbody tr", {
      hasText: secretDescription,
    });
    await expect(createdRow).toBeVisible();
    await expect(
      createdRow.getByRole("cell", { name: UI_TEXT.secrets.jwkType, exact: true }),
    ).toBeVisible();

    await deleteSecretRowByDescription(page, secretsPanel, secretDescription);
  });

  test("keeps the private key masked and downloads both keys in JWK and PEM form", async ({
    page,
  }) => {
    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    const jwkDialog = await openGenerateJwkDialog(page);
    await generateJwkKeyPair(jwkDialog);

    // Masked means hidden on screen - copying and downloading still has to work.
    await expect(getCodeBlock(jwkDialog)).toHaveCount(0);

    const privateJwkDownload = page.waitForEvent("download");
    await jwkDialog
      .getByRole("button", { name: UI_TEXT.jwk.download, exact: true })
      .click();
    const privateJwkFile = await privateJwkDownload;
    expect(privateJwkFile.suggestedFilename()).toMatch(
      /^jwk-private-[\w-]+\.json$/,
    );

    const privateJwk = JSON.parse(await readDownloadedText(privateJwkFile)) as
      Record<string, unknown>;
    expect(privateJwk.kty).toBe("RSA");
    expect(typeof privateJwk.d).toBe("string");

    await jwkDialog
      .getByRole("button", { name: UI_TEXT.jwk.reveal, exact: true })
      .click();
    await expect(getCodeBlock(jwkDialog)).toContainText('"d"');

    await jwkDialog.getByRole("button", { name: "PEM", exact: true }).click();
    await expect(getCodeBlock(jwkDialog)).toContainText(
      "-----BEGIN PRIVATE KEY-----",
    );

    const privatePemDownload = page.waitForEvent("download");
    await jwkDialog
      .getByRole("button", { name: UI_TEXT.jwk.download, exact: true })
      .click();
    const privatePemFile = await privatePemDownload;
    expect(privatePemFile.suggestedFilename()).toMatch(
      /^jwk-private-[\w-]+\.pem$/,
    );
    expect(await readDownloadedText(privatePemFile)).toContain(
      "-----BEGIN PRIVATE KEY-----",
    );

    await jwkDialog
      .getByRole("tab", { name: UI_TEXT.jwk.publicKeyTab, exact: true })
      .click();
    await expect(getCodeBlock(jwkDialog)).toContainText(
      "-----BEGIN PUBLIC KEY-----",
    );

    await jwkDialog.getByRole("button", { name: "JWK", exact: true }).click();
    const publicJwkDownload = page.waitForEvent("download");
    await jwkDialog
      .getByRole("button", { name: UI_TEXT.jwk.download, exact: true })
      .click();
    const publicJwkFile = await publicJwkDownload;
    expect(publicJwkFile.suggestedFilename()).toMatch(
      /^jwk-public-[\w-]+\.json$/,
    );

    const publicJwk = JSON.parse(await readDownloadedText(publicJwkFile)) as
      Record<string, unknown>;
    for (const member of privateRsaJwkMembers) {
      expect(publicJwk).not.toHaveProperty(member);
    }
    // Both files describe the same key pair.
    expect(publicJwk.kid).toBe(privateJwk.kid);

    await discardGeneratedKeyPair(jwkDialog);
  });

  test("confirms before throwing away an unsaved key pair", async ({ page }) => {
    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    const jwkDialog = await openGenerateJwkDialog(page);
    await generateJwkKeyPair(jwkDialog);

    await jwkDialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(jwkDialog.getByText(UI_TEXT.jwk.discardConfirm)).toBeVisible();

    await jwkDialog
      .getByRole("button", { name: UI_TEXT.jwk.keepKeys, exact: true })
      .click();
    await expect(jwkDialog.getByText(UI_TEXT.jwk.discardConfirm)).toHaveCount(0);
    await expect(
      jwkDialog.getByRole("button", { name: UI_TEXT.jwk.usePublicKey, exact: true }),
    ).toBeVisible();

    await discardGeneratedKeyPair(jwkDialog);

    // Discarding drops the key material - reopening starts from the algorithm form.
    const reopenedJwkDialog = await openGenerateJwkDialog(page);
    await expect(
      reopenedJwkDialog.getByRole("button", {
        name: UI_TEXT.jwk.generate,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      reopenedJwkDialog.getByRole("button", {
        name: UI_TEXT.jwk.usePublicKey,
        exact: true,
      }),
    ).toHaveCount(0);

    // Nothing was generated this time, so cancelling closes without a prompt. The
    // secret form underneath is aria-hidden while the nested dialog is open, so it
    // can only be asserted on once the generate dialog is gone.
    await reopenedJwkDialog
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(reopenedJwkDialog).toBeHidden();
    await expect(getSecretValueTextarea(addSecretDialog)).toHaveValue("");
  });

  test("omits the key size for EC algorithms and generates a P-256 key", async ({
    page,
  }) => {
    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    const jwkDialog = await openGenerateJwkDialog(page);
    await expect(
      jwkDialog.getByText(UI_TEXT.jwk.keySize, { exact: true }),
    ).toBeVisible();

    await selectJwkAlgorithm(page, jwkDialog, UI_TEXT.jwk.algorithms.es256);
    await expect(
      jwkDialog.getByText(UI_TEXT.jwk.keySize, { exact: true }),
    ).toHaveCount(0);

    await generateJwkKeyPair(jwkDialog);
    await acknowledgeAndUsePublicKey(jwkDialog);

    const publicJwk = await readSecretValueAsJwk(addSecretDialog);
    expect(publicJwk.kty).toBe("EC");
    expect(publicJwk.crv).toBe("P-256");
    expect(publicJwk.alg).toBe("ES256");
    expect(typeof publicJwk.x).toBe("string");
    expect(typeof publicJwk.y).toBe("string");
    expect(publicJwk).not.toHaveProperty("d");
  });

  test("rejects JWK values that are not a single public key", async ({ page }) => {
    const addSecretDialog = await openAddSecretDialog(page);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);

    const secretValue = getSecretValueTextarea(addSecretDialog);

    await secretValue.fill('{"kty":"RSA","n":"sXchDf-Wc","e":"AQAB","d":"XdWWWfBK"}');
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.validation.privateMember, {
        exact: true,
      }),
    ).toBeVisible();

    // A value that cannot be stored must not be submittable either.
    await addSecretDialog
      .getByRole("button", { name: "Save", exact: true })
      .click();
    await expect(addSecretDialog).toBeVisible();
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.validation.privateMember, {
        exact: true,
      }),
    ).toBeVisible();

    await secretValue.fill("not-a-json-document");
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.validation.invalidJson, {
        exact: true,
      }),
    ).toBeVisible();

    await secretValue.fill('{"keys":[{"kty":"RSA","n":"sXchDf-Wc","e":"AQAB"}]}');
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.validation.keySetNotSupported, {
        exact: true,
      }),
    ).toBeVisible();

    await secretValue.fill('{"kty":"oct"}');
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.validation.symmetricNotSupported, {
        exact: true,
      }),
    ).toBeVisible();

    await secretValue.fill(validPublicRsaJwk);
    await expect(
      addSecretDialog.getByText(UI_TEXT.jwk.publicKeyValidated, { exact: true }),
    ).toBeVisible();
  });

  test("clears the secret value when the secret type changes", async ({ page }) => {
    const addSecretDialog = await openAddSecretDialog(page);

    // A shared secret must never survive into a JWK field - it would be stored
    // unhashed as a public key, and a JWK moved the other way would be hashed.
    await getSecretValueInput(addSecretDialog).fill("SharedSecretValue_1!");
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.jwkType);
    await expect(getSecretValueTextarea(addSecretDialog)).toHaveValue("");

    await getSecretValueTextarea(addSecretDialog).fill(validPublicRsaJwk);
    await selectSecretType(page, addSecretDialog, UI_TEXT.secrets.sharedSecretType);
    await expect(getSecretValueInput(addSecretDialog)).toHaveValue("");
  });
});
