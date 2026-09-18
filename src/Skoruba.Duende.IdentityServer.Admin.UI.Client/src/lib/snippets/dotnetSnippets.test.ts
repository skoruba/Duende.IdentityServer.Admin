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

  it("says nothing about the callback paths when they are the framework defaults", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({
          // Neither is usable, so both fall back to what ASP.NET Core already does.
          redirectUris: ["not-a-uri"],
          postLogoutRedirectUris: [],
        }),
        options(),
      ),
      "program",
    );

    expect(program).not.toContain("options.CallbackPath");
    expect(program).not.toContain("options.SignedOutCallbackPath");
    expect(program).not.toContain("Must match the URIs registered");
  });

  it("mentions only the callback path that actually differs", () => {
    const program = codeOf(
      buildAuthorizationCodeSnippet(
        client({
          redirectUris: ["https://app.example.com/callback/oidc"],
          postLogoutRedirectUris: ["https://app.example.com/signout-callback-oidc"],
        }),
        options(),
      ),
      "program",
    );

    expect(program).toContain('options.CallbackPath = "/callback/oidc";');
    expect(program).not.toContain("options.SignedOutCallbackPath");
  });

  it("only mentions PKCE when it is turned off, because it is on by default", () => {
    expect(
      codeOf(buildAuthorizationCodeSnippet(client(), options()), "program"),
    ).not.toContain("options.UsePkce");

    expect(
      codeOf(
        buildAuthorizationCodeSnippet(client({ requirePkce: false }), options()),
        "program",
      ),
    ).toContain("options.UsePkce = false;");
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

  it("keeps the notes to the things the code does not already show", () => {
    const document = buildAuthorizationCodeSnippet(
      client({ requireDPoP: true }),
      options({ clientAuthentication: "jwk" }),
    );

    // One per step at most, apart from the DPoP key which has two distinct
    // consequences - the restart and the API side.
    expect(noteKeys(document, "credential")).toHaveLength(1);
    expect(noteKeys(document, "dpop-key")).toHaveLength(2);
    expect(noteKeys(document, "assertion")).toHaveLength(1);
    expect(noteKeys(document, "program")).toHaveLength(0);
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

    // The API has to validate the proof, which no generated code covers.
    expect(noteKeys(document, "dpop-key")).toContain(
      "Client.Integration.Notes.DPoPApiSide",
    );
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
    // User secrets are development-only, and the tab has to say so.
    expect(noteKeys(document, "credential")).toContain(
      "Client.Integration.Notes.CredentialStorage",
    );
    // The algorithm is read from the key rather than hard-coded.
    expect(codeOf(document, "assertion")).toContain(
      "new SigningCredentials(key, key.Alg",
    );

    // Client assertions need turning on at the authorization server too.
    expect(noteKeys(document, "assertion")).toContain(
      "Client.Integration.Notes.AssertionServerSupport",
    );
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

describe("whitespace", () => {
  // Options come and go as the client changes, and a removed line used to
  // leave the blank line that separated it behind.
  const everyShape = (): SnippetDocument[] => {
    const shapes: SnippetDocument[] = [];

    for (const clientAuthentication of ["shared_secret", "jwk"] as const) {
      for (const requireDPoP of [false, true]) {
        for (const requireClientSecret of [false, true]) {
          for (const allowOfflineAccess of [false, true]) {
            const config = client({
              requireDPoP,
              requireClientSecret,
              allowOfflineAccess,
            });
            const opts = options({ clientAuthentication });

            shapes.push(buildAuthorizationCodeSnippet(config, opts));
            shapes.push(buildClientCredentialsSnippet(config, opts));
          }
        }
      }
    }

    return shapes;
  };

  it("never leaves a double blank line in a generated block", () => {
    const offenders = everyShape()
      .flatMap((document) => document.steps)
      .flatMap((step) => step.blocks)
      .filter((block) => /\n[ \t]*\n[ \t]*\n/.test(block.code))
      .map((block) => block.id);

    expect(offenders).toEqual([]);
  });

  it("never starts or ends a block with a blank line", () => {
    const offenders = everyShape()
      .flatMap((document) => document.steps)
      .flatMap((step) => step.blocks)
      .filter((block) => block.code !== block.code.trim())
      .map((block) => block.id);

    expect(offenders).toEqual([]);
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

describe("DPoP proof key storage", () => {
  const builders = [
    ["authorization code", buildAuthorizationCodeSnippet],
    ["client credentials", buildClientCredentialsSnippet],
  ] as const;

  it.each(builders)(
    "%s: reads the key from configuration and stores it in user secrets by default",
    (_, build) => {
      const document = build(client({ requireDPoP: true }), options());

      expect(codeOf(document, "dpop-key")).toContain(
        'dotnet user-secrets set "',
      );
      expect(codeOf(document, "program")).toContain(
        "DPoPProofKey.Parse(builder.Configuration[",
      );
      expect(noteKeys(document, "dpop-key")).not.toContain(
        "Client.Integration.Notes.DPoPKeyInline",
      );
    },
  );

  it.each(builders)(
    "%s: keeps the key inline when secrets are kept inline",
    (_, build) => {
      const document = build(
        client({ requireDPoP: true }),
        options({ useUserSecrets: false }),
      );

      // No user-secrets command anywhere - the switch is off.
      expect(codeOf(document, "dpop-key")).not.toContain("user-secrets");
      expect(codeOf(document, "dpop-key")).toContain(
        "JsonWebKeyConverter.ConvertFromRSASecurityKey",
      );

      // The program must not read a configuration value nobody was told to set.
      const program = codeOf(document, "program");
      expect(program).not.toContain('DPoPJsonWebKey"]');
      expect(program).toContain(
        'DPoPProofKey.Parse("<a private JWK generated by this application>")',
      );

      expect(noteKeys(document, "dpop-key")).toContain(
        "Client.Integration.Notes.DPoPKeyInline",
      );
    },
  );

  it("initialises user secrets in the DPoP step when no credential step runs", () => {
    // A public client has no credential step, so the DPoP step is the first
    // (and only) place that touches user secrets.
    const publicClient = buildAuthorizationCodeSnippet(
      client({ requireDPoP: true, requireClientSecret: false }),
      options(),
    );

    expect(stepIds(publicClient)).not.toContain("credential");
    expect(codeOf(publicClient, "dpop-key")).toContain(
      "dotnet user-secrets init",
    );

    // A confidential client initialises them in the credential step already.
    const confidentialClient = buildAuthorizationCodeSnippet(
      client({ requireDPoP: true }),
      options(),
    );

    expect(codeOf(confidentialClient, "credential")).toContain(
      "dotnet user-secrets init",
    );
    expect(codeOf(confidentialClient, "dpop-key")).not.toContain(
      "dotnet user-secrets init",
    );
  });
});
