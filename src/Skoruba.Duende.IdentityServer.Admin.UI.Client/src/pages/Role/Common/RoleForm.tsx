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
import { FormRow } from "@/components/FormRow/FormRow";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import useModal from "@/hooks/modalHooks";
import React, { useState } from "react";
import RoleDeleteDialog from "./RoleDeleteDialog";
import { Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RoleClaimsTab from "./Tabs/RoleClaimsTab"; // <<< Přidán import
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";

interface RoleFormProps {
  mode: "create" | "edit";
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
      mode === "create" ? createRole(data) : updateRole(roleId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.roles);
        queryClient.invalidateQueries(queryKeys.role);
        queryClient.invalidateQueries(queryKeys.roleClaims);

        toast({
          title: <Hoorey />,
          description:
            mode === "create"
              ? t("Role.Actions.Created")
              : t("Role.Actions.Updated"),
        });
        navigate(RolesUrl);
      },
    }
  );

  const showDelete = mode === "edit" && !!roleId && !!defaultValues.name;

  return (
    <>
      {" "}
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
                <TabsTrigger value="basics">
                  {t("Role.Tabs.Basics")}
                </TabsTrigger>
                {roleId && (
                  <TabsTrigger value="claims">
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
              <FormRow
                name="name"
                label={t("Role.Section.Label.RoleName_Label")}
                description={t("Role.Section.Label.RoleName_Info")}
                placeholder={t("Role.Section.Label.RoleName_Label")}
                type="input"
                required
                includeSeparator
              />
              <Button type="submit" className="mt-4">
                {mode === "create" ? t("Actions.Create") : t("Actions.Save")}
              </Button>
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
