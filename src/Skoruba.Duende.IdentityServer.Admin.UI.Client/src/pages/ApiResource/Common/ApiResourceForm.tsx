import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "react-query";
import {
  createApiResource,
  updateApiResource,
} from "@/services/ApiResourceServices";
import { formSchema, ApiResourceFormData } from "./ApiResourceSchema";
import ApiResourceTabs from "./ApiResourceTabs";
import { ApiResourcesUrl } from "@/routing/Urls";
import { Trans, useTranslation } from "react-i18next";
import { Tip } from "@/components/Tip/Tip";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";

export enum ApiResourceFormMode {
  Create = "create",
  Edit = "edit",
}

interface ApiResourceFormProps {
  mode: ApiResourceFormMode;
  resourceId?: string;
  defaultValues: ApiResourceFormData;
  onApiResourceDelete?: () => void;
  setNavigateWithBlocker?: (fn: (to: string) => void) => void;
}

const ApiResourceForm: React.FC<ApiResourceFormProps> = ({
  mode,
  resourceId,
  defaultValues,
  onApiResourceDelete,
  setNavigateWithBlocker,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ApiResourceFormData>({
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
    (data: ApiResourceFormData) =>
      mode === ApiResourceFormMode.Create
        ? createApiResource(data)
        : updateApiResource(Number(resourceId), data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.apiResource);
        queryClient.invalidateQueries(queryKeys.apiResources);
        toast({
          title: <Hoorey />,
          description:
            mode === ApiResourceFormMode.Create
              ? t("ApiResource.Actions.Created")
              : t("ApiResource.Actions.Updated"),
        });
        navigateWithBlocker(ApiResourcesUrl);
      },
    }
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          {form.watch("scopes")?.length === 0 && (
            <Tip className="mb-4">
              <Trans
                i18nKey="ApiResource.Tips.MissingScopes"
                components={{ strong: <strong /> }}
              />
            </Tip>
          )}

          <ApiResourceTabs onApiResourceDelete={onApiResourceDelete} />
          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit">
              {mode === ApiResourceFormMode.Create
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

export default ApiResourceForm;
