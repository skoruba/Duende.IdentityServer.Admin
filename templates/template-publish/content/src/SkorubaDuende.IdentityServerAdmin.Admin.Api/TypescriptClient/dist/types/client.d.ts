export declare class WebApiClientBase {
    protected transformOptions(options: RequestInit): Promise<RequestInit>;
}
export interface IApiResourcesClient {
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ApiResourcesApiDto>;
    post(apiResourceApi: ApiResourceApiDto): Promise<void>;
    put(apiResourceApi: ApiResourceApiDto): Promise<void>;
    canInsertApiResource(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    canInsertApiResourceProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    get2(id: number): Promise<ApiResourceApiDto>;
    delete(id: number): Promise<void>;
    getSecrets(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiSecretsApiDto>;
    postSecret(id: number, clientSecretApi: ApiSecretApiDto): Promise<ApiSecretApiDto>;
    getSecret(secretId: number): Promise<ApiSecretApiDto>;
    deleteSecret(secretId: number): Promise<void>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiResourcePropertiesApiDto>;
    postProperty(id: number, apiPropertyApi: ApiResourcePropertyApiDto): Promise<ApiResourcePropertyApiDto>;
    getProperty(propertyId: number): Promise<ApiResourcePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
}
export declare class ApiResourcesClient extends WebApiClientBase implements IApiResourcesClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ApiResourcesApiDto>;
    protected processGet(response: Response): Promise<ApiResourcesApiDto>;
    post(apiResourceApi: ApiResourceApiDto): Promise<void>;
    protected processPost(response: Response): Promise<void>;
    put(apiResourceApi: ApiResourceApiDto): Promise<void>;
    protected processPut(response: Response): Promise<void>;
    canInsertApiResource(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    protected processCanInsertApiResource(response: Response): Promise<boolean>;
    canInsertApiResourceProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    protected processCanInsertApiResourceProperty(response: Response): Promise<boolean>;
    get2(id: number): Promise<ApiResourceApiDto>;
    protected processGet2(response: Response): Promise<ApiResourceApiDto>;
    delete(id: number): Promise<void>;
    protected processDelete(response: Response): Promise<void>;
    getSecrets(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiSecretsApiDto>;
    protected processGetSecrets(response: Response): Promise<ApiSecretsApiDto>;
    postSecret(id: number, clientSecretApi: ApiSecretApiDto): Promise<ApiSecretApiDto>;
    protected processPostSecret(response: Response): Promise<ApiSecretApiDto>;
    getSecret(secretId: number): Promise<ApiSecretApiDto>;
    protected processGetSecret(response: Response): Promise<ApiSecretApiDto>;
    deleteSecret(secretId: number): Promise<void>;
    protected processDeleteSecret(response: Response): Promise<void>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiResourcePropertiesApiDto>;
    protected processGetProperties(response: Response): Promise<ApiResourcePropertiesApiDto>;
    postProperty(id: number, apiPropertyApi: ApiResourcePropertyApiDto): Promise<ApiResourcePropertyApiDto>;
    protected processPostProperty(response: Response): Promise<ApiResourcePropertyApiDto>;
    getProperty(propertyId: number): Promise<ApiResourcePropertyApiDto>;
    protected processGetProperty(response: Response): Promise<ApiResourcePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
    protected processDeleteProperty(response: Response): Promise<void>;
}
export interface IApiScopesClient {
    getScopes(search: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ApiScopesApiDto>;
    postScope(apiScopeApi: ApiScopeApiDto): Promise<ApiScopeDto>;
    putScope(apiScopeApi: ApiScopeApiDto): Promise<void>;
    canInsertApiScope(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    canInsertApiScopeProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    getScope(id: number): Promise<ApiScopeApiDto>;
    deleteScope(id: number): Promise<void>;
    getScopeProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiScopePropertiesApiDto>;
    postProperty(id: number, apiScopePropertyApi: ApiScopePropertyApiDto): Promise<ApiScopePropertyApiDto>;
    getProperty(propertyId: number): Promise<ApiScopePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
}
export declare class ApiScopesClient extends WebApiClientBase implements IApiScopesClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    getScopes(search: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ApiScopesApiDto>;
    protected processGetScopes(response: Response): Promise<ApiScopesApiDto>;
    postScope(apiScopeApi: ApiScopeApiDto): Promise<ApiScopeDto>;
    protected processPostScope(response: Response): Promise<ApiScopeDto>;
    putScope(apiScopeApi: ApiScopeApiDto): Promise<void>;
    protected processPutScope(response: Response): Promise<void>;
    canInsertApiScope(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    protected processCanInsertApiScope(response: Response): Promise<boolean>;
    canInsertApiScopeProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    protected processCanInsertApiScopeProperty(response: Response): Promise<boolean>;
    getScope(id: number): Promise<ApiScopeApiDto>;
    protected processGetScope(response: Response): Promise<ApiScopeApiDto>;
    deleteScope(id: number): Promise<void>;
    protected processDeleteScope(response: Response): Promise<void>;
    getScopeProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ApiScopePropertiesApiDto>;
    protected processGetScopeProperties(response: Response): Promise<ApiScopePropertiesApiDto>;
    postProperty(id: number, apiScopePropertyApi: ApiScopePropertyApiDto): Promise<ApiScopePropertyApiDto>;
    protected processPostProperty(response: Response): Promise<ApiScopePropertyApiDto>;
    getProperty(propertyId: number): Promise<ApiScopePropertyApiDto>;
    protected processGetProperty(response: Response): Promise<ApiScopePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
    protected processDeleteProperty(response: Response): Promise<void>;
}
export interface IClientsClient {
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ClientsApiDto>;
    post(client: ClientApiDto): Promise<ClientApiDto>;
    put(client: ClientApiDto): Promise<void>;
    get2(id: number): Promise<ClientApiDto>;
    delete(id: number): Promise<void>;
    getAccessTokenTypes(): Promise<SelectItemDto[]>;
    getTokenExpirations(): Promise<SelectItemDto[]>;
    getTokenUsage(): Promise<SelectItemDto[]>;
    getProtocolTypes(): Promise<SelectItemDto[]>;
    getDPoPValidationModes(): Promise<SelectItemDto[]>;
    getScopes(scope: string | null | undefined, limit: number | undefined, excludeIdentityResources: boolean | undefined, excludeApiScopes: boolean | undefined): Promise<string[]>;
    getGrantTypes(grant: string | null | undefined, includeObsoleteGrants: boolean | undefined, limit: number | undefined): Promise<SelectItemDto[]>;
    getHashTypes(): Promise<SelectItemDto[]>;
    getSecretTypes(): Promise<SelectItemDto[]>;
    getStandardClaims(claim: string | null | undefined, limit: number | undefined): Promise<string[]>;
    getSigningAlgorithms(algorithm: string | null | undefined, limit: number | undefined): Promise<string[]>;
    canInsertClient(id: number | undefined, clientId: string | null | undefined, isCloned: boolean | undefined): Promise<boolean>;
    postClientClone(client: ClientCloneApiDto): Promise<ClientApiDto>;
    getSecrets(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientSecretsApiDto>;
    postSecret(id: number, clientSecretApi: ClientSecretApiDto): Promise<ClientSecretApiDto>;
    getSecret(secretId: number): Promise<ClientSecretApiDto>;
    deleteSecret(secretId: number): Promise<void>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientPropertiesApiDto>;
    postProperty(id: number, clientPropertyApi: ClientPropertyApiDto): Promise<ClientPropertyApiDto>;
    getProperty(propertyId: number): Promise<ClientPropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
    getClaims(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientClaimsApiDto>;
    postClaim(id: number, clientClaimApiDto: ClientClaimApiDto): Promise<ClientClaimApiDto>;
    getClaim(claimId: number): Promise<ClientClaimApiDto>;
    deleteClaim(claimId: number): Promise<FileResponse>;
}
export declare class ClientsClient extends WebApiClientBase implements IClientsClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<ClientsApiDto>;
    protected processGet(response: Response): Promise<ClientsApiDto>;
    post(client: ClientApiDto): Promise<ClientApiDto>;
    protected processPost(response: Response): Promise<ClientApiDto>;
    put(client: ClientApiDto): Promise<void>;
    protected processPut(response: Response): Promise<void>;
    get2(id: number): Promise<ClientApiDto>;
    protected processGet2(response: Response): Promise<ClientApiDto>;
    delete(id: number): Promise<void>;
    protected processDelete(response: Response): Promise<void>;
    getAccessTokenTypes(): Promise<SelectItemDto[]>;
    protected processGetAccessTokenTypes(response: Response): Promise<SelectItemDto[]>;
    getTokenExpirations(): Promise<SelectItemDto[]>;
    protected processGetTokenExpirations(response: Response): Promise<SelectItemDto[]>;
    getTokenUsage(): Promise<SelectItemDto[]>;
    protected processGetTokenUsage(response: Response): Promise<SelectItemDto[]>;
    getProtocolTypes(): Promise<SelectItemDto[]>;
    protected processGetProtocolTypes(response: Response): Promise<SelectItemDto[]>;
    getDPoPValidationModes(): Promise<SelectItemDto[]>;
    protected processGetDPoPValidationModes(response: Response): Promise<SelectItemDto[]>;
    getScopes(scope: string | null | undefined, limit: number | undefined, excludeIdentityResources: boolean | undefined, excludeApiScopes: boolean | undefined): Promise<string[]>;
    protected processGetScopes(response: Response): Promise<string[]>;
    getGrantTypes(grant: string | null | undefined, includeObsoleteGrants: boolean | undefined, limit: number | undefined): Promise<SelectItemDto[]>;
    protected processGetGrantTypes(response: Response): Promise<SelectItemDto[]>;
    getHashTypes(): Promise<SelectItemDto[]>;
    protected processGetHashTypes(response: Response): Promise<SelectItemDto[]>;
    getSecretTypes(): Promise<SelectItemDto[]>;
    protected processGetSecretTypes(response: Response): Promise<SelectItemDto[]>;
    getStandardClaims(claim: string | null | undefined, limit: number | undefined): Promise<string[]>;
    protected processGetStandardClaims(response: Response): Promise<string[]>;
    getSigningAlgorithms(algorithm: string | null | undefined, limit: number | undefined): Promise<string[]>;
    protected processGetSigningAlgorithms(response: Response): Promise<string[]>;
    canInsertClient(id: number | undefined, clientId: string | null | undefined, isCloned: boolean | undefined): Promise<boolean>;
    protected processCanInsertClient(response: Response): Promise<boolean>;
    postClientClone(client: ClientCloneApiDto): Promise<ClientApiDto>;
    protected processPostClientClone(response: Response): Promise<ClientApiDto>;
    getSecrets(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientSecretsApiDto>;
    protected processGetSecrets(response: Response): Promise<ClientSecretsApiDto>;
    postSecret(id: number, clientSecretApi: ClientSecretApiDto): Promise<ClientSecretApiDto>;
    protected processPostSecret(response: Response): Promise<ClientSecretApiDto>;
    getSecret(secretId: number): Promise<ClientSecretApiDto>;
    protected processGetSecret(response: Response): Promise<ClientSecretApiDto>;
    deleteSecret(secretId: number): Promise<void>;
    protected processDeleteSecret(response: Response): Promise<void>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientPropertiesApiDto>;
    protected processGetProperties(response: Response): Promise<ClientPropertiesApiDto>;
    postProperty(id: number, clientPropertyApi: ClientPropertyApiDto): Promise<ClientPropertyApiDto>;
    protected processPostProperty(response: Response): Promise<ClientPropertyApiDto>;
    getProperty(propertyId: number): Promise<ClientPropertyApiDto>;
    protected processGetProperty(response: Response): Promise<ClientPropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
    protected processDeleteProperty(response: Response): Promise<void>;
    getClaims(id: number, page: number | undefined, pageSize: number | undefined): Promise<ClientClaimsApiDto>;
    protected processGetClaims(response: Response): Promise<ClientClaimsApiDto>;
    postClaim(id: number, clientClaimApiDto: ClientClaimApiDto): Promise<ClientClaimApiDto>;
    protected processPostClaim(response: Response): Promise<ClientClaimApiDto>;
    getClaim(claimId: number): Promise<ClientClaimApiDto>;
    protected processGetClaim(response: Response): Promise<ClientClaimApiDto>;
    deleteClaim(claimId: number): Promise<FileResponse>;
    protected processDeleteClaim(response: Response): Promise<FileResponse>;
}
export interface IConfigurationIssuesClient {
    get(): Promise<ConfigurationIssueDto[]>;
    getSummary(): Promise<ConfigurationIssueSummaryDto>;
}
export declare class ConfigurationIssuesClient extends WebApiClientBase implements IConfigurationIssuesClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(): Promise<ConfigurationIssueDto[]>;
    protected processGet(response: Response): Promise<ConfigurationIssueDto[]>;
    getSummary(): Promise<ConfigurationIssueSummaryDto>;
    protected processGetSummary(response: Response): Promise<ConfigurationIssueSummaryDto>;
}
export interface IDashboardClient {
    getDashboardIdentityServer(auditLogsLastNumberOfDays: number | undefined): Promise<DashboardDto>;
    getDashboardIdentity(): Promise<DashboardIdentityDto>;
}
export declare class DashboardClient extends WebApiClientBase implements IDashboardClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    getDashboardIdentityServer(auditLogsLastNumberOfDays: number | undefined): Promise<DashboardDto>;
    protected processGetDashboardIdentityServer(response: Response): Promise<DashboardDto>;
    getDashboardIdentity(): Promise<DashboardIdentityDto>;
    protected processGetDashboardIdentity(response: Response): Promise<DashboardIdentityDto>;
}
export interface IIdentityProvidersClient {
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityProvidersApiDto>;
    post(identityProviderApi: IdentityProviderApiDto): Promise<void>;
    put(identityProviderApi: IdentityProviderApiDto): Promise<FileResponse>;
    canInsertIdentityProvider(id: number | undefined, schema: string | null | undefined): Promise<boolean>;
    get2(id: number): Promise<IdentityProviderApiDto>;
    delete(id: number): Promise<FileResponse>;
}
export declare class IdentityProvidersClient extends WebApiClientBase implements IIdentityProvidersClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityProvidersApiDto>;
    protected processGet(response: Response): Promise<IdentityProvidersApiDto>;
    post(identityProviderApi: IdentityProviderApiDto): Promise<void>;
    protected processPost(response: Response): Promise<void>;
    put(identityProviderApi: IdentityProviderApiDto): Promise<FileResponse>;
    protected processPut(response: Response): Promise<FileResponse>;
    canInsertIdentityProvider(id: number | undefined, schema: string | null | undefined): Promise<boolean>;
    protected processCanInsertIdentityProvider(response: Response): Promise<boolean>;
    get2(id: number): Promise<IdentityProviderApiDto>;
    protected processGet2(response: Response): Promise<IdentityProviderApiDto>;
    delete(id: number): Promise<FileResponse>;
    protected processDelete(response: Response): Promise<FileResponse>;
}
export interface IIdentityResourcesClient {
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityResourcesApiDto>;
    post(identityResourceApi: IdentityResourceApiDto): Promise<IdentityResourceApiDto>;
    put(identityResourceApi: IdentityResourceApiDto): Promise<void>;
    get2(id: number): Promise<IdentityResourceApiDto>;
    delete(id: number): Promise<void>;
    canInsertIdentityResource(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    canInsertIdentityResourceProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<IdentityResourcePropertiesApiDto>;
    postProperty(id: number, identityResourcePropertyApi: IdentityResourcePropertyApiDto): Promise<IdentityResourcePropertyApiDto>;
    getProperty(propertyId: number): Promise<IdentityResourcePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
}
export declare class IdentityResourcesClient extends WebApiClientBase implements IIdentityResourcesClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityResourcesApiDto>;
    protected processGet(response: Response): Promise<IdentityResourcesApiDto>;
    post(identityResourceApi: IdentityResourceApiDto): Promise<IdentityResourceApiDto>;
    protected processPost(response: Response): Promise<IdentityResourceApiDto>;
    put(identityResourceApi: IdentityResourceApiDto): Promise<void>;
    protected processPut(response: Response): Promise<void>;
    get2(id: number): Promise<IdentityResourceApiDto>;
    protected processGet2(response: Response): Promise<IdentityResourceApiDto>;
    delete(id: number): Promise<void>;
    protected processDelete(response: Response): Promise<void>;
    canInsertIdentityResource(id: number | undefined, name: string | null | undefined): Promise<boolean>;
    protected processCanInsertIdentityResource(response: Response): Promise<boolean>;
    canInsertIdentityResourceProperty(id: number | undefined, key: string | null | undefined): Promise<boolean>;
    protected processCanInsertIdentityResourceProperty(response: Response): Promise<boolean>;
    getProperties(id: number, page: number | undefined, pageSize: number | undefined): Promise<IdentityResourcePropertiesApiDto>;
    protected processGetProperties(response: Response): Promise<IdentityResourcePropertiesApiDto>;
    postProperty(id: number, identityResourcePropertyApi: IdentityResourcePropertyApiDto): Promise<IdentityResourcePropertyApiDto>;
    protected processPostProperty(response: Response): Promise<IdentityResourcePropertyApiDto>;
    getProperty(propertyId: number): Promise<IdentityResourcePropertyApiDto>;
    protected processGetProperty(response: Response): Promise<IdentityResourcePropertyApiDto>;
    deleteProperty(propertyId: number): Promise<void>;
    protected processDeleteProperty(response: Response): Promise<void>;
}
export interface IInfoClient {
    getApplicationVersion(): Promise<string>;
    getApplicationName(): Promise<string>;
}
export declare class InfoClient extends WebApiClientBase implements IInfoClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    getApplicationVersion(): Promise<string>;
    protected processGetApplicationVersion(response: Response): Promise<string>;
    getApplicationName(): Promise<string>;
    protected processGetApplicationName(response: Response): Promise<string>;
}
export interface IKeysClient {
    get(page: number | undefined, pageSize: number | undefined): Promise<KeysApiDto>;
    get2(id: string): Promise<KeyApiDto>;
    delete(id: string): Promise<FileResponse>;
}
export declare class KeysClient extends WebApiClientBase implements IKeysClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(page: number | undefined, pageSize: number | undefined): Promise<KeysApiDto>;
    protected processGet(response: Response): Promise<KeysApiDto>;
    get2(id: string): Promise<KeyApiDto>;
    protected processGet2(response: Response): Promise<KeyApiDto>;
    delete(id: string): Promise<FileResponse>;
    protected processDelete(response: Response): Promise<FileResponse>;
}
export interface ILogsClient {
    auditLog(event: string | null | undefined, source: string | null | undefined, category: string | null | undefined, createdDate: string | null | undefined, subjectIdentifier: string | null | undefined, subjectName: string | null | undefined, pageSize: number | undefined, page: number | undefined): Promise<AuditLogsDto>;
}
export declare class LogsClient extends WebApiClientBase implements ILogsClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    auditLog(event: string | null | undefined, source: string | null | undefined, category: string | null | undefined, createdDate: string | null | undefined, subjectIdentifier: string | null | undefined, subjectName: string | null | undefined, pageSize: number | undefined, page: number | undefined): Promise<AuditLogsDto>;
    protected processAuditLog(response: Response): Promise<AuditLogsDto>;
}
export interface IPersistedGrantsClient {
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<PersistedGrantSubjectsApiDto>;
    get2(id: string): Promise<PersistedGrantApiDto>;
    delete(id: string): Promise<FileResponse>;
    getBySubject(subjectId: string, page: number | undefined, pageSize: number | undefined): Promise<PersistedGrantsApiDto>;
    deleteBySubject(subjectId: string): Promise<FileResponse>;
}
export declare class PersistedGrantsClient extends WebApiClientBase implements IPersistedGrantsClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<PersistedGrantSubjectsApiDto>;
    protected processGet(response: Response): Promise<PersistedGrantSubjectsApiDto>;
    get2(id: string): Promise<PersistedGrantApiDto>;
    protected processGet2(response: Response): Promise<PersistedGrantApiDto>;
    delete(id: string): Promise<FileResponse>;
    protected processDelete(response: Response): Promise<FileResponse>;
    getBySubject(subjectId: string, page: number | undefined, pageSize: number | undefined): Promise<PersistedGrantsApiDto>;
    protected processGetBySubject(response: Response): Promise<PersistedGrantsApiDto>;
    deleteBySubject(subjectId: string): Promise<FileResponse>;
    protected processDeleteBySubject(response: Response): Promise<FileResponse>;
}
export interface IRolesClient {
    get(id: string): Promise<IdentityRoleDto>;
    delete(id: string): Promise<FileResponse>;
    get2(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityRolesDto>;
    post(role: IdentityRoleDto): Promise<IdentityRoleDto>;
    put(role: IdentityRoleDto): Promise<FileResponse>;
    getRoleUsers(id: string, searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    getRoleClaims(id: string, page: number | undefined, pageSize: number | undefined): Promise<RoleClaimsApiDtoOfString>;
    deleteRoleClaims(id: string, claimId: number | undefined): Promise<FileResponse>;
    postRoleClaims(roleClaims: RoleClaimApiDtoOfString): Promise<FileResponse>;
    putRoleClaims(roleClaims: RoleClaimApiDtoOfString): Promise<FileResponse>;
}
export declare class RolesClient extends WebApiClientBase implements IRolesClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(id: string): Promise<IdentityRoleDto>;
    protected processGet(response: Response): Promise<IdentityRoleDto>;
    delete(id: string): Promise<FileResponse>;
    protected processDelete(response: Response): Promise<FileResponse>;
    get2(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityRolesDto>;
    protected processGet2(response: Response): Promise<IdentityRolesDto>;
    post(role: IdentityRoleDto): Promise<IdentityRoleDto>;
    protected processPost(response: Response): Promise<IdentityRoleDto>;
    put(role: IdentityRoleDto): Promise<FileResponse>;
    protected processPut(response: Response): Promise<FileResponse>;
    getRoleUsers(id: string, searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    protected processGetRoleUsers(response: Response): Promise<IdentityUsersDto>;
    getRoleClaims(id: string, page: number | undefined, pageSize: number | undefined): Promise<RoleClaimsApiDtoOfString>;
    protected processGetRoleClaims(response: Response): Promise<RoleClaimsApiDtoOfString>;
    deleteRoleClaims(id: string, claimId: number | undefined): Promise<FileResponse>;
    protected processDeleteRoleClaims(response: Response): Promise<FileResponse>;
    postRoleClaims(roleClaims: RoleClaimApiDtoOfString): Promise<FileResponse>;
    protected processPostRoleClaims(response: Response): Promise<FileResponse>;
    putRoleClaims(roleClaims: RoleClaimApiDtoOfString): Promise<FileResponse>;
    protected processPutRoleClaims(response: Response): Promise<FileResponse>;
}
export interface IUsersClient {
    get(id: string): Promise<IdentityUserDto>;
    delete(id: string): Promise<FileResponse>;
    get2(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    post(user: IdentityUserDto): Promise<IdentityUserDto>;
    put(user: IdentityUserDto): Promise<FileResponse>;
    getUserRoles(id: string, page: number | undefined, pageSize: number | undefined): Promise<UserRolesApiDtoOfIdentityRoleDto>;
    postUserRoles(role: UserRoleApiDtoOfString): Promise<FileResponse>;
    deleteUserRoles(role: UserRoleApiDtoOfString): Promise<FileResponse>;
    getUserClaims(id: string, page: number | undefined, pageSize: number | undefined): Promise<UserClaimsApiDtoOfString>;
    deleteUserClaims(id: string, claimId: number | undefined): Promise<FileResponse>;
    postUserClaims(claim: UserClaimApiDtoOfString): Promise<FileResponse>;
    putUserClaims(claim: UserClaimApiDtoOfString): Promise<FileResponse>;
    getUserProviders(id: string): Promise<UserProvidersApiDtoOfString>;
    deleteUserProviders(provider: UserProviderDeleteApiDtoOfString): Promise<FileResponse>;
    postChangePassword(password: UserChangePasswordApiDtoOfString): Promise<FileResponse>;
    getRoleClaims(id: string, claimSearchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<RoleClaimsApiDtoOfString>;
    getClaimUsers(claimType: string, claimValue: string, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    getClaimUsers2(claimType: string, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
}
export declare class UsersClient extends WebApiClientBase implements IUsersClient {
    private http;
    private baseUrl;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined;
    constructor(baseUrl?: string, http?: {
        fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
    });
    get(id: string): Promise<IdentityUserDto>;
    protected processGet(response: Response): Promise<IdentityUserDto>;
    delete(id: string): Promise<FileResponse>;
    protected processDelete(response: Response): Promise<FileResponse>;
    get2(searchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    protected processGet2(response: Response): Promise<IdentityUsersDto>;
    post(user: IdentityUserDto): Promise<IdentityUserDto>;
    protected processPost(response: Response): Promise<IdentityUserDto>;
    put(user: IdentityUserDto): Promise<FileResponse>;
    protected processPut(response: Response): Promise<FileResponse>;
    getUserRoles(id: string, page: number | undefined, pageSize: number | undefined): Promise<UserRolesApiDtoOfIdentityRoleDto>;
    protected processGetUserRoles(response: Response): Promise<UserRolesApiDtoOfIdentityRoleDto>;
    postUserRoles(role: UserRoleApiDtoOfString): Promise<FileResponse>;
    protected processPostUserRoles(response: Response): Promise<FileResponse>;
    deleteUserRoles(role: UserRoleApiDtoOfString): Promise<FileResponse>;
    protected processDeleteUserRoles(response: Response): Promise<FileResponse>;
    getUserClaims(id: string, page: number | undefined, pageSize: number | undefined): Promise<UserClaimsApiDtoOfString>;
    protected processGetUserClaims(response: Response): Promise<UserClaimsApiDtoOfString>;
    deleteUserClaims(id: string, claimId: number | undefined): Promise<FileResponse>;
    protected processDeleteUserClaims(response: Response): Promise<FileResponse>;
    postUserClaims(claim: UserClaimApiDtoOfString): Promise<FileResponse>;
    protected processPostUserClaims(response: Response): Promise<FileResponse>;
    putUserClaims(claim: UserClaimApiDtoOfString): Promise<FileResponse>;
    protected processPutUserClaims(response: Response): Promise<FileResponse>;
    getUserProviders(id: string): Promise<UserProvidersApiDtoOfString>;
    protected processGetUserProviders(response: Response): Promise<UserProvidersApiDtoOfString>;
    deleteUserProviders(provider: UserProviderDeleteApiDtoOfString): Promise<FileResponse>;
    protected processDeleteUserProviders(response: Response): Promise<FileResponse>;
    postChangePassword(password: UserChangePasswordApiDtoOfString): Promise<FileResponse>;
    protected processPostChangePassword(response: Response): Promise<FileResponse>;
    getRoleClaims(id: string, claimSearchText: string | null | undefined, page: number | undefined, pageSize: number | undefined): Promise<RoleClaimsApiDtoOfString>;
    protected processGetRoleClaims(response: Response): Promise<RoleClaimsApiDtoOfString>;
    getClaimUsers(claimType: string, claimValue: string, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    protected processGetClaimUsers(response: Response): Promise<IdentityUsersDto>;
    getClaimUsers2(claimType: string, page: number | undefined, pageSize: number | undefined): Promise<IdentityUsersDto>;
    protected processGetClaimUsers2(response: Response): Promise<IdentityUsersDto>;
}
export declare class ApiResourcesApiDto implements IApiResourcesApiDto {
    pageSize: number;
    totalCount: number;
    apiResources: ApiResourceApiDto[] | undefined;
    constructor(data?: IApiResourcesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiResourcesApiDto;
    toJSON(data?: any): any;
}
export interface IApiResourcesApiDto {
    pageSize: number;
    totalCount: number;
    apiResources: ApiResourceApiDto[] | undefined;
}
export declare class ApiResourceApiDto implements IApiResourceApiDto {
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    enabled: boolean;
    showInDiscoveryDocument: boolean;
    requireResourceIndicator: boolean;
    userClaims: string[] | undefined;
    allowedAccessTokenSigningAlgorithms: string[] | undefined;
    scopes: string[] | undefined;
    constructor(data?: IApiResourceApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiResourceApiDto;
    toJSON(data?: any): any;
}
export interface IApiResourceApiDto {
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    enabled: boolean;
    showInDiscoveryDocument: boolean;
    requireResourceIndicator: boolean;
    userClaims: string[] | undefined;
    allowedAccessTokenSigningAlgorithms: string[] | undefined;
    scopes: string[] | undefined;
}
export declare class ProblemDetails implements IProblemDetails {
    type: string | undefined;
    title: string | undefined;
    status: number | undefined;
    detail: string | undefined;
    instance: string | undefined;
    [key: string]: any;
    constructor(data?: IProblemDetails);
    init(_data?: any): void;
    static fromJS(data: any): ProblemDetails;
    toJSON(data?: any): any;
}
export interface IProblemDetails {
    type: string | undefined;
    title: string | undefined;
    status: number | undefined;
    detail: string | undefined;
    instance: string | undefined;
    [key: string]: any;
}
export declare class ApiSecretsApiDto implements IApiSecretsApiDto {
    totalCount: number;
    pageSize: number;
    apiSecrets: ApiSecretApiDto[] | undefined;
    constructor(data?: IApiSecretsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiSecretsApiDto;
    toJSON(data?: any): any;
}
export interface IApiSecretsApiDto {
    totalCount: number;
    pageSize: number;
    apiSecrets: ApiSecretApiDto[] | undefined;
}
export declare class ApiSecretApiDto implements IApiSecretApiDto {
    type: string;
    id: number;
    description: string | undefined;
    value: string;
    hashType: string | undefined;
    expiration: Date | undefined;
    created: Date;
    constructor(data?: IApiSecretApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiSecretApiDto;
    toJSON(data?: any): any;
}
export interface IApiSecretApiDto {
    type: string;
    id: number;
    description: string | undefined;
    value: string;
    hashType: string | undefined;
    expiration: Date | undefined;
    created: Date;
}
export declare class ApiResourcePropertiesApiDto implements IApiResourcePropertiesApiDto {
    apiResourceProperties: ApiResourcePropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IApiResourcePropertiesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiResourcePropertiesApiDto;
    toJSON(data?: any): any;
}
export interface IApiResourcePropertiesApiDto {
    apiResourceProperties: ApiResourcePropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class ApiResourcePropertyApiDto implements IApiResourcePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
    constructor(data?: IApiResourcePropertyApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiResourcePropertyApiDto;
    toJSON(data?: any): any;
}
export interface IApiResourcePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
}
export declare class ApiScopesApiDto implements IApiScopesApiDto {
    pageSize: number;
    totalCount: number;
    scopes: ApiScopeApiDto[] | undefined;
    constructor(data?: IApiScopesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopesApiDto;
    toJSON(data?: any): any;
}
export interface IApiScopesApiDto {
    pageSize: number;
    totalCount: number;
    scopes: ApiScopeApiDto[] | undefined;
}
export declare class ApiScopeApiDto implements IApiScopeApiDto {
    showInDiscoveryDocument: boolean;
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    required: boolean;
    emphasize: boolean;
    enabled: boolean;
    userClaims: string[] | undefined;
    apiScopeProperties: ApiScopePropertyApiDto[] | undefined;
    constructor(data?: IApiScopeApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopeApiDto;
    toJSON(data?: any): any;
}
export interface IApiScopeApiDto {
    showInDiscoveryDocument: boolean;
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    required: boolean;
    emphasize: boolean;
    enabled: boolean;
    userClaims: string[] | undefined;
    apiScopeProperties: ApiScopePropertyApiDto[] | undefined;
}
export declare class ApiScopePropertyApiDto implements IApiScopePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
    constructor(data?: IApiScopePropertyApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopePropertyApiDto;
    toJSON(data?: any): any;
}
export interface IApiScopePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
}
export declare class ApiScopePropertiesApiDto implements IApiScopePropertiesApiDto {
    apiScopeProperties: ApiScopePropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IApiScopePropertiesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopePropertiesApiDto;
    toJSON(data?: any): any;
}
export interface IApiScopePropertiesApiDto {
    apiScopeProperties: ApiScopePropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class ApiScopeDto implements IApiScopeDto {
    showInDiscoveryDocument: boolean;
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    required: boolean;
    emphasize: boolean;
    userClaims: string[] | undefined;
    userClaimsItems: string | undefined;
    enabled: boolean;
    apiScopeProperties: ApiScopePropertyDto[] | undefined;
    constructor(data?: IApiScopeDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopeDto;
    toJSON(data?: any): any;
}
export interface IApiScopeDto {
    showInDiscoveryDocument: boolean;
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    required: boolean;
    emphasize: boolean;
    userClaims: string[] | undefined;
    userClaimsItems: string | undefined;
    enabled: boolean;
    apiScopeProperties: ApiScopePropertyDto[] | undefined;
}
export declare class ApiScopePropertyDto implements IApiScopePropertyDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
    constructor(data?: IApiScopePropertyDto);
    init(_data?: any): void;
    static fromJS(data: any): ApiScopePropertyDto;
    toJSON(data?: any): any;
}
export interface IApiScopePropertyDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
}
export declare class ClientsApiDto implements IClientsApiDto {
    clients: ClientApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IClientsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientsApiDto;
    toJSON(data?: any): any;
}
export interface IClientsApiDto {
    clients: ClientApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class ClientApiDto implements IClientApiDto {
    absoluteRefreshTokenLifetime: number;
    accessTokenLifetime: number;
    consentLifetime: number | undefined;
    accessTokenType: number;
    allowAccessTokensViaBrowser: boolean;
    allowOfflineAccess: boolean;
    allowPlainTextPkce: boolean;
    allowRememberConsent: boolean;
    alwaysIncludeUserClaimsInIdToken: boolean;
    alwaysSendClientClaims: boolean;
    authorizationCodeLifetime: number;
    frontChannelLogoutUri: string | undefined;
    frontChannelLogoutSessionRequired: boolean;
    backChannelLogoutUri: string | undefined;
    backChannelLogoutSessionRequired: boolean;
    clientId: string;
    clientName: string;
    clientUri: string | undefined;
    description: string | undefined;
    enabled: boolean;
    enableLocalLogin: boolean;
    id: number;
    identityTokenLifetime: number;
    includeJwtId: boolean;
    logoUri: string | undefined;
    clientClaimsPrefix: string | undefined;
    pairWiseSubjectSalt: string | undefined;
    protocolType: string | undefined;
    refreshTokenExpiration: number;
    refreshTokenUsage: number;
    slidingRefreshTokenLifetime: number;
    requireClientSecret: boolean;
    requireConsent: boolean;
    requirePkce: boolean;
    updateAccessTokenClaimsOnRefresh: boolean;
    postLogoutRedirectUris: string[] | undefined;
    identityProviderRestrictions: string[] | undefined;
    redirectUris: string[] | undefined;
    allowedCorsOrigins: string[] | undefined;
    allowedGrantTypes: string[] | undefined;
    allowedScopes: string[] | undefined;
    claims: ClientClaimApiDto[] | undefined;
    properties: ClientPropertyApiDto[] | undefined;
    updated: Date | undefined;
    lastAccessed: Date | undefined;
    userSsoLifetime: number | undefined;
    userCodeType: string | undefined;
    deviceCodeLifetime: number;
    requireRequestObject: boolean;
    cibaLifetime: number | undefined;
    pollingInterval: number | undefined;
    coordinateLifetimeWithUserSession: boolean;
    requireDPoP: boolean;
    dPoPValidationMode: number;
    dPoPClockSkew: string;
    pushedAuthorizationLifetime: number | undefined;
    requirePushedAuthorization: boolean;
    initiateLoginUri: string | undefined;
    allowedIdentityTokenSigningAlgorithms: string[] | undefined;
    nonEditable: boolean;
    constructor(data?: IClientApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientApiDto;
    toJSON(data?: any): any;
}
export interface IClientApiDto {
    absoluteRefreshTokenLifetime: number;
    accessTokenLifetime: number;
    consentLifetime: number | undefined;
    accessTokenType: number;
    allowAccessTokensViaBrowser: boolean;
    allowOfflineAccess: boolean;
    allowPlainTextPkce: boolean;
    allowRememberConsent: boolean;
    alwaysIncludeUserClaimsInIdToken: boolean;
    alwaysSendClientClaims: boolean;
    authorizationCodeLifetime: number;
    frontChannelLogoutUri: string | undefined;
    frontChannelLogoutSessionRequired: boolean;
    backChannelLogoutUri: string | undefined;
    backChannelLogoutSessionRequired: boolean;
    clientId: string;
    clientName: string;
    clientUri: string | undefined;
    description: string | undefined;
    enabled: boolean;
    enableLocalLogin: boolean;
    id: number;
    identityTokenLifetime: number;
    includeJwtId: boolean;
    logoUri: string | undefined;
    clientClaimsPrefix: string | undefined;
    pairWiseSubjectSalt: string | undefined;
    protocolType: string | undefined;
    refreshTokenExpiration: number;
    refreshTokenUsage: number;
    slidingRefreshTokenLifetime: number;
    requireClientSecret: boolean;
    requireConsent: boolean;
    requirePkce: boolean;
    updateAccessTokenClaimsOnRefresh: boolean;
    postLogoutRedirectUris: string[] | undefined;
    identityProviderRestrictions: string[] | undefined;
    redirectUris: string[] | undefined;
    allowedCorsOrigins: string[] | undefined;
    allowedGrantTypes: string[] | undefined;
    allowedScopes: string[] | undefined;
    claims: ClientClaimApiDto[] | undefined;
    properties: ClientPropertyApiDto[] | undefined;
    updated: Date | undefined;
    lastAccessed: Date | undefined;
    userSsoLifetime: number | undefined;
    userCodeType: string | undefined;
    deviceCodeLifetime: number;
    requireRequestObject: boolean;
    cibaLifetime: number | undefined;
    pollingInterval: number | undefined;
    coordinateLifetimeWithUserSession: boolean;
    requireDPoP: boolean;
    dPoPValidationMode: number;
    dPoPClockSkew: string;
    pushedAuthorizationLifetime: number | undefined;
    requirePushedAuthorization: boolean;
    initiateLoginUri: string | undefined;
    allowedIdentityTokenSigningAlgorithms: string[] | undefined;
    nonEditable: boolean;
}
export declare class ClientClaimApiDto implements IClientClaimApiDto {
    id: number;
    type: string;
    value: string;
    constructor(data?: IClientClaimApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientClaimApiDto;
    toJSON(data?: any): any;
}
export interface IClientClaimApiDto {
    id: number;
    type: string;
    value: string;
}
export declare class ClientPropertyApiDto implements IClientPropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
    constructor(data?: IClientPropertyApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientPropertyApiDto;
    toJSON(data?: any): any;
}
export interface IClientPropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
}
export declare class SelectItemDto implements ISelectItemDto {
    id: string | undefined;
    text: string | undefined;
    constructor(data?: ISelectItemDto);
    init(_data?: any): void;
    static fromJS(data: any): SelectItemDto;
    toJSON(data?: any): any;
}
export interface ISelectItemDto {
    id: string | undefined;
    text: string | undefined;
}
export declare class ClientCloneApiDto implements IClientCloneApiDto {
    id: number;
    clientId: string;
    clientName: string;
    cloneClientCorsOrigins: boolean;
    cloneClientRedirectUris: boolean;
    cloneClientIdPRestrictions: boolean;
    cloneClientPostLogoutRedirectUris: boolean;
    cloneClientGrantTypes: boolean;
    cloneClientScopes: boolean;
    cloneClientClaims: boolean;
    cloneClientProperties: boolean;
    constructor(data?: IClientCloneApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientCloneApiDto;
    toJSON(data?: any): any;
}
export interface IClientCloneApiDto {
    id: number;
    clientId: string;
    clientName: string;
    cloneClientCorsOrigins: boolean;
    cloneClientRedirectUris: boolean;
    cloneClientIdPRestrictions: boolean;
    cloneClientPostLogoutRedirectUris: boolean;
    cloneClientGrantTypes: boolean;
    cloneClientScopes: boolean;
    cloneClientClaims: boolean;
    cloneClientProperties: boolean;
}
export declare class ClientSecretsApiDto implements IClientSecretsApiDto {
    totalCount: number;
    pageSize: number;
    clientSecrets: ClientSecretApiDto[] | undefined;
    constructor(data?: IClientSecretsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientSecretsApiDto;
    toJSON(data?: any): any;
}
export interface IClientSecretsApiDto {
    totalCount: number;
    pageSize: number;
    clientSecrets: ClientSecretApiDto[] | undefined;
}
export declare class ClientSecretApiDto implements IClientSecretApiDto {
    type: string;
    id: number;
    description: string | undefined;
    value: string;
    hashType: string | undefined;
    expiration: Date | undefined;
    created: Date;
    constructor(data?: IClientSecretApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientSecretApiDto;
    toJSON(data?: any): any;
}
export interface IClientSecretApiDto {
    type: string;
    id: number;
    description: string | undefined;
    value: string;
    hashType: string | undefined;
    expiration: Date | undefined;
    created: Date;
}
export declare class ClientPropertiesApiDto implements IClientPropertiesApiDto {
    clientProperties: ClientPropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IClientPropertiesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientPropertiesApiDto;
    toJSON(data?: any): any;
}
export interface IClientPropertiesApiDto {
    clientProperties: ClientPropertyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class ClientClaimsApiDto implements IClientClaimsApiDto {
    clientClaims: ClientClaimApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IClientClaimsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): ClientClaimsApiDto;
    toJSON(data?: any): any;
}
export interface IClientClaimsApiDto {
    clientClaims: ClientClaimApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class ConfigurationIssueDto implements IConfigurationIssueDto {
    resourceId: number;
    resourceName: string | undefined;
    message: ConfigurationIssueMessageEnum;
    issueType: ConfigurationIssueTypeView;
    resourceType: ConfigurationResourceType;
    constructor(data?: IConfigurationIssueDto);
    init(_data?: any): void;
    static fromJS(data: any): ConfigurationIssueDto;
    toJSON(data?: any): any;
}
export interface IConfigurationIssueDto {
    resourceId: number;
    resourceName: string | undefined;
    message: ConfigurationIssueMessageEnum;
    issueType: ConfigurationIssueTypeView;
    resourceType: ConfigurationResourceType;
}
export declare enum ConfigurationIssueMessageEnum {
    ObsoleteImplicitGrant = 0,
    ObsoletePasswordGrant = 1,
    MissingPkce = 2
}
export declare enum ConfigurationIssueTypeView {
    Warning = 0,
    Recommendation = 1
}
export declare enum ConfigurationResourceType {
    Client = 0,
    IdentityResource = 1,
    ApiResource = 2,
    ApiScope = 3
}
export declare class ConfigurationIssueSummaryDto implements IConfigurationIssueSummaryDto {
    warnings: number;
    recommendations: number;
    constructor(data?: IConfigurationIssueSummaryDto);
    init(_data?: any): void;
    static fromJS(data: any): ConfigurationIssueSummaryDto;
    toJSON(data?: any): any;
}
export interface IConfigurationIssueSummaryDto {
    warnings: number;
    recommendations: number;
}
export declare class DashboardDto implements IDashboardDto {
    clientsTotal: number;
    apiResourcesTotal: number;
    apiScopesTotal: number;
    identityResourcesTotal: number;
    identityProvidersTotal: number;
    auditLogsAvg: number;
    auditLogsPerDaysTotal: DashboardAuditLogDto[] | undefined;
    constructor(data?: IDashboardDto);
    init(_data?: any): void;
    static fromJS(data: any): DashboardDto;
    toJSON(data?: any): any;
}
export interface IDashboardDto {
    clientsTotal: number;
    apiResourcesTotal: number;
    apiScopesTotal: number;
    identityResourcesTotal: number;
    identityProvidersTotal: number;
    auditLogsAvg: number;
    auditLogsPerDaysTotal: DashboardAuditLogDto[] | undefined;
}
export declare class DashboardAuditLogDto implements IDashboardAuditLogDto {
    total: number;
    created: Date;
    constructor(data?: IDashboardAuditLogDto);
    init(_data?: any): void;
    static fromJS(data: any): DashboardAuditLogDto;
    toJSON(data?: any): any;
}
export interface IDashboardAuditLogDto {
    total: number;
    created: Date;
}
export declare class DashboardIdentityDto implements IDashboardIdentityDto {
    usersTotal: number;
    rolesTotal: number;
    constructor(data?: IDashboardIdentityDto);
    init(_data?: any): void;
    static fromJS(data: any): DashboardIdentityDto;
    toJSON(data?: any): any;
}
export interface IDashboardIdentityDto {
    usersTotal: number;
    rolesTotal: number;
}
export declare class IdentityProvidersApiDto implements IIdentityProvidersApiDto {
    pageSize: number;
    totalCount: number;
    identityProviders: IdentityProviderApiDto[] | undefined;
    constructor(data?: IIdentityProvidersApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityProvidersApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityProvidersApiDto {
    pageSize: number;
    totalCount: number;
    identityProviders: IdentityProviderApiDto[] | undefined;
}
export declare class IdentityProviderApiDto implements IIdentityProviderApiDto {
    type: string | undefined;
    id: number;
    scheme: string;
    displayName: string | undefined;
    enabled: boolean;
    identityProviderProperties: {
        [key: string]: string;
    } | undefined;
    constructor(data?: IIdentityProviderApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityProviderApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityProviderApiDto {
    type: string | undefined;
    id: number;
    scheme: string;
    displayName: string | undefined;
    enabled: boolean;
    identityProviderProperties: {
        [key: string]: string;
    } | undefined;
}
export declare class IdentityResourcesApiDto implements IIdentityResourcesApiDto {
    pageSize: number;
    totalCount: number;
    identityResources: IdentityResourceApiDto[] | undefined;
    constructor(data?: IIdentityResourcesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityResourcesApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityResourcesApiDto {
    pageSize: number;
    totalCount: number;
    identityResources: IdentityResourceApiDto[] | undefined;
}
export declare class IdentityResourceApiDto implements IIdentityResourceApiDto {
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    enabled: boolean;
    showInDiscoveryDocument: boolean;
    required: boolean;
    emphasize: boolean;
    userClaims: string[] | undefined;
    constructor(data?: IIdentityResourceApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityResourceApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityResourceApiDto {
    id: number;
    name: string;
    displayName: string | undefined;
    description: string | undefined;
    enabled: boolean;
    showInDiscoveryDocument: boolean;
    required: boolean;
    emphasize: boolean;
    userClaims: string[] | undefined;
}
export declare class IdentityResourcePropertiesApiDto implements IIdentityResourcePropertiesApiDto {
    totalCount: number;
    pageSize: number;
    identityResourceProperties: IdentityResourcePropertyApiDto[] | undefined;
    constructor(data?: IIdentityResourcePropertiesApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityResourcePropertiesApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityResourcePropertiesApiDto {
    totalCount: number;
    pageSize: number;
    identityResourceProperties: IdentityResourcePropertyApiDto[] | undefined;
}
export declare class IdentityResourcePropertyApiDto implements IIdentityResourcePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
    constructor(data?: IIdentityResourcePropertyApiDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityResourcePropertyApiDto;
    toJSON(data?: any): any;
}
export interface IIdentityResourcePropertyApiDto {
    id: number;
    key: string | undefined;
    value: string | undefined;
}
export declare class KeysApiDto implements IKeysApiDto {
    keys: KeyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IKeysApiDto);
    init(_data?: any): void;
    static fromJS(data: any): KeysApiDto;
    toJSON(data?: any): any;
}
export interface IKeysApiDto {
    keys: KeyApiDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class KeyApiDto implements IKeyApiDto {
    id: string | undefined;
    version: number;
    created: Date;
    use: string | undefined;
    algorithm: string | undefined;
    isX509Certificate: boolean;
    constructor(data?: IKeyApiDto);
    init(_data?: any): void;
    static fromJS(data: any): KeyApiDto;
    toJSON(data?: any): any;
}
export interface IKeyApiDto {
    id: string | undefined;
    version: number;
    created: Date;
    use: string | undefined;
    algorithm: string | undefined;
    isX509Certificate: boolean;
}
export declare class AuditLogsDto implements IAuditLogsDto {
    deleteOlderThan: Date;
    logs: AuditLogDto[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IAuditLogsDto);
    init(_data?: any): void;
    static fromJS(data: any): AuditLogsDto;
    toJSON(data?: any): any;
}
export interface IAuditLogsDto {
    deleteOlderThan: Date;
    logs: AuditLogDto[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class AuditLogDto implements IAuditLogDto {
    id: number;
    event: string | undefined;
    source: string | undefined;
    category: string | undefined;
    subjectIdentifier: string | undefined;
    subjectName: string | undefined;
    subjectType: string | undefined;
    subjectAdditionalData: string | undefined;
    action: string | undefined;
    data: string | undefined;
    created: Date;
    constructor(data?: IAuditLogDto);
    init(_data?: any): void;
    static fromJS(data: any): AuditLogDto;
    toJSON(data?: any): any;
}
export interface IAuditLogDto {
    id: number;
    event: string | undefined;
    source: string | undefined;
    category: string | undefined;
    subjectIdentifier: string | undefined;
    subjectName: string | undefined;
    subjectType: string | undefined;
    subjectAdditionalData: string | undefined;
    action: string | undefined;
    data: string | undefined;
    created: Date;
}
export declare class PersistedGrantSubjectsApiDto implements IPersistedGrantSubjectsApiDto {
    totalCount: number;
    pageSize: number;
    persistedGrants: PersistedGrantSubjectApiDto[] | undefined;
    constructor(data?: IPersistedGrantSubjectsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): PersistedGrantSubjectsApiDto;
    toJSON(data?: any): any;
}
export interface IPersistedGrantSubjectsApiDto {
    totalCount: number;
    pageSize: number;
    persistedGrants: PersistedGrantSubjectApiDto[] | undefined;
}
export declare class PersistedGrantSubjectApiDto implements IPersistedGrantSubjectApiDto {
    id: number;
    key: string | undefined;
    type: string | undefined;
    subjectId: string | undefined;
    subjectName: string | undefined;
    clientId: string | undefined;
    creationTime: Date;
    expiration: Date | undefined;
    data: string | undefined;
    consumedTime: Date | undefined;
    sessionId: string | undefined;
    description: string | undefined;
    constructor(data?: IPersistedGrantSubjectApiDto);
    init(_data?: any): void;
    static fromJS(data: any): PersistedGrantSubjectApiDto;
    toJSON(data?: any): any;
}
export interface IPersistedGrantSubjectApiDto {
    id: number;
    key: string | undefined;
    type: string | undefined;
    subjectId: string | undefined;
    subjectName: string | undefined;
    clientId: string | undefined;
    creationTime: Date;
    expiration: Date | undefined;
    data: string | undefined;
    consumedTime: Date | undefined;
    sessionId: string | undefined;
    description: string | undefined;
}
export declare class PersistedGrantApiDto implements IPersistedGrantApiDto {
    id: number;
    key: string | undefined;
    type: string | undefined;
    subjectId: string | undefined;
    subjectName: string | undefined;
    clientId: string | undefined;
    creationTime: Date;
    expiration: Date | undefined;
    data: string | undefined;
    consumedTime: Date | undefined;
    sessionId: string | undefined;
    description: string | undefined;
    constructor(data?: IPersistedGrantApiDto);
    init(_data?: any): void;
    static fromJS(data: any): PersistedGrantApiDto;
    toJSON(data?: any): any;
}
export interface IPersistedGrantApiDto {
    id: number;
    key: string | undefined;
    type: string | undefined;
    subjectId: string | undefined;
    subjectName: string | undefined;
    clientId: string | undefined;
    creationTime: Date;
    expiration: Date | undefined;
    data: string | undefined;
    consumedTime: Date | undefined;
    sessionId: string | undefined;
    description: string | undefined;
}
export declare class PersistedGrantsApiDto implements IPersistedGrantsApiDto {
    totalCount: number;
    pageSize: number;
    persistedGrants: PersistedGrantApiDto[] | undefined;
    constructor(data?: IPersistedGrantsApiDto);
    init(_data?: any): void;
    static fromJS(data: any): PersistedGrantsApiDto;
    toJSON(data?: any): any;
}
export interface IPersistedGrantsApiDto {
    totalCount: number;
    pageSize: number;
    persistedGrants: PersistedGrantApiDto[] | undefined;
}
export declare class BaseRoleDtoOfString implements IBaseRoleDtoOfString {
    id: string | undefined;
    constructor(data?: IBaseRoleDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): BaseRoleDtoOfString;
    toJSON(data?: any): any;
}
export interface IBaseRoleDtoOfString {
    id: string | undefined;
}
export declare class RoleDtoOfString extends BaseRoleDtoOfString implements IRoleDtoOfString {
    name: string;
    constructor(data?: IRoleDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): RoleDtoOfString;
    toJSON(data?: any): any;
}
export interface IRoleDtoOfString extends IBaseRoleDtoOfString {
    name: string;
}
export declare class IdentityRoleDto extends RoleDtoOfString implements IIdentityRoleDto {
    constructor(data?: IIdentityRoleDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityRoleDto;
    toJSON(data?: any): any;
}
export interface IIdentityRoleDto extends IRoleDtoOfString {
}
export declare class RolesDtoOfIdentityRoleDtoAndString implements IRolesDtoOfIdentityRoleDtoAndString {
    pageSize: number;
    totalCount: number;
    roles: IdentityRoleDto[] | undefined;
    constructor(data?: IRolesDtoOfIdentityRoleDtoAndString);
    init(_data?: any): void;
    static fromJS(data: any): RolesDtoOfIdentityRoleDtoAndString;
    toJSON(data?: any): any;
}
export interface IRolesDtoOfIdentityRoleDtoAndString {
    pageSize: number;
    totalCount: number;
    roles: IdentityRoleDto[] | undefined;
}
export declare class IdentityRolesDto extends RolesDtoOfIdentityRoleDtoAndString implements IIdentityRolesDto {
    constructor(data?: IIdentityRolesDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityRolesDto;
    toJSON(data?: any): any;
}
export interface IIdentityRolesDto extends IRolesDtoOfIdentityRoleDtoAndString {
}
export declare class UsersDtoOfIdentityUserDtoAndString implements IUsersDtoOfIdentityUserDtoAndString {
    pageSize: number;
    totalCount: number;
    users: IdentityUserDto[] | undefined;
    constructor(data?: IUsersDtoOfIdentityUserDtoAndString);
    init(_data?: any): void;
    static fromJS(data: any): UsersDtoOfIdentityUserDtoAndString;
    toJSON(data?: any): any;
}
export interface IUsersDtoOfIdentityUserDtoAndString {
    pageSize: number;
    totalCount: number;
    users: IdentityUserDto[] | undefined;
}
export declare class IdentityUsersDto extends UsersDtoOfIdentityUserDtoAndString implements IIdentityUsersDto {
    constructor(data?: IIdentityUsersDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityUsersDto;
    toJSON(data?: any): any;
}
export interface IIdentityUsersDto extends IUsersDtoOfIdentityUserDtoAndString {
}
export declare class BaseUserDtoOfString implements IBaseUserDtoOfString {
    id: string | undefined;
    constructor(data?: IBaseUserDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): BaseUserDtoOfString;
    toJSON(data?: any): any;
}
export interface IBaseUserDtoOfString {
    id: string | undefined;
}
export declare class UserDtoOfString extends BaseUserDtoOfString implements IUserDtoOfString {
    userName: string;
    email: string;
    emailConfirmed: boolean;
    phoneNumber: string | undefined;
    phoneNumberConfirmed: boolean;
    lockoutEnabled: boolean;
    twoFactorEnabled: boolean;
    accessFailedCount: number;
    lockoutEnd: Date | undefined;
    constructor(data?: IUserDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserDtoOfString extends IBaseUserDtoOfString {
    userName: string;
    email: string;
    emailConfirmed: boolean;
    phoneNumber: string | undefined;
    phoneNumberConfirmed: boolean;
    lockoutEnabled: boolean;
    twoFactorEnabled: boolean;
    accessFailedCount: number;
    lockoutEnd: Date | undefined;
}
export declare class IdentityUserDto extends UserDtoOfString implements IIdentityUserDto {
    constructor(data?: IIdentityUserDto);
    init(_data?: any): void;
    static fromJS(data: any): IdentityUserDto;
    toJSON(data?: any): any;
}
export interface IIdentityUserDto extends IUserDtoOfString {
}
export declare class RoleClaimsApiDtoOfString implements IRoleClaimsApiDtoOfString {
    claims: RoleClaimApiDtoOfString[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IRoleClaimsApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): RoleClaimsApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IRoleClaimsApiDtoOfString {
    claims: RoleClaimApiDtoOfString[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class RoleClaimApiDtoOfString implements IRoleClaimApiDtoOfString {
    claimId: number;
    roleId: string | undefined;
    claimType: string;
    claimValue: string;
    constructor(data?: IRoleClaimApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): RoleClaimApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IRoleClaimApiDtoOfString {
    claimId: number;
    roleId: string | undefined;
    claimType: string;
    claimValue: string;
}
export declare class UserRolesApiDtoOfIdentityRoleDto implements IUserRolesApiDtoOfIdentityRoleDto {
    roles: IdentityRoleDto[] | undefined;
    pageSize: number;
    totalCount: number;
    constructor(data?: IUserRolesApiDtoOfIdentityRoleDto);
    init(_data?: any): void;
    static fromJS(data: any): UserRolesApiDtoOfIdentityRoleDto;
    toJSON(data?: any): any;
}
export interface IUserRolesApiDtoOfIdentityRoleDto {
    roles: IdentityRoleDto[] | undefined;
    pageSize: number;
    totalCount: number;
}
export declare class UserRoleApiDtoOfString implements IUserRoleApiDtoOfString {
    userId: string | undefined;
    roleId: string | undefined;
    constructor(data?: IUserRoleApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserRoleApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserRoleApiDtoOfString {
    userId: string | undefined;
    roleId: string | undefined;
}
export declare class UserClaimsApiDtoOfString implements IUserClaimsApiDtoOfString {
    claims: UserClaimApiDtoOfString[] | undefined;
    totalCount: number;
    pageSize: number;
    constructor(data?: IUserClaimsApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserClaimsApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserClaimsApiDtoOfString {
    claims: UserClaimApiDtoOfString[] | undefined;
    totalCount: number;
    pageSize: number;
}
export declare class UserClaimApiDtoOfString implements IUserClaimApiDtoOfString {
    claimId: number;
    userId: string | undefined;
    claimType: string;
    claimValue: string;
    constructor(data?: IUserClaimApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserClaimApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserClaimApiDtoOfString {
    claimId: number;
    userId: string | undefined;
    claimType: string;
    claimValue: string;
}
export declare class UserProvidersApiDtoOfString implements IUserProvidersApiDtoOfString {
    providers: UserProviderApiDtoOfString[] | undefined;
    constructor(data?: IUserProvidersApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserProvidersApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserProvidersApiDtoOfString {
    providers: UserProviderApiDtoOfString[] | undefined;
}
export declare class UserProviderApiDtoOfString implements IUserProviderApiDtoOfString {
    userId: string | undefined;
    userName: string | undefined;
    providerKey: string | undefined;
    loginProvider: string | undefined;
    providerDisplayName: string | undefined;
    constructor(data?: IUserProviderApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserProviderApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserProviderApiDtoOfString {
    userId: string | undefined;
    userName: string | undefined;
    providerKey: string | undefined;
    loginProvider: string | undefined;
    providerDisplayName: string | undefined;
}
export declare class UserProviderDeleteApiDtoOfString implements IUserProviderDeleteApiDtoOfString {
    userId: string | undefined;
    providerKey: string | undefined;
    loginProvider: string | undefined;
    constructor(data?: IUserProviderDeleteApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserProviderDeleteApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserProviderDeleteApiDtoOfString {
    userId: string | undefined;
    providerKey: string | undefined;
    loginProvider: string | undefined;
}
export declare class UserChangePasswordApiDtoOfString implements IUserChangePasswordApiDtoOfString {
    userId: string | undefined;
    password: string;
    confirmPassword: string;
    constructor(data?: IUserChangePasswordApiDtoOfString);
    init(_data?: any): void;
    static fromJS(data: any): UserChangePasswordApiDtoOfString;
    toJSON(data?: any): any;
}
export interface IUserChangePasswordApiDtoOfString {
    userId: string | undefined;
    password: string;
    confirmPassword: string;
}
export interface FileResponse {
    data: Blob;
    status: number;
    fileName?: string;
    headers?: {
        [name: string]: any;
    };
}
export declare class SwaggerException extends Error {
    message: string;
    status: number;
    response: string;
    headers: {
        [key: string]: any;
    };
    result: any;
    constructor(message: string, status: number, response: string, headers: {
        [key: string]: any;
    }, result: any);
    protected isSwaggerException: boolean;
    static isSwaggerException(obj: any): obj is SwaggerException;
}
