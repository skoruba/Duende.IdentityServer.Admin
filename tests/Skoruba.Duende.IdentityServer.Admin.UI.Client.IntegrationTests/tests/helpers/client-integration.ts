import { expect, type Locator, type Page } from "@playwright/test";
import { setDualListItemSelected } from "./form-controls";
import { UI_TEXT } from "./ui-texts";

/**
 * The tab's own state - open settings, picked scenario, left out scopes - lives
 * in the component and is gone once another tab is opened. Change the client
 * form first and open the tab last.
 */
export async function openIntegrationTab(page: Page): Promise<Locator> {
  await page
    .getByRole("tab", { name: UI_TEXT.integration.tab, exact: true })
    .click();

  const panel = page.getByRole("tabpanel", {
    name: UI_TEXT.integration.tab,
    exact: true,
  });
  await expect(panel).toBeVisible();
  return panel;
}

/** The trigger also carries the authority and application name summary. */
export function getIntegrationSettingsTrigger(panel: Locator): Locator {
  return panel.getByRole("button", {
    name: new RegExp(`^${UI_TEXT.integration.settings}`),
  });
}

export async function openIntegrationSettings(panel: Locator): Promise<void> {
  const trigger = getIntegrationSettingsTrigger(panel);
  await expect(trigger).toBeVisible();

  if ((await trigger.getAttribute("data-state")) !== "open") {
    await trigger.click();
  }

  await expect(trigger).toHaveAttribute("data-state", "open");
}

/** The option labels are not bound to their inputs, so the input is the label's sibling. */
export function getIntegrationOptionInput(
  panel: Locator,
  label: string,
): Locator {
  return panel
    .locator("label")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .locator("xpath=following-sibling::input[1]");
}

/** Client authentication is the only select on the tab. */
export function getClientAuthenticationSelect(panel: Locator): Locator {
  return panel.locator('button[role="combobox"]');
}

export async function selectClientAuthentication(
  page: Page,
  panel: Locator,
  optionLabel: string,
): Promise<void> {
  const trigger = getClientAuthenticationSelect(panel);
  await trigger.click();
  await page
    .getByRole("listbox")
    .getByRole("option", { name: optionLabel, exact: true })
    .click();
  await expect(trigger).toContainText(optionLabel);
}

/** "Keep secrets out of the code" is the only switch inside the tab panel. */
export function getUseUserSecretsSwitch(panel: Locator): Locator {
  return panel.getByRole("switch");
}

export function getScopeChip(panel: Locator, scope: string): Locator {
  return panel.getByRole("button", { name: scope, exact: true });
}

export function getScenarioTab(panel: Locator, scenario: string): Locator {
  return panel.getByRole("tab", { name: scenario, exact: true });
}

function getCodeBlocks(panel: Locator): Locator {
  return panel.locator("pre");
}

export async function expectSnippetToContain(
  panel: Locator,
  code: string,
): Promise<void> {
  await expect(
    getCodeBlocks(panel).filter({ hasText: code }).first(),
  ).toBeVisible();
}

export async function expectSnippetNotToContain(
  panel: Locator,
  code: string,
): Promise<void> {
  // Without this an empty tab would pass as "does not contain".
  await expect(getCodeBlocks(panel).first()).toBeVisible();
  await expect(getCodeBlocks(panel).filter({ hasText: code })).toHaveCount(0);
}

export function getSnippetStepHeading(panel: Locator, title: string): Locator {
  return panel.getByRole("heading", { name: title, exact: true });
}

/** Grant Types is the first sub tab of Advanced, so opening Advanced is enough. */
export async function setGrantTypeSelected(
  page: Page,
  grantTypeLabel: string,
  selected: boolean,
): Promise<void> {
  await page.getByRole("tab", { name: "Advanced", exact: true }).click();

  const advancedPanel = page.getByRole("tabpanel", {
    name: "Advanced",
    exact: true,
  });
  await expect(advancedPanel).toBeVisible();
  await setDualListItemSelected(advancedPanel, grantTypeLabel, selected);
}

export async function setAllowedScopeSelected(
  page: Page,
  scope: string,
  selected: boolean,
): Promise<void> {
  await page.getByRole("tab", { name: "Scopes", exact: true }).click();

  const scopesPanel = page.getByRole("tabpanel", {
    name: "Scopes",
    exact: true,
  });
  await expect(scopesPanel).toBeVisible();
  await setDualListItemSelected(scopesPanel, scope, selected);
}
