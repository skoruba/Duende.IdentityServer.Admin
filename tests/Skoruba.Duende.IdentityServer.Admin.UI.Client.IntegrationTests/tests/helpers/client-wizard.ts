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

export type WizardClientBasics = Omit<
  WizardClientInput,
  "secretValue" | "secretDescription"
>;

/**
 * Opens the wizard for one client type. Every type card has the same "Create"
 * button, so the card is found by its heading - without a title the first card,
 * the confidential client, is used.
 */
export async function openClientWizard(
  page: Page,
  clientTypeTitle?: string,
): Promise<void> {
  await page.getByRole("button", { name: UI_TEXT.wizard.addNewClient }).click();

  const clientTypeDialog = page.getByRole("dialog", {
    name: UI_TEXT.wizard.newClientDialog,
  });
  await expect(clientTypeDialog).toBeVisible();

  const createButtons = clientTypeDialog.getByRole("button", {
    name: UI_TEXT.actions.create,
  });

  if (clientTypeTitle) {
    const heading = clientTypeDialog.getByRole("heading", {
      name: clientTypeTitle,
      exact: true,
    });
    // The button sits in the same text block as the heading of its card.
    await heading
      .locator("xpath=ancestor::div[1]")
      .getByRole("button", { name: UI_TEXT.actions.create })
      .click();
  } else {
    await createButtons.first().click();
  }

  await expect(page.locator('input[name="clientId"]')).toBeVisible({
    timeout: 60_000,
  });
}

/** Walks the basics, URIs and scopes steps and stops on the secret step. */
export async function fillWizardUpToSecretStep(
  page: Page,
  data: WizardClientBasics,
): Promise<void> {
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

  await expect(
    page.locator('textarea[name="secretDescription"]'),
  ).toBeVisible({
    timeout: 30_000,
  });
}

/** Leaves the secret step, saves on the review step and waits for the client detail. */
export async function finishWizardFromSecretStep(page: Page): Promise<void> {
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

export async function createConfidentialClientViaWizard(
  page: Page,
  data: WizardClientInput,
): Promise<void> {
  await openClientWizard(page);
  await fillWizardUpToSecretStep(page, data);

  await expect(page.locator('input[name="secretValue"]')).toBeVisible({
    timeout: 30_000,
  });
  await page.locator('input[name="secretValue"]').fill(data.secretValue);
  await page
    .locator('textarea[name="secretDescription"]')
    .fill(data.secretDescription);

  await finishWizardFromSecretStep(page);
}
