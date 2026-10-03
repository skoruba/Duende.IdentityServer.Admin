import { expect, test } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

// AdminConfiguration:BasicConfiguration:IdentityManagementEnabled reaches the SPA
// through GET /configuration of the Admin UI host. The tests answer that request
// themselves, so they run against the default environment, where the flag is on.
const configurationEndpointPattern = "**/configuration";
// GetDashboardIdentity has no parameters; the wildcard would also catch
// GetDashboardIdentityServer, which the dashboard asks for either way.
const identityEndpointPatterns = [
  "**/api/Users**",
  "**/api/Roles**",
  "**/api/Dashboard/GetDashboardIdentity",
];

test.describe("Admin UI with identity management switched off", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(configurationEndpointPattern, (route) =>
      route.fulfill({ json: { identityManagementEnabled: false } }),
    );
  });

  test("hides users and roles from the navigation, the dashboard and the command palette", async ({
    page,
  }) => {
    const identityRequests: string[] = [];
    for (const pattern of identityEndpointPatterns) {
      await page.route(pattern, async (route) => {
        identityRequests.push(route.request().url());
        await route.fallback();
      });
    }

    await ensureLoggedInAndOpenClients(page, credentials);

    const header = page.locator("header");
    await expect(
      header.getByRole("button", { name: UI_TEXT.navigation.clientsResources }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: UI_TEXT.navigation.providersKeys }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: UI_TEXT.navigation.identityManagement }),
    ).toHaveCount(0);

    await page.goto("/");
    const main = page.locator("main");
    await expect(
      main.getByText(UI_TEXT.navigation.providersKeys, { exact: true }),
    ).toBeVisible();
    await expect(
      main.getByText(UI_TEXT.navigation.identityManagement, { exact: true }),
    ).toHaveCount(0);

    await page
      .getByRole("button", { name: UI_TEXT.commandPalette.trigger })
      .filter({ visible: true })
      .first()
      .click();
    const palette = page.getByRole("dialog");
    await expect(
      palette.getByRole("option", { name: UI_TEXT.quickActions.newClient }),
    ).toBeVisible();
    for (const name of [
      UI_TEXT.quickActions.newUser,
      UI_TEXT.quickActions.newRole,
      UI_TEXT.navigation.users,
      UI_TEXT.navigation.roles,
    ]) {
      await expect(
        palette.getByRole("option", { name, exact: true }),
      ).toHaveCount(0);
    }

    // The search asks for clients, resources and scopes, but not for users.
    const clientsSearched = page.waitForResponse(
      (response) =>
        response.url().includes("/api/Clients") &&
        response.url().includes(encodeURIComponent(seedData.expectedUserName)),
    );
    await expect(
      palette.getByPlaceholder(UI_TEXT.commandPalette.placeholder),
    ).toHaveCount(0);
    await palette
      .getByPlaceholder(UI_TEXT.commandPalette.placeholderWithoutUsers)
      .fill(seedData.expectedUserName);
    await clientsSearched;
    await expect(
      palette.getByText(UI_TEXT.commandPalette.searching),
    ).toHaveCount(0);
    await expect(
      palette.getByRole("group", { name: UI_TEXT.navigation.users }),
    ).toHaveCount(0);

    expect(identityRequests).toEqual([]);
  });

  test("leads the user and role pages to the dashboard", async ({ page }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    for (const path of ["/users", "/user-profile", "/roles", "/role/1/users"]) {
      await page.goto(path);

      await expect(page).toHaveURL((url) => url.pathname === "/");
      await expect(
        page
          .locator("main")
          .getByText(UI_TEXT.navigation.clientsResources, { exact: true }),
      ).toBeVisible();
    }
  });
});
