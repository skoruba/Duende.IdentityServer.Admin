# Changelog

## [3.2.1] - Unreleased

### Security

- `npm audit` reported `braces` (stack exhaustion, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), high) in the build tooling of the Admin UI and the STS, pulled in by Tailwind CSS 3 and `cpy-cli`. Nothing of it ships to a browser or a server, and no fixed `braces` exists; both projects now build without it and `npm audit` is clean

### Changed

- The Admin UI and the STS build their stylesheets with **Tailwind CSS 4.3** (`@tailwindcss/vite` in the Admin UI, `@tailwindcss/cli` in the STS). The configuration lives in the stylesheets (`src/globals.css`, `Styles/app.css`) instead of `tailwind.config.js`, `tailwindcss-animate` is replaced by `tw-animate-css`, `tailwind-merge` is 3.x, and the Admin UI build no longer needs PostCSS and autoprefixer
- The look of both applications is unchanged. The stylesheets keep the Tailwind 3 palette values, line heights, font stack, `container`, `space-x`/`space-y` layout and the default border color, placeholder color and button cursor, which Tailwind 4 changed; each is a marked block that can be deleted to adopt the Tailwind 4 defaults. Verified by a pixel comparison of about 90 Admin UI and STS screens in light and dark mode
- The STS `icons:lucide` script runs `copy-all-icons.js` instead of `cpy-cli` and `rimraf`
- The Playwright specs for the configuration rules and for identity management switched off follow the 3.2.0 renames: a rule is looked up by the name the list shows, and the command palette action is *New client*

### Added

- Playwright `styling.spec.ts` checks what a stylesheet migration breaks first: the design tokens on the page and its controls, shadows, corners and form spacing, focus rings, hover and dialog animations, the dark theme, the container and the responsive variants, for the Admin UI and the STS login page

### Breaking Changes

- Forks of the Admin UI and the STS need Tailwind 4: `npx @tailwindcss/upgrade` renames the utilities (`shadow-sm` to `shadow-xs`, `outline-none` to `outline-hidden`, `bg-gradient-to-*` to `bg-linear-to-*`, `flex-shrink-0` to `shrink-0`, `bg-[--var]` to `bg-(--var)`) and theme customizations move from `tailwind.config.js` to `@theme` in the stylesheet. The STS classes other classes are built from (`btn`, `badge`, `alert`, `label`) are `@utility` definitions now, because Tailwind 4 can only `@apply` a utility

## [3.2.0] - 2026-10-03

### Upgrading

- New EF migration `AddAuditLogCreatedIndex` (SQL Server, PostgreSQL) adds the index `IX_AuditLog_Created`. On a large `AuditLog` table, create it ahead of the upgrade (e.g. `CREATE INDEX IX_AuditLog_Created ON AuditLog (Created) WITH (ONLINE = ON)`); the migration skips an existing index
- Forks of the Admin UI need React 19 and `react-day-picker` 10, see Breaking Changes below

### Security

- Duende IdentityServer 8.0.9 fixes insufficient validation of pushed authorization requests ([GHSA-mxv6-xwqj-ww2p](https://github.com/DuendeSoftware/products/security/advisories/GHSA-mxv6-xwqj-ww2p), high): a pushed request is now bound to the client that authenticated. No new EF migrations

### Added

- `AdminConfiguration:BasicConfiguration:IdentityManagementEnabled` (default `true`) hides user and role management in the Admin UI for deployments that keep users outside ASP.NET Core Identity ([#314](https://github.com/skoruba/Duende.IdentityServer.Admin/discussions/314)). UI only; the Admin API keeps its identity endpoints
- Docker image `skoruba/duende-identityserver-admin-with-api` running the Admin UI and the Admin API in one container (`deploy/admin-with-api`), for platforms that charge per container. 1 GB RAM recommended
- `Dashboard/GetDashboardAuditLogStatistics` serves the dashboard audit chart separately from the counters; the window is capped by `DashboardConfiguration:AuditLogStatisticsMaxDays` (default `365`)

### Fixed

- Dashboard timed out on a large `AuditLog` table ([#322](https://github.com/skoruba/Duende.IdentityServer.Admin/discussions/322)): the counters and the audit chart now load independently and the statistics use one indexed query
- Admin UI did not load under a path prefix behind a reverse proxy ([#321](https://github.com/skoruba/Duende.IdentityServer.Admin/discussions/321))
- Logout returned 403 *Invalid CSRF token* under a base path ([#323](https://github.com/skoruba/Duende.IdentityServer.Admin/discussions/323))
- Dashboard showed *Unhealthy* for up to 90 seconds after a single failed health check
- *Integration* tab generated `https://localhost:44310` as the authority instead of the configured IdentityServer
- `docker-compose.yml` seeded the Admin UI client with `/signin-oidc` as the front-channel logout URI instead of `/signout-oidc`
- Admin UI Docker build failed with `EBADENGINE` (it no longer upgrades to `npm@latest`)
- First load of the Admin UI shows one loading screen instead of four different spinners
- Command palette: *Add New Client* renamed to *New client*

### Changed

- Admin UI runs on **React 19**, together with Radix UI, `react-day-picker` 10 and `date-fns` 4
- Configuration rules list shows readable names, descriptions and checked values instead of type identifiers
- Generated code uses `https://your-api.example` as the API placeholder (was `https://localhost:5001`) and warns until it is set
- Admin UI uses `@skoruba/duende.identityserver.admin.api.client` 3.2.0

### Breaking Changes

- Forks of the Admin UI need React 19 typings: `import type { JSX } from "react"`, `useRef` with an initial value, `React.ComponentRef` instead of `React.ElementRef`
- Forks of the `Calendar` component need the `react-day-picker` 10 API (renamed `classNames` keys, a single `Chevron` instead of `IconLeft`/`IconRight`)

## [3.1.0] - 2026-09-19

Moves the solution to **Duende IdentityServer 8** and adds the **Integration** tab, which generates .NET 10 code for a configured client. Upgrading from 3.0.0 is a package and migration step, not a rewrite.

### Upgrading

- Duende IdentityServer 8 brings EF migrations for the configuration and persisted grant stores. Back up the database before applying them. They also create the SAML tables; managing SAML service providers from the Admin UI is not part of this release
- PostgreSQL only: identity migration `IdentitySchemaUpdate` changes `UserLogins.LoginProvider`, `UserLogins.ProviderKey`, `UserTokens.LoginProvider` and `UserTokens.Name` from `text` to `character varying(450)`; it stops if an existing value is longer
- Admin configuration store migration `AddNamingScopeAndFapiRules` seeds seven new configuration rules (Ids 17–23, disabled); a user-created rule occupying one of those Ids is moved to a new Id
- Building the Admin UI requires Node.js 22.12 or newer

### Added

- **Dashboard** with a service health status bar, configuration issues by severity, resource counts, an audit trend with anomaly threshold, and recent configuration changes with detail
- **Command palette** (Ctrl+K / ⌘K) for navigation and search across clients, users, API resources and API scopes
- **Integration tab** on the client detail: generates NuGet packages, `appsettings.json`, `dotnet user-secrets` commands and `Program.cs` for the authorization code and client credentials flows, including `private_key_jwt` and a DPoP proof key
- **JWK client secrets**, validated in the UI and the API (private key material, JWK Sets and symmetric keys are rejected), with in-browser key pair generation (PS256, ES256, RS256, ES384, ES512); the private key never leaves the browser
- STS accepts `private_key_jwt` client authentication
- Optional **FAPI 2.0** profile in the STS (`Fapi2SecurityProfile:Enabled`): PS256/ES256 only, 10-second clock skew, strict client assertion audience
- **Capability-driven client form**: tabs irrelevant to the client's grant types are hidden; *Show all settings* brings them back
- Seven configuration rules: `ClientNameMustStartWith`, `ClientNameMustNotContain`, `ClientIdMustStartWith`, `ClientIdMustNotContain`, `ClientScopeMustExist` ([#176](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/176)), and the FAPI rules `ClientSigningAlgorithmsMustBeFapiCompliant` and `ApiResourceSigningAlgorithmsMustBeFapiCompliant` (disabled by default)
- Wizard *High security* client type preselects a JWK secret and sets the DPoP clock skew to 30 seconds
- API endpoints `Info/GetEnvironment`, `Info/GetHealth` and `Dashboard/GetRecentAuditChanges`, tuned by the optional `DashboardConfiguration` section (`RecentAuditChangesDefaultCount`, `RecentAuditChangesMaxCount`, `RecentAuditChangesScanLimit`, `SystemHealthCacheSeconds`)
- Linkable filters: `?type=` on configuration issues, `?event=` and `?created=` on the audit log
- Vitest unit tests for the Admin UI (`npm test`), more Playwright and integration tests

### Changed

- Updated to Duende IdentityServer 8.0.8
- Configuration issues are cached in the Admin UI for two minutes and refreshed on save; the navigation and dashboard counts reuse the same list
- Secret audit events (`ClientSecretAdded`, `ClientSecretDeleted`, `ApiSecretAdded`, `ApiSecretDeleted`) carry the owning resource name
- Only `SharedSecret` is hashed and masked; switching the secret type clears the value
- Client wizard takes a single redirect URI
- Identity resources are left out of the scope picker for clients without a user flow
- Copy and other local actions confirm in place instead of with a toast
- Updated npm dependencies (`react-router-dom` 7.18.2, `postcss` 8.5.25, Vitest 5); `npm audit` is clean
- *API* is capitalized throughout the Admin UI

### Fixed

- **Device flow consent is no longer remembered** ([RFC 8628](https://www.rfc-editor.org/rfc/rfc8628)), also enforced server-side
- **Wizard created public clients that required a client secret**
- Configuration issues timed out for clients with many redirect URIs ([#67](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/67))
- Audit timestamps were sent without a UTC offset, so times were shifted by the time zone difference
- Secret audit entries lost their owning resource (owner id `0` when deleted by id)
- `LoginWithRecoveryCode`, `ForgetTwoFactorClient` and server-side session deletion now validate the anti-forgery token
- `delegation` grant returned 500 instead of `invalid_grant` for a token without `sub`
- `*MustStartWith` rules compared culture-sensitively (on a Czech host `chat-client` did not start with `c`)
- Configuration rule array parameters accept non-empty strings only
- Signing keys list showed the same keys on its first two pages
- Wizard lost the secret value when going back, and shifted the secret expiration by a day on each pass
- Navigation requested the issue summary before the session was confirmed and redirected to *unauthorized* during login
- System status headline hid an unhealthy database behind a degraded IdentityServer
- Generated C# string literals escape non-ASCII characters and line breaks
- Key pair dialog asks before dropping an unapplied key and discards a generation that was closed
- Corrected the interaction denial method in `AccountController`
- Smaller UI fixes: mobile monitoring badge count, unreachable *Other Settings* panel, a removed scope disappearing from the dual list, filters kept in the URL, Safari cancelling downloads, ⌘K on Apple keyboards, *Integration* tab with blocked `localStorage`, accessibility labels, clients without a name in configuration issues

### Breaking Changes

- `GrantTypes` in the Admin UI client is replaced by `GrantTypeIds`
- Forks of the client edit tabs need the `SettingsTabs` component
- Forks of the wizard steps need updating for the single redirect URI
- `IAuditLogRepository`, `IAuditLogService` and `IDashboardService` gain a method for recent audit changes
- The secret event constructors take the owning resource name; `InfoController` takes `IWebHostEnvironment`

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
