import { lazy } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Layout from "@/components/Layout/Layout";

// Lazy load all page components for better code splitting
const Home = lazy(() => import("@/pages/Home/Home"));
const Clients = lazy(() => import("@/pages/Clients/Clients"));
const ClientEdit = lazy(() => import("@/pages/Client/Edit/ClientEdit"));
const ClientClone = lazy(() => import("@/pages/Client/Clone/ClientClone"));
const ApiResources = lazy(() => import("@/pages/ApiResources/ApiResources"));
const ApiResourceCreate = lazy(() => import("@/pages/ApiResource/Create/ApiResourceCreate"));
const ApiResourceEdit = lazy(() => import("@/pages/ApiResource/Edit/ApiResourceEdit"));
const ApiScopes = lazy(() => import("@/pages/ApiScopes/ApiScopes"));
const ApiScopeCreate = lazy(() => import("@/pages/ApiScope/Create/ApiScopeCreate"));
const ApiScopeEdit = lazy(() => import("@/pages/ApiScope/Edit/ApiScopeEdit"));
const IdentityResources = lazy(() => import("@/pages/IdentityResources/IdentityResources"));
const IdentityResourceCreate = lazy(() => import("@/pages/IdentityResource/Create/IdentityResourceCreate"));
const IdentityResourceEdit = lazy(() => import("@/pages/IdentityResource/Edit/IdentityResourceEdit"));
const Users = lazy(() => import("@/pages/Users/Users"));
const Roles = lazy(() => import("@/pages/Roles/Roles"));
const RoleEdit = lazy(() => import("@/pages/Role/Edit/RoleEdit"));
const RoleCreate = lazy(() => import("@/pages/Role/Create/RoleCreate"));
const UserCreate = lazy(() => import("@/pages/User/Create/UserCreate"));
const UserEdit = lazy(() => import("@/pages/User/Edit/UserEdit"));
const IdentityProviders = lazy(() => import("@/pages/IdentityProviders/IdentityProviders"));
const IdentityProviderCreate = lazy(() => import("@/pages/IdentityProvider/Create/IdentityProviderCreate"));
const IdentityProviderEdit = lazy(() => import("@/pages/IdentityProvider/Edit/IdentityProviderEdit"));
const Keys = lazy(() => import("@/pages/Keys/Keys"));
const ConfigurationIssues = lazy(() => import("@/pages/ConfigurationIssues/ConfigurationIssues"));
const ConfigurationRules = lazy(() => import("@/pages/ConfigurationRules/ConfigurationRules"));
const AuditLogs = lazy(() => import("@/pages/AuditLogs/AuditLogs"));
const RoleUsers = lazy(() => import("@/pages/RoleUsers/RoleUsers"));
import { getBaseHref } from "@/lib/utils";
import {
  HomeUrl,
  ClientsUrl,
  ClientEditUrl,
  ClientCloneUrl,
  ApiResourcesUrl,
  ApiResourceCreateUrl,
  ApiResourceEditUrl,
  ApiScopesUrl,
  ApiScopeCreateUrl,
  ApiScopeEditUrl,
  IdentityResourcesUrl,
  IdentityResourceCreateUrl,
  IdentityResourceEditUrl,
  UsersUrl,
  UserCreateUrl,
  UserEditUrl,
  RolesUrl,
  RoleCreateUrl,
  RoleEditUrl,
  IdentityProvidersUrl,
  IdentityProviderCreateUrl,
  IdentityProviderEditUrl,
  KeysUrl,
  ConfigurationIssuesUrl,
  ConfigurationRulesUrl,
  AuditLogsUrl,
  RoleUsersUrl,
  NotFoundUrl,
} from "./Urls";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const baseHref = getBaseHref();

const RouteGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, login } = useAuth();

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated} login={login}>
      {children}
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        {
          path: HomeUrl,
          element: (
            <RouteGuard>
              <Home />
            </RouteGuard>
          ),
        },
        {
          path: ClientsUrl,
          element: (
            <RouteGuard>
              <Clients />
            </RouteGuard>
          ),
        },
        {
          path: ClientEditUrl,
          element: (
            <RouteGuard>
              <ClientEdit />
            </RouteGuard>
          ),
        },
        {
          path: ClientCloneUrl,
          element: (
            <RouteGuard>
              <ClientClone />
            </RouteGuard>
          ),
        },
        {
          path: ApiResourcesUrl,
          element: (
            <RouteGuard>
              <ApiResources />
            </RouteGuard>
          ),
        },
        {
          path: ApiResourceCreateUrl,
          element: (
            <RouteGuard>
              <ApiResourceCreate />
            </RouteGuard>
          ),
        },
        {
          path: ApiResourceEditUrl,
          element: (
            <RouteGuard>
              <ApiResourceEdit />
            </RouteGuard>
          ),
        },
        {
          path: ApiScopesUrl,
          element: (
            <RouteGuard>
              <ApiScopes />
            </RouteGuard>
          ),
        },
        {
          path: ApiScopeCreateUrl,
          element: (
            <RouteGuard>
              <ApiScopeCreate />
            </RouteGuard>
          ),
        },
        {
          path: ApiScopeEditUrl,
          element: (
            <RouteGuard>
              <ApiScopeEdit />
            </RouteGuard>
          ),
        },
        {
          path: IdentityResourcesUrl,
          element: (
            <RouteGuard>
              <IdentityResources />
            </RouteGuard>
          ),
        },
        {
          path: IdentityResourceCreateUrl,
          element: (
            <RouteGuard>
              <IdentityResourceCreate />
            </RouteGuard>
          ),
        },
        {
          path: IdentityResourceEditUrl,
          element: (
            <RouteGuard>
              <IdentityResourceEdit />
            </RouteGuard>
          ),
        },
        {
          path: UsersUrl,
          element: (
            <RouteGuard>
              <Users />
            </RouteGuard>
          ),
        },
        {
          path: UserCreateUrl,
          element: (
            <RouteGuard>
              <UserCreate />
            </RouteGuard>
          ),
        },
        {
          path: UserEditUrl,
          element: (
            <RouteGuard>
              <UserEdit />
            </RouteGuard>
          ),
        },
        {
          path: RolesUrl,
          element: (
            <RouteGuard>
              <Roles />
            </RouteGuard>
          ),
        },
        {
          path: RoleCreateUrl,
          element: (
            <RouteGuard>
              <RoleCreate />
            </RouteGuard>
          ),
        },
        {
          path: RoleEditUrl,
          element: (
            <RouteGuard>
              <RoleEdit />
            </RouteGuard>
          ),
        },
        {
          path: IdentityProvidersUrl,
          element: (
            <RouteGuard>
              <IdentityProviders />
            </RouteGuard>
          ),
        },
        {
          path: IdentityProviderCreateUrl,
          element: (
            <RouteGuard>
              <IdentityProviderCreate />
            </RouteGuard>
          ),
        },
        {
          path: IdentityProviderEditUrl,
          element: (
            <RouteGuard>
              <IdentityProviderEdit />
            </RouteGuard>
          ),
        },
        {
          path: KeysUrl,
          element: (
            <RouteGuard>
              <Keys />
            </RouteGuard>
          ),
        },
        {
          path: ConfigurationIssuesUrl,
          element: (
            <RouteGuard>
              <ConfigurationIssues />
            </RouteGuard>
          ),
        },
        {
          path: ConfigurationRulesUrl,
          element: (
            <RouteGuard>
              <ConfigurationRules />
            </RouteGuard>
          ),
        },
        {
          path: AuditLogsUrl,
          element: (
            <RouteGuard>
              <AuditLogs />
            </RouteGuard>
          ),
        },
        {
          path: RoleUsersUrl,
          element: (
            <RouteGuard>
              <RoleUsers />
            </RouteGuard>
          ),
        },
        { path: NotFoundUrl, element: <div>404</div> },
      ],
    },
  ],
  {
    basename: baseHref,
  }
);
