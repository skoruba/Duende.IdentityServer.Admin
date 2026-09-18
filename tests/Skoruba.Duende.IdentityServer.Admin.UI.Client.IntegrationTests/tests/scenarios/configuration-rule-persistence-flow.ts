import { faker } from "@faker-js/faker";
import { expect, type Locator, type Page } from "@playwright/test";
import { type LoginCredentials } from "../helpers/auth";
import {
  ensureLoggedInAndOpenConfigurationRules,
  findConfigurationRuleRowByType,
  findConfigurationRuleRowsByType,
} from "../helpers/configuration-rules-list";
import {
  addInputWithTableItemByLabel,
  expectSwitchByIndex,
  setSwitchByIndex,
} from "../helpers/form-controls";
import { createDebugLogger } from "../helpers/debug-log";
import { ensureLoggedInAndOpenListPage } from "../helpers/list-page";
import { UI_TEXT } from "../helpers/ui-texts";

type RuleDefinition = {
  ruleType: string;
  optionDisplayName: string;
  resourceType: string;
  issueType: "Warning" | "Recommendation" | "Error";
  messageTemplate: string;
  fixDescription: string;
  fillParameters: (dialog: Locator) => Promise<void>;
  assertParameters: (dialog: Locator) => Promise<void>;
};

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRowActionButtons(row: Locator): Locator {
  return row.locator("td").last().getByRole("button");
}

async function openCreateRuleDialog(page: Page): Promise<Locator> {
  await page
    .getByRole("button", { name: new RegExp(UI_TEXT.configurationRules.addNewRule, "i") })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(UI_TEXT.configurationRules.addNewRule, { exact: true }),
  ).toBeVisible();
  return dialog;
}

async function closeDialog(dialog: Locator): Promise<void> {
  await dialog
    .getByRole("button", { name: new RegExp(UI_TEXT.actions.close, "i") })
    .click();
  await expect(dialog).not.toBeVisible();
}

async function selectRuleType(
  page: Page,
  dialog: Locator,
  optionDisplayName: string,
  resourceType: string,
): Promise<void> {
  const ruleTypeCombobox = dialog.getByRole("combobox").first();
  await ruleTypeCombobox.click();

  const optionPattern = new RegExp(
    `^${escapeForRegex(optionDisplayName)}\\s*\\(${escapeForRegex(resourceType)}\\)$`,
    "i",
  );

  await page.getByRole("option", { name: optionPattern }).click();
  await expect(ruleTypeCombobox).toContainText(optionDisplayName);
}

async function selectIssueType(
  page: Page,
  dialog: Locator,
  issueType: "Warning" | "Recommendation" | "Error",
  isEditMode: boolean,
): Promise<void> {
  const issueTypeCombobox = dialog.getByRole("combobox").nth(isEditMode ? 0 : 1);
  await issueTypeCombobox.click();
  await page.getByRole("option", { name: issueType, exact: true }).click();
  await expect(issueTypeCombobox).toContainText(issueType);
}

async function expectIssueType(
  dialog: Locator,
  issueType: "Warning" | "Recommendation" | "Error",
): Promise<void> {
  await expect(dialog.getByRole("combobox").first()).toContainText(issueType);
}

async function deleteRuleByTypeIfPresent(
  page: Page,
  ruleType: string,
): Promise<void> {
  const rows = findConfigurationRuleRowsByType(page, ruleType);

  while ((await rows.count()) > 0) {
    const existingCount = await rows.count();
    const firstRow = rows.first();
    const actionButtons = getRowActionButtons(firstRow);

    page.once("dialog", (dialog) => {
      void dialog.accept();
    });

    await actionButtons.nth(1).click();
    await expect(rows).toHaveCount(existingCount - 1, {
      timeout: 60_000,
    });
  }
}

async function openEditRuleDialog(
  page: Page,
  ruleType: string,
): Promise<Locator> {
  const row = await findConfigurationRuleRowByType(page, ruleType);
  const actionButtons = getRowActionButtons(row);
  await actionButtons.first().click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(UI_TEXT.configurationRules.editRule, { exact: true }),
  ).toBeVisible();
  return dialog;
}

/** Array parameters come prefilled with the rule's defaults - start from nothing. */
async function replaceArrayParameter(
  dialog: Locator,
  label: string,
  values: string[],
): Promise<void> {
  const deleteButtons = dialog.getByRole("button", { name: /^Delete$/i });

  while ((await deleteButtons.count()) > 0) {
    await deleteButtons.first().click();
  }

  for (const value of values) {
    await addInputWithTableItemByLabel(dialog, label, value);
  }
}

async function expectArrayParameter(
  dialog: Locator,
  values: string[],
): Promise<void> {
  for (const value of values) {
    await expect(
      dialog.getByRole("cell", { name: value, exact: true }),
    ).toBeVisible();
  }
}

async function createRule(
  page: Page,
  definition: RuleDefinition,
  allowRetryOnDuplicate: boolean = true,
): Promise<void> {
  const dialog = await openCreateRuleDialog(page);
  await selectRuleType(
    page,
    dialog,
    definition.optionDisplayName,
    definition.resourceType,
  );

  await selectIssueType(page, dialog, definition.issueType, false);
  await dialog.locator('input[name="messageTemplate"]').fill(definition.messageTemplate);
  await dialog.locator('textarea[name="fixDescription"]').fill(definition.fixDescription);
  await definition.fillParameters(dialog);

  const duplicateError = dialog.getByText(
    UI_TEXT.configurationRules.duplicateRuleError,
    { exact: true },
  );
  if ((await duplicateError.count()) > 0) {
    await closeDialog(dialog);

    if (!allowRetryOnDuplicate) {
      throw new Error(
        `Rule '${definition.ruleType}' is still duplicate after cleanup attempt.`,
      );
    }

    await deleteRuleByTypeIfPresent(page, definition.ruleType);
    await createRule(page, definition, false);
    return;
  }

  const saveButton = dialog.locator('button[type="submit"]').first();
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(dialog).not.toBeVisible();
}

async function verifyRuleRow(page: Page, ruleType: string): Promise<void> {
  const row = await findConfigurationRuleRowByType(page, ruleType);
  await expect(row.getByRole("switch").first()).toHaveAttribute(
    "data-state",
    "checked",
  );
}

async function verifySavedRuleInEditDialog(
  page: Page,
  definition: RuleDefinition,
): Promise<void> {
  const dialog = await openEditRuleDialog(page, definition.ruleType);

  await expect(dialog.locator('input[name="messageTemplate"]')).toHaveValue(
    definition.messageTemplate,
  );
  await expect(dialog.locator('textarea[name="fixDescription"]')).toHaveValue(
    definition.fixDescription,
  );

  await expectIssueType(dialog, definition.issueType);
  await definition.assertParameters(dialog);
  await closeDialog(dialog);
}

async function verifyDuplicateRuleTypePrevention(
  page: Page,
  definition: RuleDefinition,
): Promise<void> {
  const dialog = await openCreateRuleDialog(page);
  await selectRuleType(
    page,
    dialog,
    definition.optionDisplayName,
    definition.resourceType,
  );

  await expect(
    dialog.getByText(
      UI_TEXT.configurationRules.duplicateRuleError,
      { exact: true },
    ),
  ).toBeVisible();

  const saveButton = dialog.locator('button[type="submit"]').first();
  await expect(saveButton).toBeDisabled();
  await closeDialog(dialog);

  const ruleRows = findConfigurationRuleRowsByType(page, definition.ruleType);
  await expect(ruleRows).toHaveCount(1);
}

export async function runCreateAndVerifyConfigurationRulesFlow(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  const logStep = createDebugLogger("configuration-rules-flow");

  const marker = faker.string.alphanumeric({ length: 8, casing: "lower" });

  const maxLifetimeSeconds = faker.number.int({ min: 1200, max: 5400 });
  const requiredPrefixA = `scope_${marker}_`;
  const requiredPrefixB = `api_${marker}_`;
  const defaultFapiAlgorithms = ["PS256", "ES256"];
  const customFapiAlgorithms = ["PS256", "ES256", "EdDSA"];

  const definitions: RuleDefinition[] = [
    {
      ruleType: "ClientRedirectUrisMustUseHttps",
      optionDisplayName: "Client Redirect URIs Must Use HTTPS",
      resourceType: "Client",
      issueType: "Warning",
      messageTemplate: `UI test message ${marker} (https)`,
      fixDescription: `UI test fix ${marker} (https)`,
      fillParameters: async (dialog) => {
        await setSwitchByIndex(dialog, 1, false);
      },
      assertParameters: async (dialog) => {
        await expectSwitchByIndex(dialog, 1, false);
      },
    },
    {
      ruleType: "ClientAccessTokenLifetimeTooLong",
      optionDisplayName: "Client Access Token Lifetime Too Long",
      resourceType: "Client",
      issueType: "Error",
      messageTemplate: `UI test message ${marker} (access-token)`,
      fixDescription: `UI test fix ${marker} (access-token)`,
      fillParameters: async (dialog) => {
        await dialog.getByRole("spinbutton").first().fill(String(maxLifetimeSeconds));
      },
      assertParameters: async (dialog) => {
        await expect(dialog.getByRole("spinbutton").first()).toHaveValue(
          String(maxLifetimeSeconds),
        );
      },
    },
    {
      ruleType: "ApiScopeNameMustStartWith",
      optionDisplayName: "API Scope Name Must Start With",
      resourceType: "ApiScope",
      issueType: "Recommendation",
      messageTemplate: `UI test message ${marker} (scope-prefix)`,
      fixDescription: `UI test fix ${marker} (scope-prefix)`,
      fillParameters: async (dialog) => {
        await replaceArrayParameter(dialog, "Required Prefixes", [
          requiredPrefixA,
          requiredPrefixB,
        ]);
      },
      assertParameters: async (dialog) => {
        await expectArrayParameter(dialog, [requiredPrefixA, requiredPrefixB]);
      },
    },
    // The FAPI rules share one parameter shape but belong to different resource
    // types, so each of them has to make it through the dialog on its own.
    {
      ruleType: "ClientSigningAlgorithmsMustBeFapiCompliant",
      optionDisplayName: "Client Signing Algorithms Must Be FAPI 2.0 Compliant",
      resourceType: "Client",
      issueType: "Error",
      messageTemplate: `UI test message ${marker} (client-fapi)`,
      fixDescription: `UI test fix ${marker} (client-fapi)`,
      fillParameters: async (dialog) => {
        await expectArrayParameter(dialog, defaultFapiAlgorithms);
        await replaceArrayParameter(
          dialog,
          "Allowed Algorithms",
          customFapiAlgorithms,
        );
      },
      assertParameters: async (dialog) => {
        await expectArrayParameter(dialog, customFapiAlgorithms);
      },
    },
    {
      ruleType: "ApiResourceSigningAlgorithmsMustBeFapiCompliant",
      optionDisplayName:
        "API Resource Signing Algorithms Must Be FAPI 2.0 Compliant",
      resourceType: "ApiResource",
      issueType: "Warning",
      messageTemplate: `UI test message ${marker} (api-resource-fapi)`,
      fixDescription: `UI test fix ${marker} (api-resource-fapi)`,
      fillParameters: async (dialog) => {
        await expectArrayParameter(dialog, defaultFapiAlgorithms);
        await replaceArrayParameter(dialog, "Allowed Algorithms", ["ES256"]);
      },
      assertParameters: async (dialog) => {
        await expectArrayParameter(dialog, ["ES256"]);
        await expect(
          dialog.getByRole("cell", { name: "PS256", exact: true }),
        ).toHaveCount(0);
      },
    },
  ];

  await ensureLoggedInAndOpenConfigurationRules(page, credentials);
  logStep("opened configuration rules list");

  for (const definition of definitions) {
    await deleteRuleByTypeIfPresent(page, definition.ruleType);
    logStep(`removed existing '${definition.ruleType}' entries`);

    await createRule(page, definition);
    logStep(`created '${definition.ruleType}'`);

    await verifyRuleRow(page, definition.ruleType);
    logStep(`verified '${definition.ruleType}' is present and enabled`);

    await verifySavedRuleInEditDialog(page, definition);
    logStep(`verified persisted values for '${definition.ruleType}'`);

    await verifyDuplicateRuleTypePrevention(page, definition);
    logStep(`verified duplicate prevention for '${definition.ruleType}'`);
  }
}

async function openConfigurationIssues(
  page: Page,
  credentials: LoginCredentials,
): Promise<void> {
  // The table renders empty while loading, so "no such issue" is only true once
  // the issues have actually arrived.
  const issuesLoaded = page.waitForResponse(
    (response) =>
      /\/api\/ConfigurationIssues\?/i.test(response.url()) && response.ok(),
    { timeout: 60_000 },
  );
  await ensureLoggedInAndOpenListPage(page, credentials, "/configuration-issues");
  await issuesLoaded;

  await expect(
    page.getByRole("heading", { name: UI_TEXT.configurationIssues.pageTitle }),
  ).toBeVisible();
}

async function searchConfigurationIssues(
  page: Page,
  searchTerm: string,
): Promise<Locator> {
  await page
    .getByRole("button", { name: UI_TEXT.configurationIssues.filters })
    .click();
  await page
    .getByPlaceholder(UI_TEXT.configurationIssues.searchPlaceholder)
    .fill(searchTerm);

  return page.locator("table tbody tr").filter({ hasText: searchTerm });
}

async function setRuleEnabled(
  page: Page,
  ruleType: string,
  enabled: boolean,
): Promise<void> {
  const row = await findConfigurationRuleRowByType(page, ruleType);
  const toggle = row.getByRole("switch").first();
  const expectedState = enabled ? "checked" : "unchecked";

  if ((await toggle.getAttribute("data-state")) !== expectedState) {
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() !== "GET" &&
        /\/api\/ConfigurationRules/i.test(response.url()) &&
        response.ok(),
    );
    await toggle.click();
    await saved;
  }

  await expect(toggle).toHaveAttribute("data-state", expectedState);
}

/**
 * Follows one rule all the way to the user: an enabled rule turns into an issue
 * with its placeholders filled in, the issue leads to the client, and disabling
 * the rule makes the issue go away again.
 */
export async function runConfigurationRuleReportsIssueFlow(
  page: Page,
  credentials: LoginCredentials,
  seededClientId: string,
): Promise<void> {
  const logStep = createDebugLogger("configuration-rule-issue-flow");
  const marker = faker.string.alphanumeric({ length: 8, casing: "lower" });

  // No client id starts with this, so the seeded client is bound to be reported.
  const requiredPrefix = `zz_${marker}_`;
  const expectedMessage = `UI test ${marker} [${seededClientId}] must start with ${requiredPrefix}`;
  const expectedFix = `UI test fix ${marker}: rename to ${requiredPrefix}`;

  const definition: RuleDefinition = {
    ruleType: "ClientIdMustStartWith",
    optionDisplayName: "Client ID Must Start With",
    resourceType: "Client",
    issueType: "Error",
    messageTemplate: `UI test ${marker} [{actualClientId}] must start with {allowedPrefixes}`,
    fixDescription: `UI test fix ${marker}: rename to {allowedPrefixes}`,
    fillParameters: async (dialog) => {
      await replaceArrayParameter(dialog, "Required Prefixes", [requiredPrefix]);
    },
    assertParameters: async (dialog) => {
      await expectArrayParameter(dialog, [requiredPrefix]);
    },
  };

  await ensureLoggedInAndOpenConfigurationRules(page, credentials);
  await deleteRuleByTypeIfPresent(page, definition.ruleType);
  await createRule(page, definition);
  await verifyRuleRow(page, definition.ruleType);
  logStep(`created and enabled '${definition.ruleType}'`);

  try {
    await openConfigurationIssues(page, credentials);
    const issueRow = await searchConfigurationIssues(
      page,
      `${marker} [${seededClientId}]`,
    );

    await expect(issueRow).toHaveCount(1);
    await expect(issueRow).toContainText(expectedMessage);
    await expect(issueRow).toContainText("Error");
    logStep("found the issue with its placeholders filled in");

    await issueRow.getByRole("link", { name: seededClientId }).click();
    await expect(page).toHaveURL(/\/client\/\d+(?:[/?#]|$)/i);
    await expect(page.locator('input[name="clientId"]')).toHaveValue(
      seededClientId,
      { timeout: 60_000 },
    );

    await page
      .getByRole("button", { name: UI_TEXT.configurationIssues.showIssues })
      .click();
    await expect(page.getByText(expectedMessage)).toBeVisible();
    await expect(page.getByText(expectedFix)).toBeVisible();
    logStep("followed the issue to the client detail");
  } finally {
    // An enabled rule nobody can satisfy would report every client in the store.
    await ensureLoggedInAndOpenConfigurationRules(page, credentials);
    await setRuleEnabled(page, definition.ruleType, false);
    logStep(`disabled '${definition.ruleType}'`);
  }

  await openConfigurationIssues(page, credentials);
  await expect(await searchConfigurationIssues(page, marker)).toHaveCount(0);
  logStep("the issue is gone once the rule is disabled");
}
