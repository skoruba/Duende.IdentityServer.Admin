# Release notes — 3.1.0

Version 3.1.0 modernizes Skoruba Duende IdentityServer Admin with
**Duende IdentityServer 8.0.8**, a richer monitoring dashboard, and more
practical client-management workflows.

## Highlights

- A redesigned dashboard brings service health, configuration issues, resource
  counts, audit activity, and recent changes into one actionable overview. A
  command palette (Ctrl+K / ⌘K) adds navigation and search from any page.
- The new **Integration** tab generates .NET 10 configuration snippets for a
  client, including authorization-code and client-credentials setups.
- The client edit form shows only the tabs a client's grant types make
  relevant, with a *Show all settings* switch for everything else.
- JWK client secrets and `private_key_jwt` authentication are supported, with
  in-browser key-pair generation and guarded handling of private material.
- Configuration monitoring adds rules for client naming, missing scopes, and
  FAPI-related signing algorithms.
- Audit activity is easier to read: client and API-resource secret changes now
  record their owning resource name instead of only an internal database ID.

## Important fixes

- Device-flow consent can no longer be remembered and replayed.
- Configuration issue loading avoids an expensive cartesian query for clients
  with many related records.
- The client wizard correctly creates public clients without requiring a
  secret.
- The navigation no longer queries a protected endpoint before the session is
  confirmed, which could redirect to the unauthorized page during sign-in.

## Upgrade note

Upgrading from 3.0.0 requires the new EF Core migrations for the
IdentityServer configuration, persisted-grant, identity, and admin
configuration stores. Review the migration scripts and back up the database
before applying them. See [CHANGELOG.md](CHANGELOG.md) for the complete
breaking-change list.

The IdentityServer 8 migrations also create the SAML tables. Managing SAML
service providers from the Admin UI is not part of this release and is planned
for 3.2.0.

If you consume the TypeScript API client, use
`@skoruba/duende.identityserver.admin.api.client` 3.1.4. Secret audit events
gain a `ClientName` or `ApiResourceName` property; the change is additive, and
entries written before the upgrade keep their original shape.
