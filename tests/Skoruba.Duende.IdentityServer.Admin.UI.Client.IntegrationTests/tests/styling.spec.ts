import { expect, test, type Locator, type Page } from "@playwright/test";
import { loadE2ESeedData } from "../utils/seed-data";
import {
  ensureLoggedInAndOpenClients,
  type LoginCredentials,
} from "./helpers/auth";
import { openClientDetailFromClients } from "./helpers/client-list";
import { UI_TEXT } from "./helpers/ui-texts";

const seedData = loadE2ESeedData();
const credentials: LoginCredentials = {
  username: seedData.username,
  password: seedData.password,
};
const stsUrl = (process.env.E2E_STS_URL ?? "https://localhost:44310").replace(
  /\/+$/g,
  "",
);

const desktop = { width: 1280, height: 800 };
const wide = { width: 1500, height: 800 };
const phone = { width: 390, height: 844 };

type Rgba = [number, number, number, number];

/**
 * The color a design token renders as, read through a probe element so the
 * tests never repeat a value from the stylesheet.
 */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `hsl(var(${name}))`;
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

/** A color with an alpha channel on top of a token, e.g. `hover:bg-primary/90`. */
async function tokenColorWithAlpha(
  page: Page,
  token: string,
  alpha: number,
): Promise<string> {
  return page.evaluate(
    ([name, value]) => {
      const probe = document.createElement("span");
      probe.style.color = `hsl(var(${name}) / ${value})`;
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    },
    [token, String(alpha)] as const,
  );
}

/**
 * Paints a color onto a canvas and reads the pixel back. Tailwind 4 writes
 * `color-mix()` for opacity modifiers, which the browser reports in another
 * color space than the `rgba()` of a token; the painted pixels are the same.
 */
async function paint(page: Page, color: string): Promise<Rgba> {
  return page.evaluate((value) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D context is not available");
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return Array.from(context.getImageData(0, 0, 1, 1).data) as Rgba;
  }, color);
}

async function expectSameColor(
  page: Page,
  actual: string,
  expected: string,
): Promise<void> {
  const [actualPixel, expectedPixel] = await Promise.all([
    paint(page, actual),
    paint(page, expected),
  ]);
  for (let channel = 0; channel < 4; channel++) {
    expect(
      Math.abs(actualPixel[channel] - expectedPixel[channel]),
      `${actual} should paint like ${expected}`,
    ).toBeLessThanOrEqual(2);
  }
}

/**
 * Compares a computed color with the expected one. It polls, because hover
 * and focus colors arrive through a transition.
 */
async function expectColor(
  page: Page,
  locator: Locator,
  property: string,
  expected: string,
  pseudo?: string,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const [actualPixel, expectedPixel] = await Promise.all([
          paint(page, await computed(locator, property, pseudo)),
          paint(page, expected),
        ]);
        return Math.max(
          ...actualPixel.map((value, channel) =>
            Math.abs(value - expectedPixel[channel]),
          ),
        );
      },
      { message: `${property} should paint like ${expected}`, timeout: 5_000 },
    )
    .toBeLessThanOrEqual(2);
}

async function computed(
  locator: Locator,
  property: string,
  pseudo?: string,
): Promise<string> {
  return locator.evaluate(
    (element, [name, pseudoElement]) =>
      getComputedStyle(element, pseudoElement || undefined).getPropertyValue(
        name,
      ),
    [property, pseudo ?? ""] as const,
  );
}

type ShadowLayer = { color: string; offsets: string };

/** Splits a computed `box-shadow` into its layers; colors carry commas too. */
function shadowLayers(boxShadow: string): ShadowLayer[] {
  if (boxShadow === "none") return [];
  return boxShadow.split(/,(?![^(]*\))/).map((layer) => {
    const match = layer.trim().match(/^(.*\))\s+(.+)$/);
    if (!match) throw new Error(`Unexpected box-shadow layer: ${layer}`);
    return { color: match[1], offsets: match[2] };
  });
}

function visibleShadowLayers(boxShadow: string): ShadowLayer[] {
  return shadowLayers(boxShadow).filter(
    (layer) => !layer.color.startsWith("rgba(0, 0, 0, 0)"),
  );
}

/** The ring of a focused control: a 2px offset in the page color and a 2px ring on top of it. */
async function expectFocusRing(
  page: Page,
  control: Locator,
  options: { ring: string; offset: string },
): Promise<void> {
  await control.focus();
  const layers = shadowLayers(await computed(control, "box-shadow"));
  const offset = layers.find((layer) => layer.offsets === "0px 0px 0px 2px");
  const ring = layers.find((layer) => layer.offsets === "0px 0px 0px 4px");
  expect(offset, "ring offset layer").toBeDefined();
  expect(ring, "ring layer").toBeDefined();
  await expectSameColor(page, offset!.color, options.offset);
  await expectSameColor(page, ring!.color, options.ring);
}

async function expectSmallShadow(card: Locator): Promise<void> {
  const layers = visibleShadowLayers(await computed(card, "box-shadow"));
  expect(layers).toEqual([
    { color: "rgba(0, 0, 0, 0.05)", offsets: "0px 1px 2px 0px" },
  ]);
}

async function switchAdminTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((value) => {
    localStorage.setItem("vite-ui-theme", value);
  }, theme);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));
}

test.describe("Admin UI styling", () => {
  test.use({ viewport: desktop });

  test("design tokens color the page and its controls", async ({ page }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    const body = page.locator("body");
    await expectColor(
      page,
      body,
      "background-color",
      await tokenColor(page, "--background"),
    );
    await expectColor(
      page,
      body,
      "color",
      await tokenColor(page, "--foreground"),
    );
    expect(await computed(body, "font-family")).toMatch(/^ui-sans-serif/);

    // The primary button
    const addClient = page.getByRole("button", {
      name: UI_TEXT.wizard.addNewClient,
    });
    await expectColor(
      page,
      addClient,
      "background-color",
      await tokenColor(page, "--primary"),
    );
    await expectColor(
      page,
      addClient,
      "color",
      await tokenColor(page, "--primary-foreground"),
    );
    expect(await computed(addClient, "border-radius")).toBe("6px");
    expect(await computed(addClient, "cursor")).toBe("pointer");

    // A border without a color utility takes the border token, not the text color
    const row = page.locator("table tbody tr").first();
    await expectColor(
      page,
      row,
      "border-bottom-color",
      await tokenColor(page, "--border"),
    );

    // The search field
    const search = page.locator("input[type='text']").first();
    await expectColor(
      page,
      search,
      "border-color",
      await tokenColor(page, "--input"),
    );
    await expectColor(
      page,
      search,
      "background-color",
      await tokenColor(page, "--background"),
    );
    await expectColor(
      page,
      search,
      "color",
      await tokenColor(page, "--muted-foreground"),
      "::placeholder",
    );
    expect(await computed(search, "border-radius")).toBe("6px");
    expect(await computed(search, "height")).toBe("40px");
  });

  test("cards, tabs and form items keep their shadows, corners and spacing", async ({
    page,
  }) => {
    await openClientDetailFromClients(
      page,
      seedData.expectedClientId,
      credentials,
    );

    const card = page
      .locator("div.rounded-lg.border.bg-card")
      .filter({ visible: true })
      .first();
    await expectSmallShadow(card);
    expect(await computed(card, "border-top-left-radius")).toBe("8px");
    await expectColor(
      page,
      card,
      "border-color",
      await tokenColor(page, "--border"),
    );

    const tab = page.getByRole("tab").first();
    expect(await computed(tab, "border-radius")).toBe("4px");

    // A form item puts 8px between its label row and its control
    const item = page
      .getByRole("textbox")
      .first()
      .locator(
        "xpath=ancestor::*[contains(concat(' ', normalize-space(@class), ' '), ' space-y-2 ')][1]",
      );
    const [labelBox, controlBox] = await Promise.all([
      item.locator("xpath=./*[1]").boundingBox(),
      item.locator("xpath=./*[2]").boundingBox(),
    ]);
    expect(labelBox).not.toBeNull();
    expect(controlBox).not.toBeNull();
    expect(
      Math.round(controlBox!.y - (labelBox!.y + labelBox!.height)),
    ).toBe(8);
  });

  test("focus, hover and open states style their targets", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);

    await expectFocusRing(page, page.locator("input[type='text']").first(), {
      ring: await tokenColor(page, "--ring"),
      offset: await tokenColor(page, "--background"),
    });

    const row = page.locator("table tbody tr").first();
    await row.hover();
    await expectColor(
      page,
      row,
      "background-color",
      await tokenColorWithAlpha(page, "--muted", 0.5),
    );

    // A dialog enters with the tw-animate-css animation and the duration the component sets
    await page
      .getByRole("button", { name: UI_TEXT.wizard.addNewClient })
      .click();
    const dialog = page.getByRole("dialog", {
      name: UI_TEXT.wizard.newClientDialog,
    });
    await expect(dialog).toBeVisible();
    expect(await computed(dialog, "animation-name")).toBe("enter");
    expect(await computed(dialog, "animation-duration")).toBe("0.2s");

    const overlay = page.locator("div.fixed.inset-0").first();
    await expectColor(
      page,
      overlay,
      "background-color",
      "rgba(0, 0, 0, 0.5)",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the dark theme switches the tokens and the dark variants", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);
    const lightBackground = await computed(
      page.locator("body"),
      "background-color",
    );
    const sun = page.locator("header svg.lucide-sun");
    const moon = page.locator("header svg.lucide-moon");
    expect((await sun.boundingBox())?.width).toBeGreaterThan(10);
    expect((await moon.boundingBox())?.width ?? 0).toBeLessThan(1);

    await switchAdminTheme(page, "dark");
    await expect(
      page.getByRole("heading", { name: UI_TEXT.auth.clientsHeading }),
    ).toBeVisible();

    const darkBackground = await computed(
      page.locator("body"),
      "background-color",
    );
    expect(darkBackground).not.toBe(lightBackground);
    await expectSameColor(
      page,
      darkBackground,
      await tokenColor(page, "--background"),
    );

    // `dark:` variants: the theme toggle hides the sun and shows the moon
    expect((await sun.boundingBox())?.width ?? 0).toBeLessThan(1);
    expect((await moon.boundingBox())?.width).toBeGreaterThan(10);

    await page
      .getByRole("button", { name: UI_TEXT.wizard.addNewClient })
      .click();
    const overlay = page.locator("div.fixed.inset-0").first();
    await expect(overlay).toBeVisible();
    await expectColor(
      page,
      overlay,
      "background-color",
      "rgba(0, 0, 0, 0.7)",
    );
  });

  test("the container and the responsive variants follow the viewport", async ({
    page,
  }) => {
    await ensureLoggedInAndOpenClients(page, credentials);
    const container = page.locator("header div.container");
    const userName = page.locator("header").getByText(seedData.username, {
      exact: true,
    });

    expect(await computed(container, "max-width")).toBe("none");
    expect(await computed(container, "padding-left")).toBe("32px");
    expect(await computed(container, "padding-right")).toBe("32px");
    await expect(userName).toBeVisible();

    await page.setViewportSize(wide);
    expect(await computed(container, "max-width")).toBe("1400px");
    const box = await container.boundingBox();
    expect(Math.round(box!.width)).toBe(1400);
    expect(box!.x).toBeGreaterThan(0);

    await page.setViewportSize(phone);
    expect(await computed(container, "max-width")).toBe("none");
    await expect(userName).toBeHidden();
  });
});

test.describe("STS styling", () => {
  test.use({ viewport: desktop });

  test("the login form is built from the component classes", async ({
    page,
  }) => {
    await page.goto(`${stsUrl}/Account/Login`);

    const login = page.locator("button[name='button'][value='login']");
    await expectColor(
      page,
      login,
      "background-color",
      await tokenColor(page, "--primary"),
    );
    await expectColor(
      page,
      login,
      "color",
      await tokenColor(page, "--primary-foreground"),
    );
    expect(await computed(login, "border-radius")).toBe("6px");
    expect(await computed(login, "height")).toBe("40px");
    expect(await computed(login, "cursor")).toBe("pointer");
    await login.hover();
    await expectColor(
      page,
      login,
      "background-color",
      await tokenColorWithAlpha(page, "--primary", 0.9),
    );

    const username = page.locator("#Username");
    await expectColor(
      page,
      username,
      "border-color",
      await tokenColor(page, "--input"),
    );
    await expectColor(
      page,
      username,
      "background-color",
      await tokenColor(page, "--background"),
    );
    expect(await computed(username, "border-radius")).toBe("6px");
    expect(await computed(username, "height")).toBe("40px");
    await expectFocusRing(page, username, {
      ring: await tokenColor(page, "--ring"),
      offset: await tokenColor(page, "--background"),
    });

    const card = page.locator(".card").first();
    await expectSmallShadow(card);
    expect(await computed(card, "border-top-left-radius")).toBe("8px");
    await expectColor(
      page,
      card,
      "border-color",
      await tokenColor(page, "--border"),
    );

    // Chromium reports no radius for a native checkbox, so only its size is checked
    const remember = page.locator("#RememberLogin");
    expect(await computed(remember, "width")).toBe("16px");
    expect(await computed(remember, "height")).toBe("16px");

    // A native select keeps the page background
    const language = page.locator("footer select");
    await expectColor(
      page,
      language,
      "background-color",
      await tokenColor(page, "--background"),
    );

    // The validation summary of a failed login
    await login.click();
    const alert = page.locator(".alert-destructive");
    await expect(alert).toBeVisible();
    await expectColor(
      page,
      alert,
      "color",
      await tokenColor(page, "--destructive"),
    );
    await expectColor(
      page,
      alert,
      "border-color",
      await tokenColorWithAlpha(page, "--destructive", 0.5),
    );
  });

  test("the theme toggle switches the tokens and the dark variants", async ({
    page,
  }) => {
    await page.goto(`${stsUrl}/Account/Login`);
    const body = page.locator("body");
    const logo = page.locator("img.dark\\:invert").first();
    const lightBackground = await computed(body, "background-color");
    expect(await computed(logo, "filter")).toBe("none");

    await page.locator("#theme-toggle").click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const darkBackground = await computed(body, "background-color");
    expect(darkBackground).not.toBe(lightBackground);
    await expectSameColor(
      page,
      darkBackground,
      await tokenColor(page, "--background"),
    );
    await expectSameColor(
      page,
      await computed(page.locator(".card").first(), "background-color"),
      await tokenColor(page, "--card"),
    );
    expect(await computed(logo, "filter")).toBe("invert(1)");
  });

  test("the layout, the gradient tiles and the mobile menu follow the viewport", async ({
    page,
  }) => {
    await page.goto(`${stsUrl}/`);

    const tile = page.locator(".bg-linear-to-br").first();
    expect(await computed(tile, "background-image")).toMatch(
      /^linear-gradient\(/,
    );

    const container = page.locator("header nav.container");
    const mobileMenu = page.locator("header details summary");
    expect(await computed(container, "max-width")).toBe("none");
    expect(await computed(container, "padding-left")).toBe("32px");
    await expect(mobileMenu).toBeHidden();

    await page.setViewportSize(wide);
    expect(await computed(container, "max-width")).toBe("1400px");
    expect(Math.round((await container.boundingBox())!.width)).toBe(1400);

    await page.setViewportSize(phone);
    expect(await computed(container, "max-width")).toBe("none");
    await expect(mobileMenu).toBeVisible();
  });
});
