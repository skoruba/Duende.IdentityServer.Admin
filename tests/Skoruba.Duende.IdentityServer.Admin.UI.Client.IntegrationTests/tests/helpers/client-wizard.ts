import { expect, type Page } from "@playwright/test";
import { UI_TEXT } from "./ui-texts";

export type WizardClientInput = {
  clientId: string;
  clientName: string;
  description: string;
  redirectUri: string;
  logoutUri: string;
  secretValue: string;
  secretDescription: string;
};

export async function createConfidentialClientViaWizard(
  page: Page,
  data: WizardClientInput,
): Promise<void> {
  await page.getByRole("button", { name: UI_TEXT.wizard.addNewClient }).click();

  const clientTypeDialog = page.getByRole("dialog", {
    name: UI_TEXT.wizard.newClientDialog,
  });
  await expect(clientTypeDialog).toBeVisible();
  await clientTypeDialog
    .getByRole("button", { name: UI_TEXT.actions.create })
    .first()
    .click();

  await expect(page.locator('input[name="clientId"]')).toBeVisible({
    timeout: 60_000,
  });
  await page.locator('input[name="clientId"]').fill(data.clientId);
  await page.locator('input[name="clientName"]').fill(data.clientName);
  await page.locator('textarea[name="description"]').fill(data.description);
  await page.getByRole("button", { name: UI_TEXT.actions.next }).click();

  await expect(page.locator('input[name="redirectUri"]')).toBeVisible({
    timeout: 30_000,
  });
  await page.locator('input[name="redirectUri"]').fill(data.redirectUri);
  await page.locator('input[name="logoutUri"]').fill(data.logoutUri);
  await page.getByRole("button", { name: UI_TEXT.actions.next }).click();

  await expect(
    page.getByRole("button", { name: UI_TEXT.actions.selectAll, exact: true }),
  ).toBeVisible({
    timeout: 30_000,
  });
  await page
    .getByRole("button", { name: UI_TEXT.actions.selectAll, exact: true })
    .click();
  await page.getByRole("button", { name: UI_TEXT.actions.next }).click();

  await expect(page.locator('input[name="secretValue"]')).toBeVisible({
    timeout: 30_000,
  });
  await page.locator('input[name="secretValue"]').fill(data.secretValue);
  await page
    .locator('textarea[name="secretDescription"]')
    .fill(data.secretDescription);
  await page.getByRole("button", { name: UI_TEXT.actions.next }).click();

  await expect(
    page.getByRole("heading", { name: UI_TEXT.wizard.reviewAndSubmit }),
  ).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: UI_TEXT.actions.save }).click();

  await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i, {
    timeout: 60_000,
  });
}
