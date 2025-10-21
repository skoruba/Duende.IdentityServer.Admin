import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { RoleFormData, formSchema } from "../Common/RoleSchema";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "react-query";
import { createRole, updateRole } from "@/services/RoleService";
import { useTranslation } from "react-i18next";
import { RolesUrl } from "@/routing/Urls";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import useModal from "@/hooks/modalHooks";
import React, { useState } from "react";
import RoleDeleteDialog from "./RoleDeleteDialog";
import { Trash2, Info, Tag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RoleClaimsTab from "./Tabs/RoleClaimsTab";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";
import RoleBasicTab from "./Tabs/RoleBasicTab";

export enum RoleFormMode {
  Create = "create",
  Edit = "edit",
}

interface RoleFormProps {
  mode: RoleFormMode;
  roleId?: string;
  defaultValues: RoleFormData;
}

const RoleForm: React.FC<RoleFormProps> = ({ mode, roleId, defaultValues }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteModal = useModal();
  const [activeTab, setActiveTab] = useState("basics");

  const form = useForm<RoleFormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const navigate = useNavigateWithBlocker(form);
  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const mutation = useMutation(
    (data: RoleFormData) =>
      mode === RoleFormMode.Create
        ? createRole(data)
        : updateRole(roleId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.roles);
        queryClient.invalidateQueries(queryKeys.role);
        queryClient.invalidateQueries(queryKeys.roleClaims);

        toast({
          title: <Hoorey />,
          description:
            mode === RoleFormMode.Create
              ? t("Role.Actions.Created")
              : t("Role.Actions.Updated"),
        });
        navigate(RolesUrl);
      },
    }
  );

  const showDelete =
    mode === RoleFormMode.Edit && !!roleId && !!defaultValues.name;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          <Tabs
            defaultValue="basics"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-4"
          >
            <div className="flex justify-between">
              <TabsList>
                <TabsTrigger value="basics" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {t("Role.Tabs.Basics")}
                </TabsTrigger>

                {roleId && (
                  <TabsTrigger
                    value="claims"
                    className="flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    {t("Role.Tabs.Claims")}
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="inline-flex">
                {showDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={deleteModal.openModal}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("Role.Actions.Delete")}
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="basics">
              <RoleBasicTab mode={mode} />
            </TabsContent>

            {roleId && (
              <TabsContent value="claims">
                <RoleClaimsTab roleId={roleId} />
              </TabsContent>
            )}
          </Tabs>
        </form>

        {showDelete && (
          <RoleDeleteDialog
            roleId={roleId!}
            roleName={defaultValues.name}
            isOpen={deleteModal.isOpen}
            setIsOpen={deleteModal.setValue}
            onSuccess={() => navigate(RolesUrl)}
          />
        )}
      </Form>
      {DialogCmp}
    </>
  );
};

export default RoleForm;
