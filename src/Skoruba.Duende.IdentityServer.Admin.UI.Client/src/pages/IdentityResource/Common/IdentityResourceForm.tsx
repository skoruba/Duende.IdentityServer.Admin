import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "react-query";
import {
  createIdentityResource,
  updateIdentityResource,
} from "@/services/IdentityResourceServices";
import {
  createIdentityResourceSchema,
  IdentityResourceFormData,
} from "./IdentityResourceSchema";
import IdentityResourceTabs from "./IdentityResourceTabs";
import { IdentityResourcesUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";

export enum IdentityResourceFormMode {
  Create = "create",
  Edit = "edit",
}

interface Props {
  mode: IdentityResourceFormMode;
  resourceId?: string;
  defaultValues: IdentityResourceFormData;
  onIdentityResourceDelete?: () => void;
  setNavigateWithBlocker?: (fn: (to: string) => void) => void;
}

const IdentityResourceForm: React.FC<Props> = ({
  mode,
  resourceId,
  defaultValues,
  onIdentityResourceDelete,
  setNavigateWithBlocker,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<IdentityResourceFormData>({
    resolver: zodResolver(createIdentityResourceSchema(t)),
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
    (data: IdentityResourceFormData) =>
      mode === IdentityResourceFormMode.Create
        ? createIdentityResource(data)
        : updateIdentityResource(Number(resourceId), data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.identityResource);
        queryClient.invalidateQueries(queryKeys.identityResources);
        toast({
          title: <Hoorey />,
          description:
            mode === IdentityResourceFormMode.Create
              ? t("IdentityResource.Actions.Created")
              : t("IdentityResource.Actions.Updated"),
        });
        navigateWithBlocker(IdentityResourcesUrl);
      },
    }
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <IdentityResourceTabs
            onIdentityResourceDelete={onIdentityResourceDelete}
          />
          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit">
              {mode === IdentityResourceFormMode.Create
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

export default IdentityResourceForm;
