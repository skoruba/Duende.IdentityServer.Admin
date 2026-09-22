import { expect, test } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import { findClientRow } from "./helpers/client-list";
import { showAllClientSettings } from "./helpers/client-tabs";
import { runCreateUpdateAndVerifyClientPersistence } from "./scenarios/client-persistence-flow";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

test.describe("Admin UI OIDC login", () => {
  test("logs in via STS and opens client detail from seeded data", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const clientsHeading = page.getByRole("heading", { name: "Clients" });
    await expect(clientsHeading).toBeVisible({ timeout: 60_000 });

    const clientLinks = page.locator('table tbody tr td a[href*="/client/"]');
    await expect(clientLinks.first()).toBeVisible();
    expect(await clientLinks.count()).toBeGreaterThan(0);

    const targetRow = await findClientRow(page, seedData.expectedClientId);
    await targetRow.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i);
    const clientIdInput = page.locator('input[name="clientId"]').first();
    await expect(clientIdInput).toHaveValue(seedData.expectedClientId, {
      timeout: 60_000,
    });
  });

  test("creates confidential client, updates all editable fields, and verifies persistence", async ({
    page,
  }) => {
    test.setTimeout(600_000);
    await runCreateUpdateAndVerifyClientPersistence(page, credentials);
  });

  test("hides tabs the grant types make irrelevant and brings them back on demand", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const targetRow = await findClientRow(page, seedData.expectedClientId);
    await targetRow.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i);
    await expect(page.locator('input[name="clientId"]')).toHaveValue(
      seedData.expectedClientId,
      { timeout: 60_000 },
    );

    // The seeded client only allows authorization_code, so the browser-based
    // tabs stay while the ones tied to other grants are gone.
    await expect(page.getByRole("tab", { name: "Urls", exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    await expect(
      page.getByRole("tab", { name: "Device Flow", exact: true }),
    ).toHaveCount(0);

    await page.getByRole("tab", { name: "Authorization", exact: true }).click();
    await expect(page.getByRole("tab", { name: "PKCE", exact: true })).toBeVisible();
    await expect(page.getByRole("tab", { name: "CIBA", exact: true })).toHaveCount(0);

    await showAllClientSettings(page);

    // The override brings every tab back without touching the client itself.
    await expect(
      page.getByRole("tab", { name: "CIBA", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Device Flow", exact: true }),
    ).toBeVisible();
  });
});
