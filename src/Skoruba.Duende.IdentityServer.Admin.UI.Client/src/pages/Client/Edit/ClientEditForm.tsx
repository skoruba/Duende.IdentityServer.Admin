import { t } from "i18next";
import {
  formSchema,
  ClientEditFormData,
  mapFormDataToEditClient,
} from "../ClientSchema";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { updateClient } from "@/services/ClientServices";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "@/components/ui/use-toast";
import ClientEditTabs from "./ClientEditTabs";
import useModal from "@/hooks/modalHooks";
import DeleteClientDialog from "../Common/DeleteClientDialog";
import { ClientsUrl } from "@/routing/Urls";
import { queryKeys } from "@/services/QueryKeys";
import {
  useConfirmUnsavedChanges,
  useNavigateWithBlocker,
} from "@/hooks/useConfirmUnsavedChanges";
import Hoorey from "@/components/Hoorey/Hoorey";

export type ClientEditFormType = {
  clientId: string;
  client: ClientEditFormData;
};

const ClientEditForm = ({ clientId, client }: ClientEditFormType) => {
  const form = useForm<ClientEditFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: client,
  });

  const navigate = useNavigateWithBlocker(form);

  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const queryClient = useQueryClient();
  const deleteClientModal = useModal();

  const updateClientMutation = useMutation(
    (data: ClientEditFormData) =>
      updateClient(mapFormDataToEditClient(data, Number(clientId))),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.client);
        queryClient.invalidateQueries(queryKeys.clients);
        queryClient.invalidateQueries(queryKeys.configurationIssues);
        queryClient.invalidateQueries(queryKeys.configurationIssuesSummary);
      },
    }
  );

  const onSubmit: SubmitHandler<ClientEditFormData> = (
    data: ClientEditFormData
  ) => {
    updateClientMutation.mutate(data, {
      onSuccess: () => {
        navigate(ClientsUrl);

        toast({
          title: <Hoorey />,
          description: t("Client.Actions.Updated"),
        });
      },
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ClientEditTabs
            onClientDelete={() => deleteClientModal.openModal()}
          />
          <DeleteClientDialog
            clientId={clientId}
            clientName={client.clientName}
            modal={deleteClientModal}
            onClientDeleted={() => {
              navigate(ClientsUrl);
            }}
          />

          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit" disabled={updateClientMutation.isLoading}>
              {t("Actions.Save")}
            </Button>
          </div>
        </form>
      </Form>
      {DialogCmp}
    </>
  );
};

export default ClientEditForm;
