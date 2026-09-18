import { expect, test, type Route } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import {
  findClientRow,
  openClientDetailFromClients,
} from "./helpers/client-list";
import { clickRowMenuItem } from "./helpers/list-page";
import { clickPageSave } from "./helpers/ui-navigation";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

const dashboardEndpointPattern = "**/api/Dashboard/GetDashboardIdentityServer?*";
const configurationIssuesEndpointPattern = "**/api/ConfigurationIssues?*";
const createEmptyConfigurationIssuesResponse = () => ({
  issues: [],
  totalCount: 0,
  pageIndex: 0,
  pageSize: 50,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

test.describe("Admin UI regressions", () => {
  test("delete action from clients grid does not leave the page blocked", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const targetRow = await findClientRow(page, seedData.expectedClientId);
    const deleteClientHandler = async (route: Route) => {
      if (route.request().method() !== "DELETE") {
        await route.fallback();
        return;
      }

      await route.fulfill({
        status: 204,
        body: "",
      });
    };

    await page.route("**/api/Clients/*", deleteClientHandler);

    await clickRowMenuItem(page, targetRow, "Delete");

    const deleteDialog = page.getByRole("alertdialog");
    await expect(deleteDialog).toBeVisible();
    await deleteDialog
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    await expect(deleteDialog).toBeHidden();

    await page
      .getByRole("button", { name: "Add New Client", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "New Client", exact: true }),
    ).toBeVisible();

    await page.unroute("**/api/Clients/*", deleteClientHandler);
  });

  test("401 dashboard response opens unauthorized screen and sign in again returns to home", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const dashboard401Handler = async (route: Route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    };

    await page.route(dashboardEndpointPattern, dashboard401Handler);

    await page.goto("/");

    await expect(page).toHaveURL(/\/unauthorized(?:[/?#]|$)/i);
    await expect(
      page.getByRole("heading", { name: "Sign-in required", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Your admin API session is no longer valid. Sign in again to continue.",
        { exact: true },
      ),
    ).toBeVisible();

    const signInAgainButton = page.getByRole("button", {
      name: "Sign in again",
      exact: true,
    });
    const loginRequestPromise = page.waitForRequest((request) => {
      const url = new URL(request.url());
      return /\/[Aa]ccount\/[Ll]ogin$/.test(url.pathname);
    });

    await signInAgainButton.click({ noWaitAfter: true });

    const loginRequest = await loginRequestPromise;
    expect(new URL(loginRequest.url()).searchParams.get("returnUrl")).toBe("/");

    await page.unroute(dashboardEndpointPattern, dashboard401Handler);
  });

  test("403 dashboard response redirects to access denied", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const dashboard403Handler = async (route: Route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    };

    await page.route(dashboardEndpointPattern, dashboard403Handler);

    await page.goto("/");

    await expect(page).toHaveURL(/\/access-denied(?:[/?#]|$)/i);
    await expect(
      page.getByRole("heading", { name: "Access Denied", exact: true }),
    ).toBeVisible();

    await page.unroute(dashboardEndpointPattern, dashboard403Handler);
  });

  test("client detail shows configuration issues loading state without empty zero-issues block", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    let releaseConfigurationIssuesRequest: (() => void) | null = null;
    const configurationIssuesGate = new Promise<void>((resolve) => {
      releaseConfigurationIssuesRequest = resolve;
    });

    const configurationIssuesHandler = async (route: Route) => {
      await configurationIssuesGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(createEmptyConfigurationIssuesResponse()),
      });
    };

    await page.route(
      configurationIssuesEndpointPattern,
      configurationIssuesHandler,
    );

    const targetRow = await findClientRow(page, seedData.expectedClientId);
    await targetRow.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i);
    await expect(
      page.getByText("Checking issues...", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Configuration issues for this resource", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("0 issue(s) detected", { exact: true }),
    ).toHaveCount(0);

    releaseConfigurationIssuesRequest?.();

    await expect(
      page.getByText("Checking issues...", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Configuration issues for this resource", { exact: true }),
    ).toHaveCount(0);

    await page.unroute(
      configurationIssuesEndpointPattern,
      configurationIssuesHandler,
    );
  });

  test("client edit validation summary keeps hidden-tab number errors visible with field label", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const targetRow = await findClientRow(page, seedData.expectedClientId);
    await targetRow.getByRole("link").first().click();

    await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i);

    await page.getByRole("tab", { name: "Advanced", exact: true }).click();
    await page.getByRole("tab", { name: "Tokens", exact: true }).click();
    await page.getByRole("tab", { name: "Refresh Token", exact: true }).click();

    const refreshTokenPanel = page.getByRole("tabpanel", {
      name: "Refresh Token",
      exact: true,
    });
    await expect(refreshTokenPanel).toBeVisible();

    const absoluteRefreshTokenLifetimeInput = refreshTokenPanel.getByRole(
      "spinbutton",
      { name: "Absolute Refresh Token Lifetime", exact: true },
    );
    await absoluteRefreshTokenLifetimeInput.fill("");

    await page.getByRole("tab", { name: "Basics", exact: true }).click();
    await clickPageSave(page);

    await expect(
      page.getByText("Please fix the following errors", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Absolute Refresh Token Lifetime: Please enter a valid number",
        { exact: true },
      ),
    ).toBeVisible();
  });

  test("dual list keeps its move buttons inside the column when the names are long", async ({
    page,
  }) => {
    // Narrow enough for the seeded scope names not to fit next to the button.
    await page.setViewportSize({ width: 700, height: 900 });
    await openClientDetailFromClients(page, seedData.expectedClientId, credentials);
    await page.getByRole("tab", { name: "Scopes", exact: true }).click();

    const scopesPanel = page.getByRole("tabpanel", { name: "Scopes", exact: true });
    await expect(scopesPanel.locator("tbody tr").first()).toBeVisible();

    // A long name used to widen the table instead of being truncated, which
    // pushed the button out of the column and behind a horizontal scrollbar.
    const columns = await scopesPanel
      .locator("div.max-h-\\[300px\\]")
      .evaluateAll((boxes) =>
        boxes.map((box) => {
          const scrollBox = box.querySelector("div.overflow-auto") ?? box;
          const rightEdge = box.getBoundingClientRect().left + box.clientWidth;
          const leftEdge = box.getBoundingClientRect().left;
          const buttons = Array.from(box.querySelectorAll("tbody button"));

          return {
            rows: buttons.length,
            hasHorizontalScroll: scrollBox.scrollWidth > scrollBox.clientWidth + 1,
            clippedButtons: buttons.filter((button) => {
              const rect = button.getBoundingClientRect();
              return rect.right > rightEdge + 1 || rect.left < leftEdge - 1;
            }).length,
          };
        }),
      );

    expect(columns).toHaveLength(2);
    expect(columns.reduce((total, column) => total + column.rows, 0)).toBeGreaterThan(0);

    for (const column of columns) {
      expect(column.hasHorizontalScroll).toBe(false);
      expect(column.clippedButtons).toBe(0);
    }
  });
});
