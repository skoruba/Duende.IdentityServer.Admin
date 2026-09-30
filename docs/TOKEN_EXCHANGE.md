# OAuth 2.0 Token Exchange

## Purpose

This implementation lets a trusted server-side client exchange an access token issued by an external identity provider (IdP) for an access token issued by this Duende IdentityServer.

The exchanged token represents a pre-provisioned local Identity user. Internal APIs can therefore trust one issuer and apply their normal audience and scope checks instead of accepting tokens from every external IdP directly.

This is the RFC 8693 Token Exchange grant:

```text
urn:ietf:params:oauth:grant-type:token-exchange
```

This flow is separate from interactive browser SSO. It does not exchange ID tokens and does not create or link local users automatically.

## Architecture and Flow

```text
External IdP
    | external access token
    v
Trusted server-side client
    | POST /connect/token
    | grant_type + subject_token + provider
    v
Duende IdentityServer
    | validate token and resolve local user
    | issue local access token
    v
Internal API
    | validate local issuer, audience, and scopes
```

1. A trusted client obtains an access token from an external IdP for the audience configured in IdentityServer.
2. The client sends that token to IdentityServer's `/connect/token` endpoint using the Token Exchange grant.
3. IdentityServer selects the explicitly named, enabled provider configuration and validates the external token.
4. IdentityServer maps the external identity to an existing local user.
5. IdentityServer issues its own access token for that user's local subject.
6. The client calls an internal API with the IdentityServer-issued token. The external token should not be forwarded to the internal API.

## Configuration

### External providers

Providers are configured under `ExternalProvidersConfiguration:TokenExchangeProviders` in the STS configuration. The dictionary key is the provider name supplied in the token request. Configure only trusted providers and use environment-specific values; do not commit tenant-specific identifiers or credentials.

Generic example:

```json
{
  "ExternalProvidersConfiguration": {
    "TokenExchangeProviders": {
      "CorporateOIDC": {
        "Enabled": true,
        "Authorities": [
          "https://identity.example.com/tenant/v2.0"
        ],
        "Audience": "api://internal-exchange-audience",
        "LoginProvider": "CorporateOIDC",
        "SubjectClaim": "sub",
        "EmailClaim": "email"
      }
    }
  }
}
```

| Setting | Meaning |
|---|---|
| `Enabled` | Whether the provider can be selected for exchange. |
| `Authorities` | Trusted OIDC authorities. Discovery metadata is loaded from each authority's `/.well-known/openid-configuration` endpoint. |
| `Audience` | The expected `aud` value of the external access token. |
| `LoginProvider` | The external login provider name used to find the user's local login record. |
| `SubjectClaim` | Claim used as the external subject key; defaults to `sub`. |
| `TenantId` | Optional expected `tid` claim, useful for tenant-restricted providers. |
| `EmailClaim` | Optional email claim used for a local-user lookup if no external login link is found. |

Keep external credentials, signing material, and environment-specific provider configuration outside source control. Supply them at runtime through the deployment platform's protected configuration mechanism.

### IdentityServer client and scopes

Register a confidential, server-side client that is allowed to use the Token Exchange grant. Its allowed scopes determine which local scopes can be requested. Protect its client secret with a secret store; never embed it in browser code.

Example client properties:

```json
{
  "ClientId": "internal-token-exchange-client",
  "AllowedGrantTypes": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "RequireClientSecret": true,
  "AllowedScopes": [ "internal-api.read" ]
}
```

The target API resource and scope must also be configured in IdentityServer. The requested scope is authorized by IdentityServer against the client configuration; the Token Exchange validator does not independently authorize external token scopes.

## Implementation

The implementation is in these components:

- `TokenExchangeGrantValidator<TUser>` implements `IExtensionGrantValidator`, parses the exchange parameters, validates the external token, resolves the local user, and returns the local subject to IdentityServer.
- `TokenExchangeProviderConfiguration` defines the provider-specific authority, audience, login-provider, subject-claim, optional tenant, and optional email settings.
- `StartupHelpers.AddAuthenticationServices` binds and registers `ExternalProvidersConfiguration` in dependency injection.
- `StartupHelpers.AddIdentityServer` registers `TokenExchangeGrantValidator<TUser>` as an extension grant validator.
- `ClientConsts` adds the grant type to the grant-type choices exposed by the Admin UI.

The provider name is mandatory in every request. There is no implicit default-provider fallback. Discovery configuration is cached by authority for the process lifetime.

## Token Validation and Security

The validator accepts `subject_token_type` values `urn:ietf:params:oauth:token-type:jwt` and `urn:ietf:params:oauth:token-type:access_token`. In either case, the supplied `subject_token` must be an external JWT access token, not an ID token or an opaque token.

Validation uses signing keys and issuer values from the configured OIDC discovery documents and checks:

- Signature against the trusted discovery signing keys.
- Issuer against the issuers returned by the configured authorities.
- Audience against the provider's configured `Audience`.
- Token lifetime, including expiration and not-before validation.
- `tid` against `TenantId`, when a tenant is configured.
- Presence of the configured subject claim before resolving the local account.

Additional security requirements:

- Use a client secret only from a trusted backend or workload identity. Do not expose it to a SPA or mobile client.
- Give each provider a distinct configuration key and stable `LoginProvider` value. Do not let callers choose arbitrary authorities or audiences.
- Request only scopes allowed for the client, and ensure internal APIs validate the local issuer, audience, and required scopes.
- Do not use a token intended for a different resource, such as a general user profile API, as the `subject_token`.
- The email lookup fallback is opt-in through `EmailClaim`. Use it only when the external email claim is trustworthy and local email uniqueness is enforced. It finds an existing user but does not create an external login link.
- Treat validation failures as `invalid_grant`; do not log raw access tokens.

The validator does not perform automatic registration or persist a new `UserLogin`. External identities must be linked to local users in advance, unless a trusted configured email fallback resolves an existing account.

## Example Request

Send the request from a trusted backend. Do not include a `Bearer` prefix in `subject_token`.

```bash
curl --request POST "https://identity.example.com/connect/token" \
  --header "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  --data-urlencode "client_id=internal-token-exchange-client" \
  --data-urlencode "client_secret=${TOKEN_EXCHANGE_CLIENT_SECRET}" \
  --data-urlencode "subject_token=${EXTERNAL_ACCESS_TOKEN}" \
  --data-urlencode "subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  --data-urlencode "provider=CorporateOIDC" \
  --data-urlencode "scope=internal-api.read"
```

The `provider` value must exactly match an enabled key in `TokenExchangeProviders`. The client must be registered for the grant and allowed to request the requested scope.

## Example Response

```json
{
  "access_token": "<identityserver-issued-access-token>",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "internal-api.read"
}
```

The access token is issued by this IdentityServer for the resolved local user. Its audience and scopes are determined by the local API resource, requested scopes, and client configuration.

Common grant errors include:

- `invalid_request`: missing `subject_token`, unsupported or missing `subject_token_type`, or missing `provider`.
- `invalid_target`: provider is unknown, disabled, or not configured.
- `invalid_grant`: token validation fails, required claims are absent, or no local account can be resolved.

## Extensibility and Local User Mapping

Provider configuration keeps issuer, audience, tenant, and claim names out of provider-specific code. The current resolver:

1. Looks up an existing local login by `LoginProvider` and the configured `SubjectClaim`.
2. For `SubjectClaim: "oid"`, recognizes the standard Microsoft object-identifier URI claim if the short `oid` claim is absent.
3. If necessary, tries the token's `sub` claim against the same `LoginProvider`.
4. If `EmailClaim` is configured and no login match exists, looks up an existing local account by email.

To support a different identity model, extend the mapping logic or introduce a dedicated user-resolution service behind a generic interface. Keep provider-specific claim mapping in configuration or a provider adapter; avoid hard-coding application or tenant names in the grant validator. Any mapping extension should preserve the rule that the result is an existing local user and should not silently link or create accounts.

## Tests and Validation

Validation performed for this implementation:

- The STS project built successfully on the Skoruba 3.1 branch with the current `IExtensionGrantValidator.ValidateAsync` cancellation-token signature.
- The Token Exchange flow was manually exercised in the local integration environment with an enabled test provider and a pre-linked local user; the exchange succeeded.

No dedicated automated tests for `TokenExchangeGrantValidator` were found in the repository when this document was written. Automated coverage should include successful exchange, missing parameters, disabled/unknown provider, invalid signature/issuer/audience/lifetime/tenant, missing subject claim, linked-user resolution, optional email fallback, and unknown local user rejection.
