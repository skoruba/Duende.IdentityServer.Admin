namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

public enum ConfigurationIssueMessageEnum
{
    ObsoleteImplicitGrant,
    ObsoletePasswordGrant,
    MissingPkce,
    ClientRedirectUrisMustUseHttps,
    ClientAccessTokenLifetimeTooLong,
    ApiScopeNameMustStartWith,
    ApiScopeMustHaveDisplayName,
}