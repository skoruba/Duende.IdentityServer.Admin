import { useQuery, useMutation, useQueryClient } from "react-query";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { toast } from "@/components/ui/use-toast";
import ApiHelper from "@/helpers/ApiHelper";
import { KeysApiDto } from "@/models/Keys/KeysModel";
import { queryKeys } from "./QueryKeys";
import i18next from "@/i18n/config";

const getClient = () => new client.KeysClient(ApiHelper.getApiBaseUrl());

export const useKeys = (page: number = 0, pageSize: number = 10) => {
  return useQuery([queryKeys.keys, page, pageSize], async () => {
    const keysClient = getClient();
    const keys = await keysClient.get(page, pageSize);

    return {
      keys: keys.keys ?? [],
      totalCount: keys.totalCount,
    } as KeysApiDto;
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: string) => {
      const keysClient = getClient();
      return await keysClient.delete(id);
    },
    {
      onSuccess: () => {
        toast({ title: String(i18next.t("Keys.DeleteSuccess")) });
        queryClient.invalidateQueries(queryKeys.keys);
      },
      onError: () => {
        toast({
          title: String(i18next.t("Keys.DeleteFailed")),
          variant: "destructive",
        });
      },
    }
  );
};
