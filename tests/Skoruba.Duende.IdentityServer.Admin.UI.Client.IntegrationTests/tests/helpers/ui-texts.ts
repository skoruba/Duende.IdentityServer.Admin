export const UI_TEXT = {
  actions: {
    search: "Search",
    save: "Save",
    create: "Create",
    close: "Close",
    next: "Next",
    addItem: "Add Item",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    openMenu: "Open menu",
  },
  auth: {
    clientsHeading: "Clients",
    invalidCredentials: "Invalid username or password",
    consentAllow: "Yes, Allow",
  },
  placeholders: {
    enterItem: "Enter item",
    search: "Search",
    enterValue: "Enter value",
  },
  configurationRules: {
    addNewRule: "Add New Rule",
    editRule: "Edit Rule",
    duplicateRuleError:
      "This rule type already exists. Each rule type can only be configured once.",
  },
  configurationIssues: {
    pageTitle: "Configuration Issues",
    filters: "Filters",
    searchPlaceholder: "Search resources or messages...",
    showIssues: "Show issues",
  },
  clientTabs: {
    showAllSettings: "Show all settings",
  },
  grantTypes: {
    authorizationCode: "Authorization Code",
    clientCredentials: "Client Credentials",
  },
  integration: {
    tab: "Integration",
    settings: "Settings",
    authority: "Authority",
    apiBaseUrl: "API base address",
    appName: "Application name",
    sharedSecret: "Shared secret",
    privateKeyJwt: "Private key JWT (JWK)",
    jwkFoundHint:
      "This client has a JWK secret registered, so private key JWT is preselected.",
    noJwkHint: "How the application proves its identity at the token endpoint.",
    copyAll: "Copy all",
    unsupportedGrantTypes:
      "The setup code is generated for the authorization code and client credentials flows only.",
    scenarios: {
      webApp: "ASP.NET Core web app",
      worker: "Worker / API to API",
    },
    steps: {
      storeSecret: "Store the client secret",
      storePrivateKey: "Store the private key",
      signAssertion: "Sign the client assertion",
    },
    notes: {
      pkceDisabled: "This client does not require PKCE.",
      publicClient:
        "This client has no secret, so it is treated as a public client.",
      inlineSecret: "The secret is written directly into the code.",
      noApiScope: "No API scope is selected.",
      assertionSignInVersion:
        "sends the client assertion only since Duende.AccessTokenManagement.OpenIdConnect 4.2.0",
    },
  },
  wizard: {
    addNewClient: "Add New Client",
    newClientDialog: "New Client",
    reviewAndSubmit: "Review and Submit",
    highSecureClientType: "High Secure Web Client",
    jwkPreselectedTip: "is preselected",
    sharedSecretWarning: "not be FAPI 2.0 compliant",
    clientIdCopyButton: "Click to copy",
    copiedToClipboard: "Copied to clipboard!",
    dPoPClockSkewLabel: "DPoP Clock Skew",
    highSecureDPoPClockSkewSummary: "30 s",
    highSecureDPoPClockSkewValue: "00:00:30",
  },
  secrets: {
    addSecret: "Add Secret",
    secretTypeLabel: "Secret Type",
    secretDescriptionLabel: "Description",
    sharedSecretType: "Shared Secret",
    jwkType: "JWK",
    plainValueTip:
      "This secret type is stored as it is - it is not hashed and stays readable after saving.",
  },
  jwk: {
    generateAction: "Generate JWK key pair",
    dialogTitle: "Generate JWK key pair",
    generate: "Generate key pair",
    keySize: "Key size",
    keyId: "Key ID",
    privateKeyTab: "Private key",
    publicKeyTab: "Public key",
    reveal: "Reveal private key",
    copy: "Copy",
    download: "Download",
    acknowledge: "I have securely saved the private key",
    usePublicKey: "Use public key",
    publicKeyApplied: "Public key inserted.",
    discardConfirm:
      "Discard the generated key pair? The private key will be lost.",
    keepKeys: "Keep keys",
    discard: "Discard",
    publicKeyValidated: "Public JWK detected. No private key fields found.",
    algorithms: {
      ps256: "PS256 (RSA-PSS)",
      es256: "ES256 (EC P-256)",
      rs256: "RS256 (RSA)",
      es384: "ES384 (EC P-384)",
    },
    fapiBadge: "FAPI 2.0",
    nonFapiWarningSuffix:
      "is not permitted by the FAPI 2.0 Security Profile.",
    validation: {
      privateMember:
        "JWK must contain only public key material. Remove the private 'd' member.",
      invalidJson: "JWK must be valid JSON.",
      keySetNotSupported:
        "A JWK Set is not supported here. Paste a single public key object instead of the surrounding 'keys' array.",
      symmetricNotSupported:
        "Symmetric keys are not supported as a JWK secret. Use the SharedSecret type instead.",
    },
  },
} as const;
