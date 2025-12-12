import { createBrowserRouter, Outlet } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Home from "@/pages/Home/Home";
import Clients from "@/pages/Clients/Clients";
import ClientEdit from "@/pages/Client/Edit/ClientEdit";
import ClientClone from "@/pages/Client/Clone/ClientClone";
import ApiResources from "@/pages/ApiResources/ApiResources";
import ApiResourceCreate from "@/pages/ApiResource/Create/ApiResourceCreate";
import ApiResourceEdit from "@/pages/ApiResource/Edit/ApiResourceEdit";
import ApiScopes from "@/pages/ApiScopes/ApiScopes";
import ApiScopeCreate from "@/pages/ApiScope/Create/ApiScopeCreate";
import ApiScopeEdit from "@/pages/ApiScope/Edit/ApiScopeEdit";
import IdentityResources from "@/pages/IdentityResources/IdentityResources";
import IdentityResourceCreate from "@/pages/IdentityResource/Create/IdentityResourceCreate";
import IdentityResourceEdit from "@/pages/IdentityResource/Edit/IdentityResourceEdit";
import Users from "@/pages/Users/Users";
import Roles from "@/pages/Roles/Roles";
import RoleEdit from "@/pages/Role/Edit/RoleEdit";
import RoleCreate from "@/pages/Role/Create/RoleCreate";
import UserCreate from "@/pages/User/Create/UserCreate";
import UserEdit from "@/pages/User/Edit/UserEdit";
import IdentityProviders from "@/pages/IdentityProviders/IdentityProviders";
import IdentityProviderCreate from "@/pages/IdentityProvider/Create/IdentityProviderCreate";
import IdentityProviderEdit from "@/pages/IdentityProvider/Edit/IdentityProviderEdit";
import Keys from "@/pages/Keys/Keys";
import ConfigurationIssues from "@/pages/ConfigurationIssues/ConfigurationIssues";
import ConfigurationRules from "@/pages/ConfigurationRules/ConfigurationRules";
import AuditLogs from "@/pages/AuditLogs/AuditLogs";
import RoleUsers from "@/pages/RoleUsers/RoleUsers";
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
