import { expect, test } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import { type LoginCredentials } from "./helpers/auth";
import { ensureLoggedInAndOpenConfigurationRules } from "./helpers/configuration-rules-list";
import {
  runConfigurationRuleReportsIssueFlow,
  runCreateAndVerifyConfigurationRulesFlow,
} from "./scenarios/configuration-rule-persistence-flow";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};

test.describe("Admin UI Configuration Rules", () => {
  test("opens configuration rules page", async ({ page }) => {
    await ensureLoggedInAndOpenConfigurationRules(page, credentials);

    await expect(
      page.getByRole("button", {
        name: new RegExp(UI_TEXT.configurationRules.addNewRule, "i"),
      }),
    ).toBeVisible();
    await expect(page.locator("table").first()).toBeVisible();
  });

  test("creates rules with different property types and prevents duplicates", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await runCreateAndVerifyConfigurationRulesFlow(page, credentials);
  });

  test("enabled rule reports an issue that leads to the client and disappears once disabled", async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await runConfigurationRuleReportsIssueFlow(
      page,
      credentials,
      seedData.expectedClientId,
    );
  });
});
