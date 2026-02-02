import ApiHelper from "@/helpers/ApiHelper";
import { PersistedGrant, UserData, UsersData } from "@/models/Users/UserModels";
import { UserFormData } from "@/pages/User/Common/UserSchema";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { queryKeys } from "./QueryKeys";
import { combineDateTime, getDateAndTime } from "@/helpers/DateTimeHelper";

const getClient = () => new client.UsersClient(ApiHelper.getApiBaseUrl());

const getPersistedGrantsClient = () =>
  new client.PersistedGrantsClient(ApiHelper.getApiBaseUrl());

export const useUserRoles = (
  userId: string,
  pageIndex: number = 0,
  pageSize: number = 10
) => {
  return useQuery(
    [queryKeys.userRoles, userId, pageIndex, pageSize],
    async () => {
      const usersClient = getClient();
      const result = await usersClient.getUserRoles(
        userId,
        pageIndex,
        pageSize
      );

      return {
        roles: result.roles ?? [],
        totalCount: result.totalCount ?? 0,
      };
    },
    {
      enabled: !!userId,
      keepPreviousData: true,
    }
  );
};

export const useAddUserRole = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (roleId: string) => {
      const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());
      return await usersClient.postUserRoles(
        new client.UserRoleApiDtoOfString({ userId, roleId })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.userRoles, userId]);
      },
    }
  );
};

export const useDeleteUserRole = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (roleId: string) => {
      const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());
      return await usersClient.deleteUserRoles(
        new client.UserRoleApiDtoOfString({ userId, roleId })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.userRoles, userId]);
      },
    }
  );
};

export const useUserClaims = (
  userId: string,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery(
    [queryKeys.userClaims, userId, pageIndex, pageSize],
    async () => {
      const usersClient = getClient();
      return await usersClient.getUserClaims(userId, pageIndex + 1, pageSize);
    }
  );
};

export const useAddUserClaim = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ key, value }: { key: string; value: string }) => {
      const usersClient = getClient();
      const dto = new client.UserClaimApiDtoOfString({
        claimId: 0,
        userId,
        claimType: key,
        claimValue: value,
      });
      return await usersClient.postUserClaims(dto);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.userClaims, userId]);
      },
    }
  );
};

export const useDeleteUserClaim = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (claimId: number) => {
      const usersClient = getClient();
      return await usersClient.deleteUserClaims(userId, claimId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.userClaims, userId]);
      },
    }
  );
};

export const getUsers = async (
  search: string,
  pageIndex: number,
  pageSize: number
): Promise<UsersData> => {
  const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());

  const response = await usersClient.get2(search, pageIndex + 1, pageSize);

  const items: UserData[] =
    response.users?.map((u) => ({
      id: u.id!,
      userName: u.userName!,
      email: u.email!,
    })) ?? [];

  return {
    items,
    totalCount: response.totalCount ?? 0,
  };
};

export const getUser = async (id: string): Promise<UserFormData> => {
  const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());
  const user = await usersClient.get(id);

  const { date, time } = getDateAndTime(user.lockoutEnd);

  return {
    userName: user.userName!,
    email: user.email!,
    emailConfirmed: user.emailConfirmed ?? false,
    phoneNumber: user.phoneNumber ?? "",
    phoneNumberConfirmed: user.phoneNumberConfirmed ?? false,
    lockoutEnabled: user.lockoutEnabled ?? false,
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    accessFailedCount: user.accessFailedCount ?? 0,
    lockoutEndDate: date,
    lockoutEndTime: time,
  };
};

export const createUser = async (data: UserFormData): Promise<void> => {
  const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());

  const lockoutEnd = combineDateTime(data.lockoutEndDate, data.lockoutEndTime);

  await usersClient.post(
    new client.IdentityUserDto({
      id: undefined,
      userName: data.userName,
      email: data.email,
      lockoutEnd: lockoutEnd === null ? undefined : lockoutEnd,
      emailConfirmed: data.emailConfirmed ?? false,
      phoneNumber: data.phoneNumber ?? undefined,
      phoneNumberConfirmed: data.phoneNumberConfirmed ?? false,
      lockoutEnabled: data.lockoutEnabled ?? false,
      twoFactorEnabled: data.twoFactorEnabled ?? false,
      accessFailedCount: data.accessFailedCount ?? 0,
    })
  );
};

export const updateUser = async (
  id: string,
  data: UserFormData
): Promise<void> => {
  const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());

  const lockoutEnd = combineDateTime(data.lockoutEndDate, data.lockoutEndTime);

  await usersClient.put(
    new client.IdentityUserDto({
      ...data,
      id: id,
      lockoutEnd: lockoutEnd === null ? undefined : lockoutEnd,
      emailConfirmed: data.emailConfirmed ?? false,
      phoneNumber: data.phoneNumber ?? undefined,
      phoneNumberConfirmed: data.phoneNumberConfirmed ?? false,
      lockoutEnabled: data.lockoutEnabled ?? false,
      twoFactorEnabled: data.twoFactorEnabled ?? false,
      accessFailedCount: data.accessFailedCount ?? 0,
    })
  );
};

export const deleteUser = async (id: string): Promise<void> => {
  const usersClient = new client.UsersClient(ApiHelper.getApiBaseUrl());
  await usersClient.delete(id);
};

export const useUserExternalApps = (userId: string) => {
  return useQuery([queryKeys.userExternalApps, userId], async () => {
    const usersClient = getClient();
    const result = await usersClient.getUserProviders(userId);
    return result.providers ?? [];
  });
};

export const useDeleteUserExternalApp = (userId: string) => {
  return useMutation<
    void,
    client.ProblemDetails,
    { loginProvider: string; providerKey: string }
  >(async ({ loginProvider, providerKey }) => {
    const usersClient = getClient();

    const payload = new client.UserProviderDeleteApiDtoOfString({
      userId,
      providerKey,
      loginProvider,
    });

    await usersClient.deleteUserProviders(payload);
  });
};

export const useUserPersistedGrants = (
  userId: string,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery(
    [queryKeys.userPersistedGrants, userId, pageIndex, pageSize],
    async () => {
      const persistedGrantsClient = getPersistedGrantsClient();

      try {
        const result = await persistedGrantsClient.getBySubject(
          userId,
          pageIndex + 1,
          pageSize
        );
        return {
          persistedGrants: result.persistedGrants ?? [],
          totalCount: result.totalCount ?? 0,
        };
      } catch (error: unknown) {
        if (error instanceof client.SwaggerException) {
          if (error.status === 400) {
            return {
              persistedGrants: [],
              totalCount: 0,
            };
          }
        }

        throw error;
      }
    },
    { keepPreviousData: true }
  );
};

export const getPersistedGrantDetail = async (
  key: string
): Promise<PersistedGrant> => {
  const persistedGrantsClient = getPersistedGrantsClient();

  const persistedGrants = await persistedGrantsClient.get2(key);

  return {
    id: persistedGrants.id ?? 0,
    key: persistedGrants.key ?? "",
    type: persistedGrants.type ?? "",
    subjectId: persistedGrants.subjectId ?? "",
    subjectName: persistedGrants.subjectName ?? "",
    clientId: persistedGrants.clientId ?? "",
    sessionId: persistedGrants.sessionId ?? "",
    description: persistedGrants.description ?? "",
    creationTime: persistedGrants.creationTime
      ? persistedGrants.creationTime instanceof Date
        ? persistedGrants.creationTime.toISOString()
        : persistedGrants.creationTime
      : "",
    expiration: persistedGrants.expiration
      ? persistedGrants.expiration instanceof Date
        ? persistedGrants.expiration.toISOString()
        : persistedGrants.expiration
      : undefined,
    consumedTime: persistedGrants.consumedTime
      ? persistedGrants.consumedTime instanceof Date
        ? persistedGrants.consumedTime.toISOString()
        : persistedGrants.consumedTime
      : undefined,
  };
};

export const deletePersistedGrant = async (key: string): Promise<void> => {
  const persistedGrantsClient = getPersistedGrantsClient();

  await persistedGrantsClient.delete(key);
};

export const useDeletePersistedGrant = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (key: string) => {
      await deletePersistedGrant(key);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.userPersistedGrants);
      },
    }
  );
};

export const useDeleteAllPersistedGrantsForUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (userId: string) => {
      const persistedGrantsClient = getPersistedGrantsClient();
      await persistedGrantsClient.deleteBySubject(userId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.userPersistedGrants);
      },
    }
  );
};
