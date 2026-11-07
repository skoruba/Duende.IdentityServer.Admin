import type { APIResponse, Page } from "@playwright/test";

/**
 * Talks to the Admin API through the same proxy and cookie session as the SPA,
 * so a test can prepare data the UI cannot produce (NULL columns from older
 * versions, values set by other tools) and read back exactly what got stored.
 * The page has to be logged in first.
 */
const API_PREFIX = "/identity-server-admin-api/api";

export type ApiEntity = Record<string, unknown>;

/**
 * The developer exception page echoes the request headers - the bearer token
 * and the session cookies - so only its first line goes into a test report.
 */
async function describeFailure(response: APIResponse, action: string): Promise<string> {
  const firstLine = (await response.text()).split(/\r?\n/, 1)[0].slice(0, 500);
  return `${action} failed with ${response.status()}: ${firstLine}`;
}

async function readJson<T>(response: APIResponse, action: string): Promise<T> {
  if (!response.ok()) {
    throw new Error(await describeFailure(response, action));
  }

  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

function apiUrl(path: string): string {
  return `${API_PREFIX}/${path.replace(/^\/+/, "")}`;
}

const headers = {
  "X-ANTI-CSRF": "1",
  Accept: "application/json",
};

export async function apiGet<T = ApiEntity>(page: Page, path: string): Promise<T> {
  const response = await page.request.get(apiUrl(path), { headers });
  return readJson<T>(response, `GET ${path}`);
}

export async function apiPost<T = ApiEntity>(
  page: Page,
  path: string,
  data: unknown,
): Promise<T> {
  const response = await page.request.post(apiUrl(path), { headers, data });
  return readJson<T>(response, `POST ${path}`);
}

export async function apiDelete(page: Page, path: string): Promise<void> {
  const response = await page.request.delete(apiUrl(path), { headers });
  if (!response.ok() && response.status() !== 404) {
    throw new Error(await describeFailure(response, `DELETE ${path}`));
  }
}

/**
 * Waits for the save of an edit form: the PUT the SPA sends to the given API
 * resource has to succeed.
 */
export function waitForApiPut(page: Page, resource: string): Promise<APIResponse> {
  const resourcePath = apiUrl(resource).toLowerCase();

  return page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      new URL(response.url()).pathname.toLowerCase() === resourcePath,
    { timeout: 60_000 },
  );
}
