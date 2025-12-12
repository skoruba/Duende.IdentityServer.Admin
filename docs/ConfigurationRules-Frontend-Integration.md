# Configuration Rules - Frontend Integration Guide

## Metadata API

Frontend může získat kompletní schéma pro každé pravidlo přes nové endpointy.

### GET /api/ConfigurationRules/metadata

Vrátí metadata pro všechna dostupná pravidla.

**Response:**

```json
[
  {
    "ruleType": "ApiScopeNameMustStartWith",
    "displayName": "API Scope Name Must Start With",
    "description": "Ensures API scope names follow a specific naming convention by requiring a prefix.",
    "resourceType": "ApiScope",
    "parameters": [
      {
        "name": "prefix",
        "displayName": "Required Prefix",
        "description": "The prefix that all API scope names must start with",
        "type": "string",
        "required": true,
        "defaultValue": null,
        "minValue": null,
        "maxValue": null,
        "pattern": "^[a-zA-Z0-9._-]+$",
        "allowedValues": null
      }
    ],
    "defaultConfiguration": "{\"prefix\": \"scope_\"}",
    "exampleConfiguration": "{\"prefix\": \"api.\"}"
  },
  {
    "ruleType": "ClientAccessTokenLifetimeTooLong",
    "displayName": "Client Access Token Lifetime Too Long",
    "description": "Detects clients with access token lifetime exceeding the recommended maximum.",
    "resourceType": "Client",
    "parameters": [
      {
        "name": "maxLifetimeSeconds",
        "displayName": "Maximum Lifetime (seconds)",
        "description": "Maximum allowed access token lifetime in seconds",
        "type": "number",
        "required": true,
        "defaultValue": 3600,
        "minValue": 300,
        "maxValue": 86400,
        "pattern": null,
        "allowedValues": null
      }
    ],
    "defaultConfiguration": "{\"maxLifetimeSeconds\": 3600}",
    "exampleConfiguration": "{\"maxLifetimeSeconds\": 7200}"
  }
]
```

### GET /api/ConfigurationRules/metadata/{ruleType}

Vrátí metadata pro konkrétní pravidlo.

**Example:** `GET /api/ConfigurationRules/metadata/ClientRedirectUrisMustUseHttps`

**Response:**

```json
{
  "ruleType": "ClientRedirectUrisMustUseHttps",
  "displayName": "Client Redirect URIs Must Use HTTPS",
  "description": "Ensures all client redirect URIs use HTTPS protocol for security.",
  "resourceType": "Client",
  "parameters": [
    {
      "name": "allowLocalhost",
      "displayName": "Allow Localhost",
      "description": "Allow HTTP for localhost and 127.0.0.1 addresses (useful for development)",
      "type": "boolean",
      "required": false,
      "defaultValue": true,
      "minValue": null,
      "maxValue": null,
      "pattern": null,
      "allowedValues": null
    }
  ],
  "defaultConfiguration": "{\"allowLocalhost\": true}",
  "exampleConfiguration": "{\"allowLocalhost\": false}"
}
```

---

## Parameter Types

| Type      | Description     | Example Value           |
| --------- | --------------- | ----------------------- |
| `string`  | Text value      | `"api."`                |
| `number`  | Numeric value   | `3600`                  |
| `boolean` | True/false      | `true`                  |
| `array`   | Array of values | `["openid", "profile"]` |

---

## Frontend Implementation

### 1. Načtení metadata při inicializaci

```typescript
interface RuleMetadata {
  ruleType: string;
  displayName: string;
  description: string;
  resourceType: string;
  parameters: RuleParameter[];
  defaultConfiguration: string | null;
  exampleConfiguration: string | null;
}

interface RuleParameter {
  name: string;
  displayName: string;
  description: string;
  type: "string" | "number" | "boolean" | "array";
  required: boolean;
  defaultValue?: any;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  allowedValues?: string[];
}

// Načíst všechna metadata při startu
const metadata = await fetch("/api/ConfigurationRules/metadata").then((res) =>
  res.json()
);

// Uložit do state/store
const metadataMap = new Map(metadata.map((m) => [m.ruleType, m]));
```

### 2. Dynamický formulář pro editaci pravidla

```typescript
interface ConfigurationRule {
  id: number;
  ruleType: string;
  resourceType: string;
  issueType: string;
  isEnabled: boolean;
  configuration: string; // JSON string
  messageTemplate: string;
  fixDescription: string;
}

function RuleEditDialog({ rule }: { rule: ConfigurationRule }) {
  const metadata = metadataMap.get(rule.ruleType);

  // Parse aktuální konfiguraci
  const currentConfig = rule.configuration
    ? JSON.parse(rule.configuration)
    : JSON.parse(metadata.defaultConfiguration || '{}');

  return (
    <Dialog>
      <DialogTitle>{metadata.displayName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary">
          {metadata.description}
        </Typography>

        {/* Dynamicky vygenerované fieldy podle parameters */}
        {metadata.parameters.map(param => (
          <FormField
            key={param.name}
            parameter={param}
            value={currentConfig[param.name]}
            onChange={(value) => updateConfig(param.name, value)}
          />
        ))}

        {/* Ostatní pole */}
        <TextField
          label="Message Template"
          value={rule.messageTemplate}
          onChange={...}
        />

        <TextField
          label="Fix Description"
          multiline
          value={rule.fixDescription}
          onChange={...}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Komponenta pro jednotlivé parametry

```typescript
function FormField({
  parameter,
  value,
  onChange,
}: {
  parameter: RuleParameter;
  value: any;
  onChange: (value: any) => void;
}) {
  switch (parameter.type) {
    case "string":
      return (
        <TextField
          label={parameter.displayName}
          helperText={parameter.description}
          value={value || parameter.defaultValue || ""}
          onChange={(e) => onChange(e.target.value)}
          required={parameter.required}
          pattern={parameter.pattern}
          placeholder={parameter.defaultValue?.toString()}
        />
      );

    case "number":
      return (
        <TextField
          type="number"
          label={parameter.displayName}
          helperText={parameter.description}
          value={value || parameter.defaultValue || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          required={parameter.required}
          inputProps={{
            min: parameter.minValue,
            max: parameter.maxValue,
          }}
        />
      );

    case "boolean":
      return (
        <FormControlLabel
          control={
            <Switch
              checked={value ?? parameter.defaultValue ?? false}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
          label={parameter.displayName}
        />
      );

    case "array":
      return (
        <ChipInput
          label={parameter.displayName}
          helperText={parameter.description}
          value={value || parameter.defaultValue || []}
          onChange={onChange}
          allowedValues={parameter.allowedValues}
        />
      );

    default:
      // Fallback na JSON editor
      return (
        <JsonEditor
          label={parameter.displayName}
          value={value}
          onChange={onChange}
        />
      );
  }
}
```

### 4. Ukládání konfigurace

```typescript
async function saveRule(rule: ConfigurationRule, configObject: any) {
  // Serializuj config object do JSON stringu
  const updatedRule = {
    ...rule,
    configuration: JSON.stringify(configObject),
  };

  await fetch(`/api/ConfigurationRules/${rule.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedRule),
  });
}
```

### 5. Vytvoření nového pravidla

```typescript
function CreateRuleDialog() {
  const [selectedRuleType, setSelectedRuleType] = useState("");
  const metadata = metadataMap.get(selectedRuleType);

  const handleCreate = () => {
    const newRule = {
      ruleType: selectedRuleType,
      resourceType: metadata.resourceType,
      issueType: "Recommendation", // Default
      isEnabled: false,
      configuration: metadata.defaultConfiguration,
      messageTemplate: metadata.displayName,
      fixDescription: metadata.description,
    };

    await fetch("/api/ConfigurationRules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRule),
    });
  };

  return (
    <Dialog>
      <DialogTitle>Create New Rule</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel>Rule Type</InputLabel>
          <Select
            value={selectedRuleType}
            onChange={(e) => setSelectedRuleType(e.target.value)}
          >
            {Array.from(metadataMap.values()).map((meta) => (
              <MenuItem key={meta.ruleType} value={meta.ruleType}>
                {meta.displayName} ({meta.resourceType})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {metadata && (
          <>
            <Typography variant="body2" color="textSecondary">
              {metadata.description}
            </Typography>
            {/* Show parameter form */}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Příklady použití metadata

### Příklad 1: Validace vstupu podle pattern

```typescript
if (parameter.pattern) {
  const regex = new RegExp(parameter.pattern);
  if (!regex.test(value)) {
    setError(`Value must match pattern: ${parameter.pattern}`);
  }
}
```

### Příklad 2: Zobrazení min/max hodnot

```typescript
if (parameter.type === "number") {
  const hint = [];
  if (parameter.minValue !== null) hint.push(`Min: ${parameter.minValue}`);
  if (parameter.maxValue !== null) hint.push(`Max: ${parameter.maxValue}`);

  return <TextField helperText={hint.join(", ")} />;
}
```

### Příklad 3: Array s povolenými hodnotami

```typescript
if (parameter.allowedValues) {
  return (
    <FormControl>
      <InputLabel>{parameter.displayName}</InputLabel>
      <Select multiple value={value} onChange={onChange}>
        {parameter.allowedValues.map((val) => (
          <MenuItem key={val} value={val}>
            {val}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
```

### Příklad 4: Default hodnoty při vytváření

```typescript
function getDefaultConfig(ruleType: string): any {
  const metadata = metadataMap.get(ruleType);

  if (!metadata.parameters.length) {
    return null; // Pravidlo nemá parametry
  }

  // Vytvoř config s default hodnotami
  const config = {};
  metadata.parameters.forEach((param) => {
    if (param.defaultValue !== undefined) {
      config[param.name] = param.defaultValue;
    }
  });

  return config;
}
```

---

## Smart Features

### 1. Kontextová nápověda

```typescript
<Tooltip title={parameter.description}>
  <IconButton size="small">
    <HelpIcon />
  </IconButton>
</Tooltip>
```

### 2. Příklady použití

```typescript
{
  metadata.exampleConfiguration && (
    <Alert severity="info">
      <AlertTitle>Example</AlertTitle>
      <code>{metadata.exampleConfiguration}</code>
    </Alert>
  );
}
```

### 3. Preview JSON

```typescript
const [showJson, setShowJson] = useState(false);

<Accordion>
  <AccordionSummary>View as JSON</AccordionSummary>
  <AccordionDetails>
    <pre>{JSON.stringify(configObject, null, 2)}</pre>
  </AccordionDetails>
</Accordion>;
```

### 4. Validace před uložením

```typescript
function validateConfig(configObject: any, metadata: RuleMetadata): string[] {
  const errors: string[] = [];

  metadata.parameters.forEach((param) => {
    const value = configObject[param.name];

    // Required check
    if (param.required && (value === undefined || value === null)) {
      errors.push(`${param.displayName} is required`);
    }

    // Type check
    if (value !== undefined && value !== null) {
      if (param.type === "number" && typeof value !== "number") {
        errors.push(`${param.displayName} must be a number`);
      }

      // Range check
      if (param.type === "number") {
        if (param.minValue !== null && value < param.minValue) {
          errors.push(
            `${param.displayName} must be at least ${param.minValue}`
          );
        }
        if (param.maxValue !== null && value > param.maxValue) {
          errors.push(`${param.displayName} must be at most ${param.maxValue}`);
        }
      }

      // Pattern check
      if (param.pattern && typeof value === "string") {
        const regex = new RegExp(param.pattern);
        if (!regex.test(value)) {
          errors.push(`${param.displayName} has invalid format`);
        }
      }
    }
  });

  return errors;
}
```

---

## Výhody tohoto řešení

✅ **Type-safe frontend** - přesně víš, jaké parametry očekávat
✅ **Dynamické formuláře** - UI se automaticky přizpůsobí typu pravidla
✅ **Validace na FE i BE** - metadata poskytují validation rules
✅ **User-friendly** - popisky, hints, příklady přímo z metadat
✅ **Rozšiřitelné** - nové pravidlo = automaticky nový formulář
✅ **Default hodnoty** - frontend zná default config
✅ **Dokumentace v kódu** - descriptions jsou součástí API response
