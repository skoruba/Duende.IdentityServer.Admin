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
  wizard: {
    addNewClient: "Add New Client",
    newClientDialog: "New Client",
    reviewAndSubmit: "Review and Submit",
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
    publicKeyApplied: "The public key has been inserted into the secret value",
    discardConfirm:
      "Discard the generated key pair? The private key will be lost.",
    keepKeys: "Keep keys",
    discard: "Discard",
    publicKeyValidated: "Public JWK detected. No private key fields found.",
    algorithms: {
      rs256: "RS256 (RSA)",
      es256: "ES256 (EC P-256)",
    },
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
