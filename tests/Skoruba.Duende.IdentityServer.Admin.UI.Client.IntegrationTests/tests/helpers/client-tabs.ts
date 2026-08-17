import { expect, type Page } from "@playwright/test";
import { UI_TEXT } from "./ui-texts";

/**
 * The client edit form hides the tabs that the client's grant types make
 * irrelevant, so a test that walks every tab has to turn the override on
 * first. The switch only appears when something is actually hidden.
 */
export async function showAllClientSettings(page: Page): Promise<void> {
  const toggle = page.getByRole("switch", {
    name: UI_TEXT.clientTabs.showAllSettings,
  });

  await expect(toggle).toBeVisible();

  if ((await toggle.getAttribute("data-state")) !== "checked") {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute("data-state", "checked");
}
