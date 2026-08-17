import { describe, expect, it } from "vitest";
import {
  SnippetClientConfig,
  SnippetDocument,
  SnippetOptions,
  buildAuthorizationCodeSnippet,
  buildClientCredentialsSnippet,
  toApplicationName,
} from "./dotnetSnippets";

const client = (
  overrides: Partial<SnippetClientConfig> = {},
): SnippetClientConfig => ({
  clientId: "my_client",
  scopes: ["openid", "profile", "invoices.read"],
  requireClientSecret: true,
  requirePkce: true,
  allowOfflineAccess: false,
  requirePushedAuthorization: false,
  requireDPoP: false,
  redirectUris: ["https://localhost:5002/signin-oidc"],
  postLogoutRedirectUris: ["https://localhost:5002/signout-callback-oidc"],
  ...overrides,
});

const options = (overrides: Partial<SnippetOptions> = {}): SnippetOptions => ({
  authority: "https://localhost:44310",
  appName: "my-app",
  apiBaseUrl: "https://localhost:5001",
  useUserSecrets: true,
  clientAuthentication: "shared_secret",
  ...overrides,
});

const stepIds = (document: SnippetDocument) =>
  document.steps.map((step) => step.id);

const codeOf = (document: SnippetDocument, stepId: string) =>
  document.steps
    .find((step) => step.id === stepId)!
    .blocks.map((block) => block.code)
    .join("\n");

const noteKeys = (document: SnippetDocument, stepId: string) =>
  (document.steps.find((step) => step.id === stepId)?.notes ?? []).map(
    (note) => note.key,
  );

describe("buildAuthorizationCodeSnippet", () => {
  it("takes the callback paths from the client's URIs", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({
          redirectUris: ["https://app.example.com/callback/oidc"],
          postLogoutRedirectUris: ["https://app.example.com/callback/signedout"],
        }),
        options(),
      ),
      "program",
    );

    expect(program).toContain('options.CallbackPath = "/callback/oidc";');
    expect(program).toContain(
      'options.SignedOutCallbackPath = "/callback/signedout";',
    );
  });

  it("falls back to the defaults when the URIs are not absolute yet", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({ redirectUris: ["not-a-uri"], postLogoutRedirectUris: [] }),
        options(),
      ),
      "program",
    );

    expect(program).toContain('options.CallbackPath = "/signin-oidc";');
  });

  it("orders identity scopes first and offline_access last", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({
          scopes: ["invoices.read", "email", "openid", "profile"],
          allowOfflineAccess: true,
        }),
        options(),
      ),
      "program",
    );

    const scopes = [...program.matchAll(/options\.Scope\.Add\("(.+?)"\);/g)].map(
      (match) => match[1],
    );

    expect(scopes).toEqual([
      "openid",
      "profile",
      "email",
      "invoices.read",
      "offline_access",
    ]);
  });

  it("omits the secret for a public client and says why", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ requireClientSecret: false }),
      options(),
    );

    expect(codeOf(document, "program")).not.toContain("options.ClientSecret");
    expect(stepIds(document)).not.toContain("credential");
    expect(noteKeys(document, "program")).toContain(
      "Client.Integration.Notes.PublicClient",
    );
  });

  it("warns when PKCE is off or no redirect URI is configured", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ requirePkce: false, redirectUris: [] }),
      options(),
    );

    const warnings = (
      document.steps.find((step) => step.id === "program")?.warnings ?? []
    ).map((warning) => warning.key);

    expect(warnings).toContain("Client.Integration.Notes.PkceDisabled");
    expect(warnings).toContain("Client.Integration.Notes.NoRedirectUri");
  });

  it("requires pushed authorization only when the client does", () => {
    const withPar = codeOf(
      buildAuthorizationCodeSnippet(
        client({ requirePushedAuthorization: true }),
        options(),
      ),
      "program",
    );

    expect(withPar).toContain(
      "options.PushedAuthorizationBehavior = PushedAuthorizationBehavior.Require;",
    );
    expect(
      codeOf(buildAuthorizationCodeSnippet(client(), options()), "program"),
    ).not.toContain("PushedAuthorizationBehavior");
  });

  it("adds a separate proof key step when the client requires DPoP", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ requireDPoP: true }),
      options(),
    );

    expect(stepIds(document)).toContain("dpop-key");

    const dPoPStep = codeOf(document, "dpop-key");
    expect(dPoPStep).toContain("JsonWebKeyConverter.ConvertFromRSASecurityKey");
    expect(dPoPStep).toContain('dotnet user-secrets set "Oidc:DPoPJsonWebKey"');
  });

  it("replaces the secret with a signed assertion for private_key_jwt", () => {
    const document = buildAuthorizationCodeSnippet(
      client(),
      options({ clientAuthentication: "jwk" }),
    );

    expect(stepIds(document)).toContain("assertion");
    expect(codeOf(document, "program")).not.toContain("options.ClientSecret");
    expect(codeOf(document, "program")).toContain(
      "AddTransient<IClientAssertionService, ClientAssertionService>()",
    );
    expect(codeOf(document, "credential")).toContain("Oidc:SigningJwk");
    // The algorithm is read from the key rather than hard-coded.
    expect(codeOf(document, "assertion")).toContain("key.Alg ??");
  });

  it("registers the API HttpClient for a plain API scope, without offline access", () => {
    const document = buildAuthorizationCodeSnippet(
      client({
        scopes: ["openid", "profile", "invoices.read"],
        allowOfflineAccess: false,
        requireDPoP: false,
      }),
      options(),
    );

    expect(codeOf(document, "packages")).toContain(
      "Duende.AccessTokenManagement.OpenIdConnect",
    );
    expect(codeOf(document, "program")).toContain(
      'AddUserAccessTokenHttpClient("api"',
    );
  });

  it("leaves the API HttpClient out when only identity scopes are requested", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ scopes: ["openid", "profile"] }),
      options(),
    );

    expect(codeOf(document, "packages")).not.toContain(
      "Duende.AccessTokenManagement.OpenIdConnect",
    );
    expect(codeOf(document, "program")).not.toContain(
      "AddUserAccessTokenHttpClient",
    );
  });

  it("reads the authority and client id from configuration", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ clientId: "configured_client" }),
      options(),
    );

    expect(codeOf(document, "appsettings")).toContain('"configured_client"');
    expect(codeOf(document, "program")).toContain(
      'builder.Configuration["Oidc:ClientId"]',
    );
    expect(codeOf(document, "program")).not.toContain('"configured_client"');
  });
});

describe("buildClientCredentialsSnippet", () => {
  it("drops the identity scopes and reports which ones", () => {
    const document = buildClientCredentialsSnippet(
      client({ scopes: ["openid", "profile", "invoices.read"] }),
      options(),
    );

    expect(codeOf(document, "program")).toContain(
      'Scope.Parse("invoices.read")',
    );
    expect(codeOf(document, "program")).not.toContain("openid");

    const note = document.steps
      .find((step) => step.id === "program")!
      .notes!.find(
        (item) => item.key === "Client.Integration.Notes.IdentityScopesSkipped",
      );

    expect(note?.values).toEqual({ scopes: "openid, profile" });
  });

  it("warns when nothing but identity scopes is selected", () => {
    const document = buildClientCredentialsSnippet(
      client({ scopes: ["openid"] }),
      options(),
    );

    const warnings = document.steps
      .find((step) => step.id === "program")!
      .warnings!.map((warning) => warning.key);

    expect(warnings).toContain("Client.Integration.Notes.NoApiScope");
  });

  it("uses its own configuration section so both snippets can coexist", () => {
    const document = buildClientCredentialsSnippet(client(), options());

    expect(codeOf(document, "appsettings")).toContain("ClientCredentials");
    expect(codeOf(document, "credential")).toContain(
      "ClientCredentials:ClientSecret",
    );
  });

  it("always ends with the worker that calls the API", () => {
    expect(stepIds(buildClientCredentialsSnippet(client(), options()))).toEqual(
      expect.arrayContaining(["worker"]),
    );
  });
});

describe("shell snippets", () => {
  // A real JWK is full of double quotes, so the value cannot be double quoted.
  it.each([
    ["the client secret", options(), "credential"],
    ["the signing key", options({ clientAuthentication: "jwk" }), "credential"],
  ])("single quotes %s value", (_label, snippetOptions, stepId) => {
    const code = codeOf(
      buildAuthorizationCodeSnippet(client(), snippetOptions),
      stepId,
    );

    expect(code).toMatch(/dotnet user-secrets set "[^"]+" '[^']+'/);
  });

  it("single quotes the DPoP proof key value", () => {
    const code = codeOf(
      buildAuthorizationCodeSnippet(client({ requireDPoP: true }), options()),
      "dpop-key",
    );

    expect(code).toMatch(/dotnet user-secrets set "[^"]+" '[^']+'/);
  });
});

describe("names in the generated code", () => {
  it("names the HttpClient after the API rather than the application", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({ allowOfflineAccess: true }),
        options({ appName: "my-web-app" }),
      ),
      "program",
    );

    expect(program).toContain('AddUserAccessTokenHttpClient("api"');
    expect(program).toContain('options.Cookie.Name = "__Host-my-web-app";');
  });

  it("keeps the token client tied to the application, unlike the HttpClient", () => {
    const document = buildClientCredentialsSnippet(
      client(),
      options({ appName: "my-worker" }),
    );

    expect(codeOf(document, "program")).toContain('.AddClient("my-worker"');
    expect(codeOf(document, "program")).toContain(
      'AddClientCredentialsHttpClient("api"',
    );
    expect(codeOf(document, "program")).toContain(
      'ClientCredentialsClientName.Parse("my-worker")',
    );
    expect(codeOf(document, "worker")).toContain('CreateClient("api")');
  });
});

describe("toApplicationName", () => {
  it.each([
    ["my_web_app", "my-web-app"],
    ["  Spaced Client  ", "spaced-client"],
    ["--weird--", "weird"],
    ["", "my-app"],
    ["***", "my-app"],
    // Whatever the user types goes through here too: "__Host-My App" would not
    // be a valid cookie name.
    ["My App", "my-app"],
  ])("turns %j into %j", (value, expected) => {
    expect(toApplicationName(value)).toBe(expected);
  });
});
