# Configuration Rules - Database Schema & API Reference

## Database Schema

### Table: ConfigurationRules

| Column          | Type           | Nullable | Description                                                    |
| --------------- | -------------- | -------- | -------------------------------------------------------------- |
| Id              | int            | No       | Primary Key                                                    |
| RuleType        | int (enum)     | No       | Typ pravidla (ObsoleteImplicitGrant, MissingPkce, etc.)        |
| ResourceType    | int (enum)     | No       | Typ resource (Client, ApiScope, ApiResource, IdentityResource) |
| IssueType       | int (enum)     | No       | Závažnost (Warning, Recommendation, Error)                     |
| IsEnabled       | bit            | No       | Zda je pravidlo aktivní                                        |
| Configuration   | nvarchar(2000) | Yes      | JSON s parametry pravidla                                      |
| MessageTemplate | nvarchar(500)  | Yes      | Šablona zprávy pro UI                                          |
| FixDescription  | nvarchar(1000) | Yes      | Návod jak opravit problém                                      |
| CreatedAt       | datetime2      | No       | Datum vytvoření                                                |
| UpdatedAt       | datetime2      | Yes      | Datum poslední aktualizace                                     |

**Indexes:**

- Unique: (RuleType, ResourceType)

**Seed Data:** 6 předpřipravených pravidel

---

## Enums

### ConfigurationRuleType

```
0  = ObsoleteImplicitGrant
1  = ObsoletePasswordGrant
2  = MissingPkce
3  = ClientRedirectUrisMustUseHttps
4  = ClientMustHaveAllowedScopes
5  = ClientAccessTokenLifetimeTooLong
6  = ClientRefreshTokenLifetimeTooLong
7  = ApiScopeNameMustStartWith
8  = ApiScopeNameMustNotContain
9  = ApiScopeMustHaveDisplayName
10 = ApiResourceMustHaveScopes
11 = ApiResourceNameMustStartWith
12 = IdentityResourceMustBeEnabled
13 = IdentityResourceNameMustStartWith
```

### ConfigurationResourceType

```
0 = Client
1 = IdentityResource
2 = ApiResource
3 = ApiScope
```

### ConfigurationIssueType

```
0 = Warning
1 = Recommendation
2 = Error
```

---

## API Endpoints

### ConfigurationRules Management

#### GET /api/ConfigurationRules

Získá seznam všech pravidel

**Response:**

```json
{
  "rules": [
    {
      "id": 1,
      "ruleType": "ObsoleteImplicitGrant",
      "resourceType": "Client",
      "issueType": "Warning",
      "isEnabled": true,
      "configuration": null,
      "messageTemplate": "Client uses obsolete implicit grant flow",
      "fixDescription": "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'.",
      "createdAt": "2025-12-12T10:00:00Z",
      "updatedAt": null
    }
  ],
  "totalCount": 6,
  "pageSize": 6
}
```

---

#### GET /api/ConfigurationRules/{id}

Získá detail konkrétního pravidla

**Parameters:**

- `id` (path) - ID pravidla

**Response 200:**

```json
{
  "id": 5,
  "ruleType": "ApiScopeNameMustStartWith",
  "resourceType": "ApiScope",
  "issueType": "Recommendation",
  "isEnabled": false,
  "configuration": "{\"prefix\": \"scope_\"}",
  "messageTemplate": "API Scope name must start with specified prefix",
  "fixDescription": "Rename the API Scope to follow the naming convention starting with the required prefix.",
  "createdAt": "2025-12-12T10:00:00Z",
  "updatedAt": null
}
```

**Response 404:** Rule not found

---

#### POST /api/ConfigurationRules

Vytvoří nové pravidlo

**Request Body:**

```json
{
  "ruleType": "ClientRedirectUrisMustUseHttps",
  "resourceType": "Client",
  "issueType": "Warning",
  "isEnabled": true,
  "configuration": "{\"allowLocalhost\": true}",
  "messageTemplate": "Client has redirect URIs not using HTTPS",
  "fixDescription": "Update redirect URIs to use HTTPS protocol."
}
```

**Response 201:** Created

```json
{
  "id": 7,
  "ruleType": "ClientRedirectUrisMustUseHttps",
  ...
}
```

**Response 400:** Bad Request (validation error)

---

#### PUT /api/ConfigurationRules/{id}

Aktualizuje existující pravidlo

**Parameters:**

- `id` (path) - ID pravidla

**Request Body:**

```json
{
  "id": 5,
  "ruleType": "ApiScopeNameMustStartWith",
  "resourceType": "ApiScope",
  "issueType": "Recommendation",
  "isEnabled": true,
  "configuration": "{\"prefix\": \"api.\"}",
  "messageTemplate": "API Scope name must start with 'api.'",
  "fixDescription": "Rename the API Scope to start with 'api.' prefix."
}
```

**Response 204:** No Content (success)
**Response 400:** Bad Request (ID mismatch or validation error)
**Response 404:** Rule not found

---

#### DELETE /api/ConfigurationRules/{id}

Smaže pravidlo

**Parameters:**

- `id` (path) - ID pravidla

**Response 204:** No Content (success)
**Response 404:** Rule not found

---

#### PATCH /api/ConfigurationRules/{id}/toggle

Zapne/vypne pravidlo (toggle IsEnabled)

**Parameters:**

- `id` (path) - ID pravidla

**Response 200:**

```json
{
  "isEnabled": true
}
```

**Response 404:** Rule not found

---

#### GET /api/ConfigurationRules/metadata

Získá metadata pro všechna dostupná pravidla

**Response 200:**

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
  }
]
```

---

#### GET /api/ConfigurationRules/metadata/{ruleType}

Získá metadata pro konkrétní typ pravidla

**Parameters:**

- `ruleType` (path) - Typ pravidla (enum value)

**Example:** `GET /api/ConfigurationRules/metadata/ClientRedirectUrisMustUseHttps`

**Response 200:**

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

**Response 404:** Rule type not found

---

### Configuration Issues (existing)

#### GET /api/ConfigurationIssues

Získá seznam všech nalezených problémů

**Response:**

```json
[
  {
    "resourceId": 123,
    "resourceName": "client_3694c893a099bd7a9b506bb41c827b86",
    "message": "ObsoleteImplicitGrant",
    "issueType": "Warning",
    "resourceType": "Client",
    "fixDescription": "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'."
  },
  {
    "resourceId": 123,
    "resourceName": "client_3694c893a099bd7a9b506bb41c827b86",
    "message": "MissingPkce",
    "issueType": "Recommendation",
    "resourceType": "Client",
    "fixDescription": "This client does not use PKCE. Consider enabling PKCE for enhanced security."
  }
]
```

---

#### GET /api/ConfigurationIssues/GetSummary

Získá sumarizaci problémů

**Response:**

```json
{
  "warnings": 5,
  "recommendations": 3
}
```

---

## Configuration JSON Examples

### ApiScopeNameMustStartWith

```json
{
  "prefix": "scope_"
}
```

Všechny API Scopes musí začínat na "scope\_"

---

### ClientRedirectUrisMustUseHttps

```json
{
  "allowLocalhost": true
}
```

- `allowLocalhost: true` - povolí http://localhost a http://127.0.0.1
- `allowLocalhost: false` - vyžaduje HTTPS všude

---

### ClientAccessTokenLifetimeTooLong

```json
{
  "maxLifetimeSeconds": 3600
}
```

Maximum povolená doba platnosti access tokenu v sekundách (3600 = 1 hodina)

---

## UI Implementation Guide

### Admin stránka pro správu pravidel

**URL:** `/configuration/rules`

**Komponenty:**

1. **Rules Table**

   - Sloupce: Name, Resource Type, Issue Type, Enabled, Actions
   - Toggle switch pro rychlé zapnutí/vypnutí
   - Edit a Delete tlačítka

2. **Edit Dialog**

   ```
   Rule Type: [Dropdown - readonly for existing]
   Resource Type: [Dropdown - readonly for existing]
   Issue Type: [Warning/Recommendation/Error]
   Enabled: [Checkbox]

   Message Template: [Input text]
   Fix Description: [Textarea]
   Configuration: [JSON Editor]
   ```

3. **Configuration JSON Editor**
   - Monaco Editor nebo podobný
   - Validace JSON
   - Hints podle typu pravidla

### Zobrazení v Issues tabulce

Přidat sloupec "Fix":

```tsx
<TableCell>
  <Tooltip title={issue.fixDescription}>
    <IconButton>
      <HelpIcon />
    </IconButton>
  </Tooltip>
</TableCell>
```

Nebo rozbalovací řádek s detailem:

```tsx
<TableRow>
  <TableCell colSpan={5}>
    <Alert severity="info">
      <AlertTitle>How to fix</AlertTitle>
      {issue.fixDescription}
    </Alert>
  </TableCell>
</TableRow>
```

---

## Migration Commands

```bash
# Vytvoření migrace
dotnet ef migrations add AddConfigurationRules \
  --project src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared \
  --context ConfigurationRulesDbContext

# Aplikace migrace
dotnet ef database update \
  --project src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared \
  --context ConfigurationRulesDbContext

# Rollback
dotnet ef database update PreviousMigration \
  --project src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared \
  --context ConfigurationRulesDbContext
```

---

## Testing

### Postman Collection Příklady

**1. Získat všechna pravidla**

```
GET https://localhost:5001/api/ConfigurationRules
Authorization: Bearer {token}
```

**2. Zapnout pravidlo**

```
PATCH https://localhost:5001/api/ConfigurationRules/5/toggle
Authorization: Bearer {token}
```

**3. Aktualizovat konfiguraci pravidla**

```
PUT https://localhost:5001/api/ConfigurationRules/5
Content-Type: application/json
Authorization: Bearer {token}

{
  "id": 5,
  "ruleType": "ApiScopeNameMustStartWith",
  "resourceType": "ApiScope",
  "issueType": "Recommendation",
  "isEnabled": true,
  "configuration": "{\"prefix\": \"api.v1.\"}",
  "messageTemplate": "API Scope must start with 'api.v1.'",
  "fixDescription": "Update scope name to start with 'api.v1.' prefix"
}
```

**4. Získat issues s fix popisky**

```
GET https://localhost:5001/api/ConfigurationIssues
Authorization: Bearer {token}
```
