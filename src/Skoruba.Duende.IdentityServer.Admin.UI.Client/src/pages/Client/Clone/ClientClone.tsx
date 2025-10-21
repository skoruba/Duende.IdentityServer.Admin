import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { FormRow } from "@/components/FormRow/FormRow";
import { RandomValues } from "@/helpers/CryptoHelper";
import Page from "@/components/Page/Page";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ClientsUrl } from "@/routing/Urls";
import { useNavigate, useParams } from "react-router-dom";
import { cloneClient, useClient } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/services/QueryKeys";
import Hoorey from "@/components/Hoorey/Hoorey";

const formSchema = z.object({
  clientId: z.string().min(1, "Client ID is required."),
  clientName: z.string().min(1, "Client Name is required."),
  clientGrantTypes: z.boolean().optional(),
  clientRedirectUris: z.boolean().optional(),
  clientScopes: z.boolean().optional(),
  clientClaims: z.boolean().optional(),
  clientCorsOrigins: z.boolean().optional(),
  clientPostLogoutRedirectUris: z.boolean().optional(),
  clientIdPRestrictions: z.boolean().optional(),
  clientProperties: z.boolean().optional(),
});

export type CloneClientFormData = z.infer<typeof formSchema>;

const defaultValues: CloneClientFormData = {
  clientId: "",
  clientName: "",
  clientGrantTypes: true,
  clientRedirectUris: true,
  clientScopes: true,
  clientClaims: true,
  clientCorsOrigins: true,
  clientPostLogoutRedirectUris: true,
  clientIdPRestrictions: true,
  clientProperties: true,
};

export const CloneClient = () => {
  const navigate = useNavigate();

  var queryClient = useQueryClient();

  const form = useForm<CloneClientFormData>({
    defaultValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const updateClientMutation = useMutation(
    (data: CloneClientFormData) =>
      cloneClient({
        id: Number(clientId),
        clientId: data.clientId,
        clientName: data.clientName,
        cloneClientGrantTypes: data.clientGrantTypes!,
        cloneClientRedirectUris: data.clientRedirectUris!,
        cloneClientScopes: data.clientScopes!,
        cloneClientClaims: data.clientClaims!,
        cloneClientCorsOrigins: data.clientCorsOrigins!,
        cloneClientPostLogoutRedirectUris: data.clientPostLogoutRedirectUris!,
        cloneClientIdPRestrictions: data.clientIdPRestrictions!,
        cloneClientProperties: data.clientProperties!,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.clients);
        navigate(ClientsUrl);
        toast({
          title: <Hoorey />,
          description: t("Client.Clone.Actions.Cloned"),
        });
      },
    }
  );

  const onSubmit: SubmitHandler<CloneClientFormData> = (data) => {
    updateClientMutation.mutate(data);
  };

  const { t } = useTranslation();

  const { clientId } = useParams<{ clientId: string }>();

  const { data: clientData, isLoading } = useClient(Number(clientId));

  if (isLoading || !clientData) {
    return <Loading fullscreen />;
  }

  return (
    <Page
      title={t("Client.Clone.PageTitle", { clientName: clientData.clientName })}
      description={t("Client.Clone.PageDescription")}
      topSection={
        <Breadcrumbs
          items={[
            { url: ClientsUrl, name: t("Clients.PageTitle") },
            {
              name: t("Client.PageTitle", {
                clientName: clientData.clientName,
              }),
            },
          ]}
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormRow
            name="clientId"
            label={t("Client.Label.ClientId_Label")}
            description={t("Client.Label.ClientId_Info")}
            placeholder={t("Client.Label.ClientId_Label")}
            type="input"
            inputSettings={{
              generateRandomValue: RandomValues.ClientId,
              copyToClipboard: true,
            }}
            required
            includeSeparator
          />
          <FormRow
            name="clientName"
            label={t("Client.Label.ClientName_Label")}
            description={t("Client.Label.ClientName_Info")}
            placeholder={t("Client.Label.ClientName_Label")}
            type="input"
            required
            includeSeparator
          />

          <FormRow
            name="clientGrantTypes"
            label={t("Client.Clone.LabelCloneClientGrantTypes")}
            description={t("Client.Clone.LabelCloneClientGrantTypes")}
            type="switch"
          />
          <FormRow
            name="clientRedirectUris"
            label={t("Client.Clone.LabelCloneClientRedirectUris")}
            description={t("Client.Clone.LabelCloneClientRedirectUris")}
            type="switch"
          />
          <FormRow
            name="clientScopes"
            label={t("Client.Clone.LabelCloneClientScopes")}
            description={t("Client.Clone.LabelCloneClientScopes")}
            type="switch"
          />
          <FormRow
            name="clientClaims"
            label={t("Client.Clone.LabelCloneClientClaims")}
            description={t("Client.Clone.LabelCloneClientClaims")}
            type="switch"
          />
          <FormRow
            name="clientCorsOrigins"
            label={t("Client.Clone.LabelCloneClientCorsOrigins")}
            description={t("Client.Clone.LabelCloneClientCorsOrigins")}
            type="switch"
          />
          <FormRow
            name="clientPostLogoutRedirectUris"
            label={t("Client.Clone.LabelCloneClientPostLogoutRedirectUris")}
            description={t(
              "Client.Clone.LabelCloneClientPostLogoutRedirectUris"
            )}
            type="switch"
          />
          <FormRow
            name="clientIdPRestrictions"
            label="Client IdP Restrictions"
            description={t("Client.Clone.LabelCloneClientIdPRestrictions")}
            type="switch"
          />
          <FormRow
            name="clientProperties"
            label={t("Client.Clone.LabelCloneClientProperties")}
            description={t("Client.Clone.LabelCloneClientProperties")}
            type="switch"
          />

          <div className="flex gap-4 justify-start mt-4">
            <Button type="submit">{t("Client.Clone.ButtonClone")}</Button>
          </div>
        </form>
      </Form>
    </Page>
  );
};

export default CloneClient;
