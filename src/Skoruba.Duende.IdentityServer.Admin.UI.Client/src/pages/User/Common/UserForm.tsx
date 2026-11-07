import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  updateUser,
  useUserOptions,
} from "@/services/UserServices";
import { UserFormData, createFormSchema } from "../Common/UserSchema";
import { UsersUrl } from "@/routing/Urls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicsTab from "./Tabs/BasicsTab";
import UserClaimsTab from "./Tabs/UserClaimsTab";
import UserRolesTab from "./Tabs/UserRolesTab";
import ExternalApplicationsTab from "./Tabs/ExternalApplicationsTab";
import UserPersistedGrantsTab from "./Tabs/UserPersistedGrantsTab";
import ChangePasswordTab from "./Tabs/ChangePasswordTab";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";
import useModal from "@/hooks/modalHooks";
import UserDeleteDialog from "./UserDeleteDialog";
import {
  Trash2,
  Info,
  Tag,
  Users,
  Globe,
  KeySquare,
  ShieldCheck,
} from "lucide-react";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";

export enum UserFormMode {
  Create = "create",
  Edit = "edit",
}

interface Props {
  mode: UserFormMode;
  userId?: string;
  defaultValues: UserFormData;
}

const UserForm: React.FC<Props> = ({ mode, userId, defaultValues }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("basics");
  const deleteModal = useModal();

  const { data: userOptions } = useUserOptions();
  const requireEmail = userOptions?.requireUniqueEmail ?? true;
  const schema = useMemo(() => createFormSchema(requireEmail), [requireEmail]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const navigate = useNavigateWithBlocker(form);
  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const mutation = useMutation({
    mutationFn: (data: UserFormData) =>
      mode === UserFormMode.Create
        ? createUser(data)
        : updateUser(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.user] });

      navigate(UsersUrl);

      toast({
        title: <Hoorey />,
        description:
          mode === UserFormMode.Create
            ? t("User.Actions.Created")
            : t("User.Actions.Updated"),
      });
    },
  });

  const showDelete =
    mode === UserFormMode.Edit && !!userId && !!defaultValues.userName;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
          {userId && mode === UserFormMode.Edit ? (
            <Tabs
              defaultValue="basics"
              onValueChange={(value) => setActiveTab(value)}
              className="mt-4"
            >
              <div className="flex justify-between">
                <TabsList>
                  <TabsTrigger
                    value="basics"
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    {t("User.Tabs.Basics")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="claims"
                    className="flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    {t("User.Tabs.Claims")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="roles"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {t("User.Tabs.Roles")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="providers"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {t("User.Tabs.ExternalApplications")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="persistedgrants"
                    className="flex items-center gap-2"
                  >
                    <KeySquare className="h-4 w-4" />
                    {t("User.Tabs.PersistedGrants")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="flex items-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t("User.Tabs.Password")}
                  </TabsTrigger>
                </TabsList>

                <div className="inline-flex">
                  {showDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={deleteModal.openModal}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("User.Actions.Delete")}
                    </Button>
                  )}
                </div>
              </div>

              <TabsContent value="basics">
                <BasicsTab mode={mode} />
              </TabsContent>
              <TabsContent value="claims">
                <UserClaimsTab userId={userId} />
              </TabsContent>
              <TabsContent value="roles">
                <UserRolesTab userId={userId} />
              </TabsContent>
              <TabsContent value="providers">
                <ExternalApplicationsTab userId={userId} />
              </TabsContent>
              <TabsContent value="persistedgrants">
                <UserPersistedGrantsTab userId={userId!} />
              </TabsContent>
              <TabsContent value="password">
                <ChangePasswordTab userId={userId!} />
              </TabsContent>
            </Tabs>
          ) : (
            <BasicsTab mode={mode} />
          )}

          {activeTab === "basics" && (
            <div className="flex gap-4 justify-start mt-4">
              <Button type="submit">
                {mode === UserFormMode.Create
                  ? t("Actions.Create")
                  : t("Actions.Save")}
              </Button>
            </div>
          )}
        </form>

        {showDelete && (
          <UserDeleteDialog
            userId={userId!}
            userName={defaultValues.userName}
            isOpen={deleteModal.isOpen}
            setIsOpen={deleteModal.setValue}
            onSuccess={() => navigate(UsersUrl)}
          />
        )}
      </Form>
      {DialogCmp}
    </>
  );
};

export default UserForm;
