import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/use-toast";
import {
  useCreateIdentityProvider,
  useUpdateIdentityProvider,
} from "@/services/IdentityProviderService";
import { IdentityProviderEditUrl, IdentityProvidersUrl } from "@/routing/Urls";
import Hoorey from "@/components/Hoorey/Hoorey";
import { Trash2, Info, Settings } from "lucide-react";
import useModal from "@/hooks/modalHooks";
import IdentityProviderDeleteDialog from "./IdentityProviderDeleteDialog";
import IdentityProviderBasicsTab from "./Tabs/IdentityProviderBasicsTab";
import IdentityProviderPropertiesTab from "./Tabs/IdentityProviderPropertiesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";
import {
  IdentityProviderFormData,
  IdentityProviderFormSchema,
} from "./IdentityProviderSchema";

export enum IdentityProviderFormMode {
  Create = "create",
  Edit = "edit",
}

type Props = {
  mode: IdentityProviderFormMode;
  defaultValues: IdentityProviderFormData;
};

const IdentityProviderForm: React.FC<Props> = ({ mode, defaultValues }) => {
  const { t } = useTranslation();
  const deleteModal = useModal();
  const [activeTab, setActiveTab] = useState("basics");

  const form = useForm<IdentityProviderFormData>({
    resolver: zodResolver(IdentityProviderFormSchema),
    defaultValues,
  });

  const navigate = useNavigateWithBlocker(form);

  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const createMutation = useCreateIdentityProvider();
  const updateMutation = useUpdateIdentityProvider();

  const handleSubmit = async (data: IdentityProviderFormData) => {
    const mutation =
      mode === IdentityProviderFormMode.Create
        ? createMutation
        : updateMutation;

    const result = await mutation.mutateAsync(data);

    toast({
      title: <Hoorey />,
      description:
        mode === IdentityProviderFormMode.Create
          ? t("IdentityProvider.Actions.Created")
          : t("IdentityProvider.Actions.Updated"),
    });

    if (mode === IdentityProviderFormMode.Create && result?.id) {
      navigate(
        IdentityProviderEditUrl.replace(":providerId", result.id.toString())
      );
    } else {
      navigate(IdentityProvidersUrl);
    }
  };

  const showDelete =
    mode === IdentityProviderFormMode.Edit &&
    !!defaultValues.id &&
    !!defaultValues.scheme;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center justify-between mt-4 mb-4">
            <Tabs
              defaultValue="basics"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1"
            >
              <TabsList>
                <TabsTrigger value="basics" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {t("IdentityProvider.Tabs.Basics")}
                </TabsTrigger>
                <TabsTrigger
                  value="properties"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {t("IdentityProvider.Tabs.Properties")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {showDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={deleteModal.openModal}
                className="ml-4"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("IdentityProvider.Actions.Delete")}
              </Button>
            )}
          </div>

          <Tabs
            defaultValue="basics"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-0"
          >
            <TabsContent value="basics">
              <IdentityProviderBasicsTab />
            </TabsContent>
            <TabsContent value="properties">
              <IdentityProviderPropertiesTab />
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit">
              {mode === IdentityProviderFormMode.Create
                ? t("Actions.Create")
                : t("Actions.Save")}
            </Button>
          </div>
        </form>

        {showDelete && (
          <IdentityProviderDeleteDialog
            providerId={defaultValues.id.toString()!}
            identityProviderName={defaultValues.scheme}
            isOpen={deleteModal.isOpen}
            setIsOpen={deleteModal.setValue}
            onSuccess={() => navigate(IdentityProvidersUrl)}
          />
        )}
      </Form>
      {DialogCmp}
    </>
  );
};

export default IdentityProviderForm;
