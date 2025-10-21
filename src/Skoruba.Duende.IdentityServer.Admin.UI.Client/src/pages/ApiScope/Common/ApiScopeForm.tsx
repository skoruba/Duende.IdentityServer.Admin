import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "react-query";
import { createApiScope, updateApiScope } from "@/services/ApiScopeServices";
import { formSchema, ApiScopeFormData } from "./ApiScopeSchema";
import ApiScopeTabs from "./ApiScopeTabs";
import { ApiScopesUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import { Tip } from "@/components/Tip/Tip";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";
import { ApiScopeFormMode } from "../Edit/ApiScopeEdit";

interface ApiScopeFormProps {
  mode: ApiScopeFormMode;
  scopeId?: string;
  defaultValues: ApiScopeFormData;
  apiScopeDelete?: () => void;
  setNavigateWithBlocker?: (fn: (to: string) => void) => void;
}

const ApiScopeForm: React.FC<ApiScopeFormProps> = ({
  mode,
  scopeId,
  defaultValues,
  apiScopeDelete,
  setNavigateWithBlocker,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ApiScopeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const navigateWithBlocker = useNavigateWithBlocker(form);

  useEffect(() => {
    if (setNavigateWithBlocker) {
      setNavigateWithBlocker(() => navigateWithBlocker);
    }
  }, [navigateWithBlocker, setNavigateWithBlocker]);

  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const mutation = useMutation(
    (data: ApiScopeFormData) =>
      mode === ApiScopeFormMode.Create
        ? createApiScope(data)
        : updateApiScope(Number(scopeId), data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.apiScope);
        queryClient.invalidateQueries(queryKeys.apiScopes);
        toast({
          title: <Hoorey />,
          description:
            mode === ApiScopeFormMode.Create
              ? t("ApiScope.Actions.Created")
              : t("ApiScope.Actions.Updated"),
        });
        navigateWithBlocker(ApiScopesUrl);
      },
    }
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <Tip className="mb-3">
            <Trans
              i18nKey="ApiScope.Tips.ApiScopeAssigned"
              values={{
                apiScopeName: form.watch("name"),
              }}
              components={{ strong: <strong /> }}
            ></Trans>
          </Tip>
          <ApiScopeTabs apiScopeDelete={apiScopeDelete} />
          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit">
              {mode === ApiScopeFormMode.Create
                ? t("Actions.Create")
                : t("Actions.Save")}
            </Button>
          </div>
        </form>
      </Form>
      {DialogCmp}
    </>
  );
};

export default ApiScopeForm;
