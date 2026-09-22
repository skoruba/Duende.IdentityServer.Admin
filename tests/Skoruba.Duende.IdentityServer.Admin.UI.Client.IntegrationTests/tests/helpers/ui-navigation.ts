import { expect, type Locator, type Page } from "@playwright/test";
import { UI_TEXT } from "./ui-texts";

type OpenTabAndWaitOptions = {
  useVisiblePanelFallback?: boolean;
};

export async function openTabAndWait(
  page: Page,
  tabName: RegExp,
  options: OpenTabAndWaitOptions = {},
): Promise<Locator> {
  await page.getByRole("tab", { name: tabName }).click();

  const panel = options.useVisiblePanelFallback
    ? page.locator('[role="tabpanel"]:visible').first()
    : page.getByRole("tabpanel", { name: tabName });

  await expect(panel).toBeVisible();
  return panel;
}

/**
 * A local action - copying a value, taking over a generated key - confirms itself in
 * place. The toast region has to stay empty for it.
 */
export async function expectNoToast(page: Page): Promise<void> {
  await expect(
    page.getByRole("region", { name: /notifications/i }).getByRole("status"),
  ).toHaveCount(0);
}

export async function clickPageSave(page: Page): Promise<void> {
  await page
    .locator('button[type="submit"]')
    .filter({ hasText: UI_TEXT.actions.save })
    .first()
    .click();
}
