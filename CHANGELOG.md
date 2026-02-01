# Changelog

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

---

## Upcoming Releases

### [3.1.0] – Planned

- Passkeys support

### [4.0.0] – Planned

- DTO refactoring
- Removal of AutoMapper and FluentAssertions
- Additional translations for the Admin UI

### [5.0.0] – Planned

- Claims management UI ([#22](https://github.com/skoruba/Duende.IdentityServer.Admin/issues/22))
- Identity management improvements – added options for loading a custom Identity schema

### [6.0.0] – Planned

- Minimal API rewrite using Vertical Slice Architecture (VSA)
