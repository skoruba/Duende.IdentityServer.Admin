# Changelog

## [3.1.0] - 2026-09-16

This release moves the solution to **Duende IdentityServer 8** and adds a way to get
from a configured client to working application code: the new **Integration** tab
generates the .NET 10 wire-up for the client you are looking at. Everything else
builds on the 3.0.0 architecture, so upgrading from 3.0.0 is a package and migration
step rather than a rewrite.

### Added

- **Actionable dashboard and command palette.** The home page now combines service health, configuration issues, resource counts, audit trends, recent activity, and contextual quick actions. A keyboard-accessible command palette provides fast navigation and search across the Admin UI
- The dashboard header works as a status bar: the environment and IdentityServer authority the Admin UI manages, the service health with the number of passing checks, the version, and a link to the open configuration issues. Health is reported as *Service healthy*, *degraded*, or *unhealthy*, and as unavailable rather than green when it cannot be read
- The monitoring card names the most widespread problem of the highest severity by its rule - for example *8 clients affected · Client Access Token Lifetime Too Long* - and each severity links to the issues list filtered to it. Resource tiles show how many clients, API resources, API scopes, and identity resources need attention
- The audit trend fills days without events, draws the alert threshold (1.5× the average of active days, never below 50 operations a day), marks past days above it, and links to the audit log of an anomalous day. The chart appears once three days have audit data
- Recent activity lists configuration changes only, labels credential changes as *Sensitive* and role, claim, and grant changes as *Permission change*, and opens a detail with the target, the caller's IP address, the request, the trace id, and the recorded data
- The command palette opens with Ctrl+K or ⌘K from any page and searches clients, users, API resources, and API scopes alongside navigation and the *new ...* actions
- `Info/GetEnvironment` returns the hosting environment name and the IdentityServer base URL. `Info/GetHealth` returns the health report for typed clients: unlike `/health`, which answers 503 when something is unhealthy, it always answers 200 and carries the status in the body, reports `Unknown` for hosts that register no health checks, and exposes check names and statuses only. Both require the administration policy
- `Dashboard/GetRecentAuditChanges` returns the newest audit entries that record a change, leaving the read events out. The audit log is indexed by its primary key only and mostly holds reads, so the query inspects a bounded number of the newest entries in a single statement without a `COUNT`, and its cost does not grow with the size of the log
- An optional `DashboardConfiguration` section tunes it: `RecentAuditChangesDefaultCount` (8), `RecentAuditChangesMaxCount` (50), and `RecentAuditChangesScanLimit` (5000). Every value has a default, so the section can be left out or set only what it changes
- The configuration issues list accepts `?type=Error|Warning|Recommendation` and the audit log accepts `?event=` and `?created=yyyy-MM-dd`, so both can be linked to with a filter applied
- **Client integration snippets.** A new *Integration* tab on the client detail generates the .NET 10 wire-up for the client being edited - NuGet packages, `appsettings.json`, the matching `dotnet user-secrets` commands, and `Program.cs`. Only the authorization code and client credentials flows are generated, and everything is derived from the form, so the snippets follow changes before they are saved: callback paths come from the redirect URIs, the scope list from the allowed scopes, PKCE and pushed authorization from their switches
- Client authentication in the generated code can be a shared secret or **private_key_jwt**, which adds a `ClientAssertionService` reading the signing algorithm from the JWK itself. The mode is preselected from the client's registered secrets, so a client holding a JWK secret gets the assertion variant without asking
- A separate step generates the **DPoP proof key** when the client requires DPoP, which - unlike the client credential - is the application's own key and is registered nowhere. The key follows the *Keep secrets out of the code* switch like the client credential: stored in user secrets, or inlined with a warning
- Syntax highlighting for the generated C#, shell, and JSON with copy and download per block. The tokenizer is built in, so no highlighting library enters the bundle
- **Capability-driven client edit form.** Tabs whose settings the client's grant types make irrelevant are left out: a client credentials client no longer offers URLs, authentication and logout, consent, device flow, CIBA, PKCE, identity token, or refresh token. A *Show all settings* switch brings them all back for the cases the grant types do not describe
- Playwright coverage for the hidden tabs and the override switch
- Vitest unit tests for the Admin UI's pure logic - client capabilities, snippet generation, and the snippet tokenizer - runnable with `npm test` without any running services
- **JWK client secrets** as a first-class secret type. The value is entered as a public JSON Web Key and validated before it can be saved - private key material, JWK Sets, and symmetric keys are rejected, while unknown key types only warn, because IdentityServer decides what it accepts
- The STS accepts `private_key_jwt` client authentication, so a client holding a JWK secret can actually use it. Without `AddJwtBearerClientAuthentication()` the token request fails with `invalid_client`
- Optional `Fapi2SecurityProfile:Enabled` configuration applies FAPI 2.0 cryptographic restrictions to the STS: PS256 signing keys, PS256/ES256 for DPoP, client assertions and request objects, and a 10-second JWT clock skew. The signing key restriction applies to automatic key management only; a custom signing credential is left as configured. Client and sender-constrained-token requirements remain explicit deployment configuration
- **In-browser key pair generation** for JWK secrets via the Web Crypto API (PS256/ES256/RS256/ES384/ES512). The private key never leaves the page: it is shown masked, can be copied or downloaded as JWK or PEM, and the public key is applied only after the user confirms they saved it. PS256 and ES256 are marked as FAPI 2.0 compliant and PS256 is the default; picking one of the others warns that it falls outside the profile
- Seven new configuration rules:
  - `ClientNameMustStartWith` and `ClientNameMustNotContain`
  - `ClientIdMustStartWith` and `ClientIdMustNotContain`
  - `ClientScopeMustExist`, which reports clients still allowing a scope that no longer exists as an API scope or identity resource ([#176](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/176))
  - `ClientSigningAlgorithmsMustBeFapiCompliant`, which reports signing algorithms outside the FAPI 2.0 set. The profile's section 5.4 is a closed enumeration, so the longer RS/PS/ES variants are non-conformant despite the larger key. Both the allowed identity token signing algorithms and the `alg` of JWK secrets are checked; disabled by default and the permitted set is configurable
  - `ApiResourceSigningAlgorithmsMustBeFapiCompliant`, the API resource counterpart: the access token signing algorithm is decided by the API resource, so a resource allowing RS256 makes every client requesting its scopes non-conformant. Disabled by default, same configurable set
- Playwright coverage for the JWK secret type: key pair generation, public-key-only storage, masked private key with copy and download in JWK and PEM form, the discard confirmation, EC key generation, and value validation
- Integration tests for the `Info` endpoints, service tests for the owner recorded in secret audit events, and Vitest coverage for the dashboard logic - issue grouping, rule matching, the activity series, and audit event descriptions

### Changed

- The client edit tabs are declared as data and rendered through a shared `SettingsTabs` component, which keeps the selection valid when the visible set changes while the form is open
- Identity resources are left out of the client scope picker for clients without a user flow, because they cannot be issued without one
- Grant type ids moved into a single `GrantTypeIds` constant covering all ids the API returns, replacing the two-value `GrantTypes` enum
- Downloading generated content reuses one helper shared with the JWK dialog
- Updated the solution to Duende IdentityServer 8.0.8, including EF migrations for the configuration, persisted grant, and identity stores
- Only `SharedSecret` is hashed, so the "you cannot retrieve it" warning and password masking are limited to that type; X509 types now state that the value is stored as it is
- Switching the client secret type clears the value, so a JWK cannot end up hashed as a shared secret or the other way round
- Secret type names are humanized for display only; the value sent to the API stays exactly as the backend expects it
- The client creation wizard takes a single redirect URI instead of a list
- Clipboard copying moved into a shared hook that reports failures instead of rejecting unhandled outside a secure context
- Updated `react-router-dom` to 7.18.2 and `postcss` to 8.5.25 in the Admin UI, and forced `brace-expansion` to 5.0.8 in the STS, clearing the actionable npm audit findings
- Updated the Admin UI to `@skoruba/duende.identityserver.admin.api.client` 3.1.4, which carries the new configuration rule types, the `Info` endpoints, and `Dashboard/GetRecentAuditChanges`, and to Vitest 5, together with transitive updates from `npm audit fix`, leaving `npm audit` clean
- Configuration issue results are cached in the Admin UI for two minutes instead of being recomputed on every page and window focus - both endpoints validate the whole configuration. Saving a client, API resource, API scope, identity resource, secret, property, or configuration rule refreshes them, and the configuration issues page always loads fresh data
- The `ClientSecretAdded`, `ClientSecretDeleted`, `ApiSecretAdded`, and `ApiSecretDeleted` audit events carry `ClientName` or `ApiResourceName`. The change is additive; consumers parsing the audit `Data` JSON see one more property. Entries written before the upgrade keep their original shape, and the Admin UI falls back to a link to the owning resource for them
- *API* is written in capitals throughout the Admin UI, including page titles, buttons, notifications, and audit event names

### Fixed

- Audit entries for client and API-resource secret changes now retain the owning resource name. Recent activity therefore shows a useful target rather than an opaque database id, including when an API deletes a secret by its id alone - such deletions used to be audited with the owner id `0`. A client without a name is recorded under its client id
- The navigation requested the configuration issue summary before the session was confirmed. Without a session the request answered 401 and the global error handler redirected to the unauthorized page while the login flow was still running
- The monitoring badge in the mobile navigation left errors out of the count
- **The wizard created public clients that required a client secret.** The Public client type never asks for a secret, but the created client still ended up with `RequireClientSecret = true`, so it could not authenticate at the token endpoint. The type now enforces `RequireClientSecret = false` and shows it on the summary step
- The advanced client settings rendered an *Other Settings* panel that had no matching tab trigger and could never be opened
- **Device flow consent is never remembered** ([RFC 8628](https://www.rfc-editor.org/rfc/rfc8628)). The device that starts a device flow is not the device the user authenticates on, so persisted consent could be replayed against an attacker-controlled device. `ConsentResponse.RememberConsent` is now always false for device flow, the "Remember My Decision" checkbox is gone from the user code confirmation page, and the device view model no longer fills `AllowRememberConsent`, so a forged POST cannot re-enable it either
- Configuration issue loading no longer builds a cartesian product across five client collections. A single client with a few hundred redirect URIs was enough to make the dashboard and the navigation summary time out ([#67](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/67))
- The client secret value is no longer lost when navigating back to the secret step of the client wizard. Restoring the saved step data looked like a secret type change and cleared the value
- Corrected the interaction denial method in `AccountController`

### Breaking Changes

- `GrantTypes` in the Admin UI client is replaced by `GrantTypeIds`, which also fixes the `ClientCreadentials` misspelling. Forks referencing the enum need updating
- Custom forks of the client edit tabs need to move from hand-written `Tabs` markup to the `SettingsTabs` component to keep working with hidden tabs
- Duende IdentityServer 8 requires new EF migrations for the configuration, persisted grant, and identity stores. Review them and back up your database before applying
- The admin configuration store gets one migration, `AddNamingScopeAndFapiRules`, which seeds the seven new configuration rules (Ids 17 to 23, all disabled). Apply it together with the IdentityServer 8 migrations
- The IdentityServer 8 configuration and persisted grant migrations create the SAML tables (`SamlServiceProviders`, `SamlSigninStates`, `SamlLogoutSessions`, and related). The schema is created, but **managing SAML service providers from the Admin UI is not part of this release** and is planned for 3.2.0
- The client creation wizard now takes a single redirect URI. Custom forks of the wizard steps need updating
- `IAuditLogRepository`, `IAuditLogService`, and `IDashboardService` each gain one method for the recent audit changes (`GetRecentChangesAsync`, `GetRecentAuditChangesAsync`). Forks deriving from the built-in classes inherit it; forks implementing the interfaces themselves need to add it

## [3.0.0] - 2026-07-15

### Added

- New React + TypeScript Admin UI with a modern SPA architecture, client creation wizard, monitoring dashboard, configuration rules, dark mode support, and improved client/resource management UX
- Passkey (WebAuthn) authentication support in STS Identity, including registration, rename, removal, localization, configuration, and SQL Server/PostgreSQL migrations
- New Mapperly-based identity data mapping pipeline with customization extension points
- Expanded test coverage across Playwright UI flows, Admin API integration tests, STS integration tests, repository validation, and audit event security scenarios

### Changed

- Updated the solution to .NET 10 and Duende IdentityServer 7.4.7
- Replaced AutoMapper with Mapperly across Admin BusinessLogic, Identity BusinessLogic, and Admin UI API mappers
- Migrated Admin UI Client from `react-query` v3 to `@tanstack/react-query` v5
- Migrated STS UI styling from Bootstrap/Gulp to Tailwind-based tooling
- Improved build, versioning, package publishing, and release automation scripts
- Updated solution/template/frontend package version references to `3.0.0`

### Fixed

- Hardened audit event payload sanitization to avoid persisting sensitive values such as client secrets, API secrets, client property values, pairwise subject salts, identity provider property values, persisted grant data/session identifiers, and identity user security fields
- Fixed Admin UI behavior when API sessions expire or return unauthorized/forbidden responses
- Fixed Admin UI data-grid delete actions and unsaved-changes confirmation flows that could leave the page blocked
- Fixed tabbed client form validation visibility and optional numeric field handling
- Prevented invalid configuration where `ApiScope` and `IdentityResource` share the same name
- Fixed client claims update tracking issues and improved mapper null handling/runtime diagnostics
- Resolved npm audit issues in Admin UI Client and STS Identity dependencies

### Breaking Changes

- New `AdminConfigurationDbContext` for monitoring/configuration rules requires new EF migrations
- Passkey support adds a new Identity persistence schema (`AddUserPasskeys`) for SQL Server/PostgreSQL
- Solution structure and NuGet package layout were reorganized with new Admin, Admin.Storage, and UI SPA projects
- MySQL support was removed because the Pomelo.MySql package is not available for .NET 10
- AutoMapper dependency was removed; custom mapping extensions must use the new Mapperly customization interfaces

---

## [3.0.0-rc4]

### Fixed

- Fixed Admin UI data-grid delete actions leaving the page blocked after confirming deletion from the row action menu
- Corrected shared modal/dropdown state handling to properly release pointer interaction after dialog close
- Added Playwright regression coverage for the delete-from-grid interaction flow

---

## [3.0.0-rc3]

### Changed

- Improved Admin UI authentication and authorization UX by separating `401 Unauthorized` and `403 Forbidden` flows
- Updated the default seeded Admin UI client (`skoruba_identity_admin_v3`) to use `RequireConsent = false`
- Added focused Playwright regression coverage for the new auth and form-validation behaviors

### Fixed

- Fixed Admin UI behavior when API sessions expire or become invalid, preventing confusing partially authenticated states
- Fixed dashboard and configuration-issue loading/error states to avoid misleading empty content and layout glitches
- Fixed tabbed client form validation visibility by adding a summary for hidden-tab errors and friendlier numeric validation messages
- Resolved npm audit issues in `Skoruba.Duende.IdentityServer.STS.Identity`

---

## [3.0.0-rc2]

This release candidate focuses on stabilization before the final `3.0.0` release.

The main highlight of this release is a significant improvement in test coverage. We added new Playwright UI integration tests, extended API integration tests, and added more STS integration tests to better verify the full Admin UI, API, and IdentityServer integration scenarios.

This release also includes stricter validation and clearer error handling for user and role claim updates, improved API feedback, updated documentation, and version updates across the solution.

If no critical issues are reported, this release candidate is intended to be promoted to the final `3.0.0` release after a short stabilization period.

---

## [3.0.0-preview.24]

### Changed

- Updated solution/template/frontend package version references to `3.0.0-preview.24`

### Fixed

- Prevented invalid configuration where `ApiScope` and `IdentityResource` share the same name by extending repository `CanInsert` validation across both entity types
- Added repository unit tests for cross-entity name collision checks between API scopes and identity resources
- Improved optional numeric field handling in Admin UI Client (`FormRow` number mode) so clearing a value keeps it nullable instead of immediately restoring the previous number
- Updated client and configuration-rule form schemas to correctly accept nullable optional numeric values for advanced settings and rule parameters

---

## [3.0.0-preview.23]

### Added

- Passkey (WebAuthn) authentication support in STS Identity (register, rename, and remove passkeys)
- New STS passkey pages, localization resources, and client-side helpers
- User passkey persistence model (`UserIdentityPasskey`) with SQL Server and PostgreSQL migrations
- New Mapperly-based identity data mapping pipeline with customization extension points

### Changed

- Replaced AutoMapper with Mapperly across Admin BusinessLogic, Identity BusinessLogic, and Admin UI API mappers ([#287](https://github.com/skoruba/Duende.IdentityServer.Admin/pull/287))
- Updated package references across the solution (including Duende IdentityServer 7.4.7, EF Core/ASP.NET Core 10.0.7, NSwag 14.7.1) ([#288](https://github.com/skoruba/Duende.IdentityServer.Admin/pull/288))
- Migrated Admin UI Client from `react-query` v3 to `@tanstack/react-query` v5
- Upgraded frontend linting/tooling to ESLint v10 and refreshed related TypeScript dependencies
- Updated v3 template and documentation references to `3.0.0-preview.23`

### Fixed

- Duplicate type mapping configuration for `UserLoginInfo -> TUserProviderDto` ([#271](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/271))
- Client retrieval generating overly complex SQL query ([#265](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/265))
- Admin UI dark-mode background rendering for audit log JSON data ([#284](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/284))
- Client claims update flow now avoids reusing existing claim IDs in update graphs (prevents EF tracking/concurrency conflicts)
- Improved mapper null handling and runtime error messages for dynamic instance creation
- Resolved npm audit vulnerabilities in `Admin.UI.Client` dependencies (`i18next-http-backend`, `uuid`)

### Breaking Changes

- Added passkey persistence schema for Identity (`AddUserPasskeys`) – apply new EF migrations for SQL Server/PostgreSQL
- AutoMapper dependency removed from mapper projects; custom mapping extensions should use the new Mapperly customization interfaces

---

## [3.0.0-preview.21]

### Added

- New React + TypeScript Admin UI with modern design
- Client creation wizard with step-by-step flow
- Monitoring dashboard with configuration rules engine
- Configuration issues tracking and alerts
- 15+ built-in configuration rules (PKCE, implicit grant, secret expiration, HTTPS enforcement, etc.)
- Configuration rules metadata provider with severity levels
- Tailwind CSS + shadcn/ui design system
- Dark mode support with semantic color tokens
- Enhanced TreeView for client summary
- Filtering system for configuration issues
- New Admin UI host (SPA served by .NET)
- Migrated STS UI from Bootstrap to Tailwind CSS with modern tooling (replaced Gulp)
- Pushed Authorization Requests (PAR) template option
- Code-splitting for improved frontend performance
- Forwarded headers configuration for reverse proxy scenarios

### Changed

- Updated to .NET 10
- Updated Duende IdentityServer to 7.4.5
- Updated solution structure for new frontend architecture
- Major UX improvements for client and resource management
- Improved form layouts and compact designs
- Enhanced navigation and user experience

### Breaking Changes

- **New AdminConfigurationDbContext** for monitoring feature – requires new EF migrations to be applied
- Solution structure reorganized with new projects (Admin.Storage, UI.Spa)
- NuGet package structure updated (new Admin and Admin.Storage packages)

---

## [2.6.0] – 2024-11-12

### Changed

- Updated to .NET 9
- Updated Duende IdentityServer to 7.2.1

---

## [2.5.0] – 2024-08-20

### Fixed

- Error when deleting users from the Admin UI ([#214](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/214))

---

## [2.4.0] – 2024-07-15

### Fixed

- Client update failing due to duplicate ClientId validation ([#227](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/227))
- Docker Compose nginx targeting wrong port ([#222](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/222))
- Method CanInsert..Property of controllers always returning true ([#235](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/235))

### Changed

- Migrated to new Azure Key Vault API ([#224](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/224))
- Replaced deprecated Microsoft.Extensions.Configuration.AzureKeyVault package ([#234](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/234))
- Updated all NuGet packages (including CVE-2024-39694 fix) ([#236](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/236))
- Updated Duende IdentityServer to 7.0.7

---

## [2.3.0] – 2024-05-10

### Changed

- Updated Duende IdentityServer to 7.0.5
- Updated all NuGet packages to latest versions

### Fixed

- Dashboard endpoint for Identity data retrieval

---

## [2.2.2] – 2024-03-25

### Added

- New Admin UI API project shipped as NuGet package
- Dashboard API endpoint
- TypeScript client generation for Admin API ([#215](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/215))

### Fixed

- Dockerfiles for multi-platform builds (linux/amd64, linux/arm64) ([#194](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/194))
- NSwag TypeScript definition dayjs import issues

---

## [2.1.0] – 2024-01-18

### Added

- Role users pagination ([#169](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/169))
- Secure secret generation with `secret_` prefix ([#153](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/153))
- Validation/list endpoints for clients, API resources, and scopes ([#213](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/213))

### Changed

- Increased client name prominence ([#154](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/154))
- Named arguments in IdentityServer health checks ([#201](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/201))
- Identity table names configurable via appsettings ([#196](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/196))

### Fixed

- UserLoginSuccessEvent not raised for 2FA/recovery login ([#202](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/202))

---

## [2.0.0] – 2023-11-20

### Changed

- Updated to .NET 8 ([#180](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/180))
- Updated to Duende IdentityServer v7 ([#181](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/181))

---

## [1.2.0] – 2023-02-15

### Added

- Dynamic Identity Providers support

### Changed

- Updated to Duende IdentityServer 6.2.1

---

## [1.1.0] – 2022-11-08

### Changed

- Updated to .NET 6
- Updated to Duende IdentityServer v6

---

## [1.0.0] – 2021-11-15

### Added

- Initial Admin UI for Duende IdentityServer
- ASP.NET Core Identity management
- Client, API and Identity resource management
- Audit logging via skoruba/AuditLogging
- Docker support with nginx-proxy
- Health checks for databases and IdentityServer
- Multiple database providers (SQL Server, PostgreSQL)
- External authentication providers (GitHub, Azure AD)
- Two-Factor Authentication (2FA)
- User registration and password reset
- Email support (SendGrid, SMTP)
- Azure Key Vault integration
- Localization support (multiple languages)
- Serilog logging with multiple sinks
- Swagger API documentation
- Project templates via dotnet CLI

### Security

- Added support for loading signing key from Azure Key Vault ([#533](https://github.com/skoruba/IdentityServer4.Admin/issues/533))
- Data Protection keys in Azure Key Vault ([#715](https://github.com/skoruba/IdentityServer4.Admin/pull/715))

---

## Historical Notes

For history before the Duende rebranding, see the IdentityServer4.Admin repository history at:  
https://github.com/skoruba/IdentityServer4.Admin
