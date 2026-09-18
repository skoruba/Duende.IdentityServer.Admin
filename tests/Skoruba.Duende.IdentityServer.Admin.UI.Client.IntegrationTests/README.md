# UI Integration Tests (Playwright)

This project contains end-to-end UI tests for the React admin client in `Skoruba.Duende.IdentityServer.Admin`.

## Scope

The suite covers:

1. Full authentication path (redirect to STS and back)
2. `Clients` list + seeded client detail
3. `Clients` create/edit/persistence flow
4. `Users` list + seeded user detail
5. `Users` create/edit/persistence flow
6. `Roles` list + seeded role detail
7. `Roles` create/edit/persistence flow
8. `ApiResources` list + seeded API resource detail
9. `ApiResources` create/edit/persistence flow
10. `IdentityResources` list + seeded identity resource detail
11. `IdentityResources` create/edit/persistence flow
12. `IdentityProviders` list + detail (existing providers)
13. `IdentityProviders` create/edit/persistence flow
14. `ApiScopes` list + seeded API scope detail
15. `ApiScopes` create/edit/persistence flow
16. `ConfigurationRules` page availability
17. `ConfigurationRules` create/edit/persistence for different parameter types (including the FAPI 2.0 signing algorithm rules) + duplicate-rule prevention
18. Client `Secrets` tab: in-browser JWK key pair generation, FAPI 2.0 algorithm marking and JWK validation
19. `ConfigurationRules` to `ConfigurationIssues`: an enabled rule reports an issue with its placeholders filled in, the issue links to the client, and disabling the rule removes it
20. Client `Integration` tab: generated setup code follows the unsaved form, grant types, scopes, client authentication and the tab's own settings

## Test Structure

- `tests/clients.spec.ts` - test orchestration only (short entrypoint)
- `tests/client-secrets-jwk.spec.ts` - JWK secret generation on the client `Secrets` tab
- `tests/client-integration.spec.ts` - setup code generation on the client `Integration` tab; changes the form without saving, only the JWK test writes a secret and removes it again
- `tests/api-resources.spec.ts` - API resources test orchestration
- `tests/users.spec.ts` - users test orchestration
- `tests/roles.spec.ts` - roles test orchestration
- `tests/identity-resources.spec.ts` - identity resources test orchestration
- `tests/identity-providers.spec.ts` - identity providers test orchestration
- `tests/api-scopes.spec.ts` - API scopes test orchestration
- `tests/configuration-rules.spec.ts` - configuration rules test orchestration
- `tests/helpers/*` - reusable UI/auth/form helpers
- `tests/scenarios/client-persistence-flow.ts` - full create/update/reopen persistence scenario
- `tests/scenarios/user-persistence-flow.ts` - user create/update/reopen persistence scenario
- `tests/scenarios/role-persistence-flow.ts` - role create/update/reopen persistence scenario
- `tests/scenarios/api-resource-persistence-flow.ts` - API resource create/update/reopen persistence scenario
- `tests/scenarios/identity-resource-persistence-flow.ts` - identity resource create/update/reopen persistence scenario
- `tests/scenarios/identity-provider-persistence-flow.ts` - identity provider create/update/reopen persistence scenario
- `tests/scenarios/api-scope-persistence-flow.ts` - API scope create/update/reopen persistence scenario
- `tests/scenarios/configuration-rule-persistence-flow.ts` - configuration rules create/reopen verification and duplicate-rule prevention

## Default Data Sources

The tests read credentials and expected resources from seed files:

- `src/Skoruba.Duende.IdentityServer.Admin.Api/identitydata.json`
- `src/Skoruba.Duende.IdentityServer.Admin.Api/identityserverdata.json`

It also supports alternative names (`identity.json`, `identityserver.json`) and env overrides.

## Prerequisites

Run these services before executing tests:

- `Skoruba.Duende.IdentityServer.STS.Identity`
- `Skoruba.Duende.IdentityServer.Admin.Api`
- `Skoruba.Duende.IdentityServer.Admin`

Default URLs used during local test runs:

- Admin backend (`Skoruba.Duende.IdentityServer.Admin`): `https://localhost:7127`
- Admin UI under test (`E2E_ADMIN_URL`, Vite dev server): `https://localhost:50445`
- STS: `https://localhost:44310`
- Admin API: `https://localhost:44302`

> Note: Playwright targets the Vite dev server on `https://localhost:50445` by
> default. That frontend dev server proxies API/backend traffic to the Admin
> application running on `https://localhost:7127`, which is why both ports
> appear in the setup.

## Install

```bash
cd tests/Skoruba.Duende.IdentityServer.Admin.UI.Client.IntegrationTests
npm install
npx playwright install chromium
```

## Run

```bash
npm test
```

Headed mode:

```bash
npm run test:headed
```

## Environment Variables

- `E2E_ADMIN_URL` (default: `https://localhost:50445`)
- `E2E_STS_URL` (default: `https://localhost:44310`)
- `E2E_IDENTITY_JSON` (path to identity users JSON)
- `E2E_IDENTITYSERVER_JSON` (path to identityserver clients JSON)
- `E2E_USERNAME` (optional override)
- `E2E_PASSWORD` (optional override)
- `E2E_EXPECTED_USER_NAME` (optional override)
- `E2E_EXPECTED_ROLE_NAME` (optional override)
- `E2E_EXPECTED_CLIENT_ID` (optional override)
- `E2E_EXPECTED_API_RESOURCE_NAME` (optional override)
- `E2E_EXPECTED_IDENTITY_RESOURCE_NAME` (optional override)
- `E2E_EXPECTED_IDENTITY_PROVIDER_SCHEME` (optional override)
- `E2E_EXPECTED_API_SCOPE_NAME` (optional override)
- `E2E_ADMIN_ROLE` (default: `SkorubaIdentityAdminAdministrator`)

## Reports

- HTML report: `playwright-report/index.html`
- Traces/videos/screenshots on failure: `test-results/`
