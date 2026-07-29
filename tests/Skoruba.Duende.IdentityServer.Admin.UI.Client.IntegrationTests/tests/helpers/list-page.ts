import { expect, type Locator, type Page } from "@playwright/test";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./auth";
import { UI_TEXT } from "./ui-texts";

type FindSingleRowBySearchOptions = {
  page: Page;
  searchTerm: string;
  rowLocator: Locator;
  entityName: string;
  timeoutMs?: number;
};

function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/g, "");
  return trimmed.length === 0 ? "/" : trimmed.toLowerCase();
}

export async function ensureLoggedInAndOpenListPage(
  page: Page,
  credentials: LoginCredentials,
  path: string,
): Promise<void> {
  await ensureLoggedInAndOpenClients(page, credentials);
  await page.goto(path);
  await expect(page).toHaveURL((url) => {
    return normalizePath(url.pathname) === normalizePath(path);
  });
}

/**
 * Opens a row action menu and picks one of its items.
 *
 * The grid re-renders once the search results settle, which unmounts the row and
 * closes an already open menu. Retrying just the item click cannot recover from
 * that - the trigger has to be clicked again - so the whole open-and-verify step
 * is retried instead.
 */
export async function clickRowMenuItem(
  page: Page,
  row: Locator,
  itemName: string,
): Promise<void> {
  const trigger = row.getByRole("button", {
    name: UI_TEXT.actions.openMenu,
    exact: true,
  });
  const menuItem = page.getByRole("menuitem", { name: itemName, exact: true });

  // The click has to happen inside the retried block: the menu can close again
  // between a visibility check and a separate click.
  await expect(async () => {
    await trigger.click();
    await menuItem.click({ timeout: 2_000 });
  }).toPass({ timeout: 60_000 });
}

export async function findSingleRowBySearch({
  page,
  searchTerm,
  rowLocator,
  entityName,
  timeoutMs = 90_000,
}: FindSingleRowBySearchOptions): Promise<Locator> {
  const searchInput = page.locator("input[type='text']").first();
  const searchButton = page.getByRole("button", {
    name: UI_TEXT.actions.search,
  });
  const timeoutAt = Date.now() + timeoutMs;

  while (Date.now() < timeoutAt) {
    await searchInput.fill(searchTerm);
    await searchButton.click();

    if ((await rowLocator.count()) === 1) {
      return rowLocator;
    }

    await page.waitForTimeout(500);
  }

  throw new Error(`${entityName} '${searchTerm}' was not found in list.`);
}
