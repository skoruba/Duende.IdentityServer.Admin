import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { toast } from "@/components/ui/use-toast";
import ApiHelper from "@/helpers/ApiHelper";
import { KeysApiDto } from "@/models/Keys/KeysModel";
import { queryKeys } from "./QueryKeys";
import i18next from "@/i18n/config";

const getClient = () => new client.KeysClient(ApiHelper.getApiBaseUrl());

export const useKeys = (pageIndex: number = 0, pageSize: number = 10) => {
  return useQuery({
    queryKey: [queryKeys.keys, pageIndex, pageSize],
    queryFn: async () => {
      const keysClient = getClient();
      const keys = await keysClient.get(pageIndex + 1, pageSize);

      return {
        keys: keys.keys ?? [],
        totalCount: keys.totalCount,
      } as KeysApiDto;
    },
  });
};

export const useDeleteKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const keysClient = getClient();
      return await keysClient.delete(id);
    },
    onSuccess: () => {
      toast({ title: String(i18next.t("Keys.DeleteSuccess")) });
      queryClient.invalidateQueries({ queryKey: [queryKeys.keys] });
    },
    onError: () => {
      toast({
        title: String(i18next.t("Keys.DeleteFailed")),
        variant: "destructive",
      });
    },
  });
};
