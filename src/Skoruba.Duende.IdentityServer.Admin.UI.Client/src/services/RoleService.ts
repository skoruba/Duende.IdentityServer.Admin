import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { RoleData, RolesData, RoleFormData } from "@/models/Roles/RoleModels";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { INT_MAX } from "@/helpers/NumberHelper";
import { queryKeys } from "./QueryKeys";
import { UsersData } from "@/models/Users/UserModels";

export const useRolesList = () => {
  return useQuery([queryKeys.rolesList], async () => {
    const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
    const result = await rolesClient.get2(null, 0, INT_MAX);

    return result.roles ?? [];
  });
};

export const getRoles = async (
  search: string,
  pageIndex: number,
  pageSize: number
): Promise<RolesData> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  const result = await rolesClient.get2(search, pageIndex + 1, pageSize);

  const items: RoleData[] =
    result.roles?.map((r) => ({
      id: r.id!,
      name: r.name!,
    })) ?? [];

  return {
    items,
    totalCount: result.totalCount ?? 0,
  };
};

export const getRole = async (id: string): Promise<RoleFormData> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  const r = await rolesClient.get(id);
  return { id: r.id!, name: r.name! };
};

export const createRole = async (data: RoleFormData): Promise<void> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  await rolesClient.post(
    new client.IdentityRoleDto({ id: undefined, name: data.name })
  );
};

export const updateRole = async (
  id: string,
  data: RoleFormData
): Promise<void> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  await rolesClient.put(new client.IdentityRoleDto({ id, ...data }));
};

export const deleteRole = async (id: string): Promise<void> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  await rolesClient.delete(id);
};

export const useRoleClaims = (
  roleId: string,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery(
    [queryKeys.roleClaims, roleId, pageIndex, pageSize],
    async () => {
      const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
      const result = await rolesClient.getRoleClaims(
        roleId,
        pageIndex + 1,
        pageSize
      );

      return {
        claims: result.claims ?? [],
        totalCount: result.totalCount ?? 0,
      };
    }
  );
};

export const useAddRoleClaim = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (input: { key: string; value: string }) => {
      const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
      await rolesClient.postRoleClaims(
        new client.RoleClaimApiDtoOfString({
          claimId: 0,
          roleId,
          claimType: input.key,
          claimValue: input.value,
        })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.roleClaims, roleId]);
      },
    }
  );
};

export const useDeleteRoleClaim = (roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (claimId: number) => {
      const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
      await rolesClient.deleteRoleClaims(roleId, claimId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.roleClaims, roleId]);
      },
    }
  );
};

export const getRoleUsers = async (
  roleId: string,
  search: string,
  pageIndex: number,
  pageSize: number
): Promise<UsersData> => {
  const rolesClient = new client.RolesClient(ApiHelper.getApiBaseUrl());
  const res = await rolesClient.getRoleUsers(
    roleId,
    search || null,
    pageIndex + 1,
    pageSize
  );
  return {
    items:
      res.users?.map((u) => ({
        id: u.id!,
        userName: u.userName!,
        email: u.email!,
      })) ?? [],
    totalCount: res.totalCount ?? 0,
  };
};
