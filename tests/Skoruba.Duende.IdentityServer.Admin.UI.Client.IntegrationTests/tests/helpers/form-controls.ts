import { expect, type Locator, type Page } from "@playwright/test";
import { UI_TEXT } from "./ui-texts";

const textInputNameByLabel: Record<string, string> = {
  "Front Channel Logout Uri": "frontChannelLogoutUri",
  "Back Channel Logout Uri": "backChannelLogoutUri",
  "Pair Wise Subject Salt": "pairWiseSubjectSalt",
  "Initiate Login Uri": "initiateLoginUri",
  "Client Uri": "clientUri",
  "Logo Uri": "logoUri",
  "User Code Type": "userCodeType",
  "Client Claims Prefix": "clientClaimsPrefix",
};

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function fillTextInputByLabel(
  panel: Locator,
  label: string,
  value: string,
): Promise<void> {
  const fieldName = textInputNameByLabel[label];
  const input = fieldName
    ? panel.locator(`input[name="${fieldName}"]`).first()
    : panel.getByRole("textbox", { name: label, exact: true }).first();

  await expect(input).toBeVisible();
  await input.fill(value);
}

export async function expectTextInputByLabel(
  panel: Locator,
  label: string,
  value: string,
): Promise<void> {
  const fieldName = textInputNameByLabel[label];
  const input = fieldName
    ? panel.locator(`input[name="${fieldName}"]`).first()
    : panel.getByRole("textbox", { name: label, exact: true }).first();

  await expect(input).toHaveValue(value);
}

export async function fillNumberByLabel(
  panel: Locator,
  label: string,
  value: number,
): Promise<void> {
  const input = panel.getByRole("spinbutton", { name: label, exact: true }).first();

  await expect(input).toBeVisible();
  await input.fill(String(value));
}

export async function expectNumberByLabel(
  panel: Locator,
  label: string,
  value: number,
): Promise<void> {
  const input = panel.getByRole("spinbutton", { name: label, exact: true }).first();
  await expect(input).toHaveValue(String(value));
}

export async function fillTimeByLabel(
  panel: Locator,
  label: string,
  value: string,
): Promise<void> {
  const input = panel.getByLabel(label, { exact: true }).first();

  await expect(input).toBeVisible();
  await input.fill(value);
}

export async function expectTimeByLabel(
  panel: Locator,
  label: string,
  valuePrefix: string,
): Promise<void> {
  const input = panel.getByLabel(label, { exact: true }).first();
  await expect(input).toHaveValue(new RegExp(`^${escapeForRegex(valuePrefix)}`));
}

export async function setSwitchByLabel(
  panel: Locator,
  label: string,
  checked: boolean,
): Promise<void> {
  const switchControl = panel.getByRole("switch", { name: label, exact: true });

  await expect(switchControl).toBeVisible();
  const currentState = (await switchControl.getAttribute("data-state")) === "checked";

  if (currentState !== checked) {
    await switchControl.click();
  }

  await expect(switchControl).toHaveAttribute(
    "data-state",
    checked ? "checked" : "unchecked",
  );
}

export async function expectSwitchByLabel(
  panel: Locator,
  label: string,
  checked: boolean,
): Promise<void> {
  const switchControl = panel.getByRole("switch", { name: label, exact: true });
  await expect(switchControl).toHaveAttribute(
    "data-state",
    checked ? "checked" : "unchecked",
  );
}

export async function setSwitchByIndex(
  panel: Locator,
  index: number,
  checked: boolean,
): Promise<void> {
  const switchControl = panel.getByRole("switch").nth(index);

  await expect(switchControl).toBeVisible();
  const currentState = (await switchControl.getAttribute("data-state")) === "checked";

  if (currentState !== checked) {
    await switchControl.click();
  }

  await expect(switchControl).toHaveAttribute(
    "data-state",
    checked ? "checked" : "unchecked",
  );
}

export async function expectSwitchByIndex(
  panel: Locator,
  index: number,
  checked: boolean,
): Promise<void> {
  const switchControl = panel.getByRole("switch").nth(index);
  await expect(switchControl).toHaveAttribute(
    "data-state",
    checked ? "checked" : "unchecked",
  );
}

export async function addInputWithTableItemByLabel(
  panel: Locator,
  label: string,
  value: string,
  placeholder: "Enter item" | "Search" = UI_TEXT.placeholders.enterItem,
): Promise<void> {
  const inputs = panel.getByPlaceholder(placeholder);
  const addButtons = panel.getByRole("button", {
    name: UI_TEXT.actions.addItem,
    exact: true,
  });
  const inputCount = await inputs.count();
  const index = inputCount > 1 && /post\s+logout/i.test(label) ? 1 : 0;

  const input = inputs.nth(index);
  await expect(input).toBeVisible();
  await input.fill(value);
  await addButtons.nth(index).click();
  await expect(panel.getByRole("cell", { name: value })).toBeVisible();
}

export async function expectInputWithTableHasItem(
  panel: Locator,
  _label: string,
  value: string,
): Promise<void> {
  await expect(panel.getByRole("cell", { name: value })).toBeVisible();
}

export async function setDualListToAllSelected(
  panel: Locator,
  _label: string,
): Promise<void> {
  const deselectAll = panel.getByRole("button", {
    name: UI_TEXT.actions.deselectAll,
    exact: true,
  }).first();
  const selectAll = panel
    .getByRole("button", { name: UI_TEXT.actions.selectAll, exact: true })
    .first();

  await expect(selectAll).toBeVisible();

  if (await deselectAll.isVisible().catch(() => false)) {
    await deselectAll.click();
  }

  await selectAll.click();
}

/**
 * Moves a single dual list item between the columns. The row buttons carry only
 * an arrow icon, so the item is found by its label and the column by the bulk
 * action button above it.
 */
export async function setDualListItemSelected(
  panel: Locator,
  itemLabel: string,
  selected: boolean,
): Promise<void> {
  const getColumn = (bulkAction: string): Locator =>
    panel
      .getByRole("button", { name: bulkAction, exact: true })
      .first()
      .locator("xpath=ancestor::div[1]");
  const getRow = (column: Locator): Locator =>
    column.locator("tbody tr").filter({
      has: panel.page().getByRole("cell", { name: itemLabel, exact: true }),
    });

  const availableRow = getRow(getColumn(UI_TEXT.actions.selectAll));
  const selectedRow = getRow(getColumn(UI_TEXT.actions.deselectAll));
  const sourceRow = selected ? availableRow : selectedRow;
  const targetRow = selected ? selectedRow : availableRow;

  // The items arrive asynchronously - wait until the item shows up somewhere.
  await expect(sourceRow.or(targetRow)).toBeVisible();

  if ((await targetRow.count()) === 0) {
    await sourceRow.getByRole("button").click();
  }

  await expect(targetRow).toBeVisible();
}

export async function getDualListSelectedRowCount(panel: Locator): Promise<number> {
  const deselectAllButton = panel.getByRole("button", {
    name: UI_TEXT.actions.deselectAll,
    exact: true,
  });
  await expect(deselectAllButton).toBeVisible();

  const selectedColumn = deselectAllButton.locator("xpath=ancestor::div[1]");
  await expect(selectedColumn.locator("table tbody")).toBeVisible();

  return selectedColumn.locator("tbody tr").count();
}

export async function selectDifferentOptionByLabel(
  page: Page,
  panel: Locator,
  label: string,
  fallbackComboboxIndex: number = 0,
): Promise<string> {
  const namedTrigger = panel.getByRole("combobox", { name: label, exact: true });
  const hasNamedTrigger = (await namedTrigger.count()) > 0;
  const trigger = hasNamedTrigger
    ? namedTrigger.first()
    : panel.getByRole("combobox").nth(fallbackComboboxIndex);

  await expect(trigger).toBeVisible();

  const currentValue = ((await trigger.textContent()) ?? "").trim();
  await trigger.click();

  const options = page.locator('[role="option"]:visible');
  await expect(options.first()).toBeVisible();

  const optionCount = await options.count();
  let selectedText = ((await options.first().textContent()) ?? "").trim();
  let selectedIndex = 0;

  for (let index = 0; index < optionCount; index++) {
    const optionText = ((await options.nth(index).textContent()) ?? "").trim();
    if (!optionText) {
      continue;
    }

    if (optionText !== currentValue) {
      selectedText = optionText;
      selectedIndex = index;
      break;
    }

    if (index === 0) {
      selectedText = optionText;
      selectedIndex = index;
    }
  }

  await options.nth(selectedIndex).click();
  await expect(trigger).toContainText(selectedText);
  return selectedText;
}

export async function expectSelectValueByLabel(
  panel: Locator,
  label: string,
  expectedValueLabel: string,
  fallbackComboboxIndex: number = 0,
): Promise<void> {
  const namedTrigger = panel.getByRole("combobox", { name: label, exact: true });
  const hasNamedTrigger = (await namedTrigger.count()) > 0;
  const trigger = hasNamedTrigger
    ? namedTrigger.first()
    : panel.getByRole("combobox").nth(fallbackComboboxIndex);

  await expect(trigger).toContainText(expectedValueLabel);
}

export async function getSelectValueByLabel(
  panel: Locator,
  label: string,
  fallbackComboboxIndex: number = 0,
): Promise<string> {
  const namedTrigger = panel.getByRole("combobox", { name: label, exact: true });
  const hasNamedTrigger = (await namedTrigger.count()) > 0;
  const trigger = hasNamedTrigger
    ? namedTrigger.first()
    : panel.getByRole("combobox").nth(fallbackComboboxIndex);

  await expect(trigger).toBeVisible();
  return ((await trigger.textContent()) ?? "").trim();
}
