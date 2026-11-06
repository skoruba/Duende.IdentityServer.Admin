import { expect, type Locator, type Page } from "@playwright/test";
import { type LoginCredentials } from "./auth";
import { ensureLoggedInAndOpenListPage } from "./list-page";

export async function ensureLoggedInAndOpenConfigurationRules(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  await ensureLoggedInAndOpenListPage(
    page,
    credentials,
    "/configuration-rules",
  );
  await expect(
    page.getByRole("heading", { name: /Configuration Rules/i }),
  ).toBeVisible();
}

/**
 * The list shows the readable name of a rule; its key is the title of the name cell,
 * so a seeded built-in rule is found by key as well as one the test created.
 */
export function findConfigurationRuleRowsByType(
  page: Page,
  ruleType: string,
): Locator {
  return page
    .locator("table tbody tr")
    .filter({ has: page.locator(`[title="${ruleType}"]`) });
}

export async function findConfigurationRuleRowByType(
  page: Page,
  ruleType: string,
): Promise<Locator> {
  const rows = findConfigurationRuleRowsByType(page, ruleType);
  const timeoutAt = Date.now() + 90_000;

  while (Date.now() < timeoutAt) {
    const count = await rows.count();
    if (count > 0) {
      return rows.first();
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`Configuration rule '${ruleType}' was not found in list.`);
}
