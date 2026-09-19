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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import FormValidationSummary from "@/components/FormValidationSummary/FormValidationSummary";
import { configurationChangeMeta } from "@/services/mutationMeta";

export type ClientEditFormType = {
  clientId: string;
  client: ClientEditFormData;
};

const clientValidationFieldLabelKeys: Record<string, string> = {
  clientId: "Client.Label.ClientId_Label",
  clientName: "Client.Label.ClientName_Label",
  description: "Client.Label.Description_Label",
  enabled: "Client.Label.Enabled_Label",
  redirectUris: "Client.Label.RedirectUris_Label",
  postLogoutRedirectUris: "Client.Label.PostLogoutRedirectUris_Label",
  frontChannelLogoutUri: "Client.Label.FrontChannelLogoutUri_Label",
  frontChannelLogoutSessionRequired:
    "Client.Label.FrontChannelLogoutSessionRequired_Label",
  backChannelLogoutUri: "Client.Label.BackChannelLogoutUri_Label",
  backChannelLogoutSessionRequired:
    "Client.Label.BackChannelLogoutSessionRequired_Label",
  allowedCorsOrigins: "Client.Label.AllowedCorsOrigins_Label",
  allowedScopes: "Client.Label.AllowedScopes_Label",
  allowOfflineAccess: "Client.Label.AllowOfflineAccess_Label",
  requireClientSecret: "Client.Label.RequireClientSecret_Label",
  allowedGrantTypes: "Client.Label.AllowedGrantTypes_Label",
  enableLocalLogin: "Client.Label.EnableLocalLogin_Label",
  identityProviderRestrictions:
    "Client.Label.IdentityProviderRestrictions_Label",
  useSsoLifetime: "Client.Label.UserSsoLifetime_Label",
  coordinateLifetimeWithUserSession:
    "Client.Label.CoordinateLifetimeWithUserSession_Label",
  identityTokenLifetime: "Client.Label.IdentityTokenLifetime_Label",
  allowedIdentityTokenSigningAlgorithms:
    "Client.Label.SigningAlgorithms_Label",
  accessTokenLifetime: "Client.Label.AccessTokenLifetime_Label",
  allowAccessTokenViaBrowser: "Client.Label.AllowAccessTokensViaBrowser_Label",
  accessTokenType: "Client.Label.AccessTokenTypes_Label",
  authorizationCodeLifetime: "Client.Label.AuthorizationCodeLifetime_Label",
  requireRequestObject: "Client.Label.RequireRequestObject_Label",
  requirePkce: "Client.Label.RequirePkce_Label",
  allowPlainTextPkce: "Client.Label.AllowPlainTextPkce_Label",
  absoluteRefreshTokenLifetime:
    "Client.Label.AbsoluteRefreshTokenLifetime_Label",
  slidingRefreshTokenLifetime:
    "Client.Label.SlidingRefreshTokenLifetime_Label",
  cibaLifetime: "Client.Label.CibaLifetime_Label",
  pollingInterval: "Client.Label.PollingInterval_Label",
  refreshTokenUsage: "Client.Label.RefreshTokenUsage_Label",
  refreshTokenExpiration: "Client.Label.RefreshTokenExpiration_Label",
  updateAccessTokenClaimsOnRefresh:
    "Client.Label.UpdateAccessTokenClaimsOnRefresh_Label",
  includeJti: "Client.Label.IncludeJwtId_Label",
  alwaysSendClientClaims: "Client.Label.AlwaysSendClientClaims_Label",
  alwaysIncludeUserClaimsInIdToken:
    "Client.Label.AlwaysIncludeUserClaimsInIdToken_Label",
  clientClaimsPrefix: "Client.Label.ClientClaimsPrefix_Label",
  pairWiseSubjectSalt: "Client.Label.PairWiseSubjectSalt_Label",
  requireDPoP: "Client.Label.RequireDPoP_Label",
  dPoPClockSkew: "Client.Label.DPoPClockSkew_Label",
  dPoPValidationMode: "Client.Label.DPoPValidationMode_Label",
  requirePushedAuthorization:
    "Client.Label.RequirePushedAuthorization_Label",
  pushedAuthorizationLifetime:
    "Client.Label.PushedAuthorizationLifetime_Label",
  initiateLoginUri: "Client.Label.InitiateLoginUri_Label",
  requireConsent: "Client.Label.RequireConsent_Label",
  allowRememberConsent: "Client.Label.AllowRememberConsent_Label",
  clientUri: "Client.Label.ClientUri_Label",
  logoUri: "Client.Label.LogoUri_Label",
  userCodeType: "Client.Label.UserCodeType_Label",
  deviceCodeLifetime: "Client.Label.DeviceCodeLifetime_Label",
  consentLifetime: "Client.Label.ConsentLifetime_Label",
  userSsoLifetime: "Client.Label.UserSsoLifetime_Label",
  "properties.key": "Property.Key",
  "properties.value": "Property.Value",
  "claims.key": "Claim.Key",
  "claims.value": "Claim.Value",
};

const ClientEditForm = ({ clientId, client }: ClientEditFormType) => {
  const form = useForm<ClientEditFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: client,
  });

  const clientValidationFieldLabels = Object.fromEntries(
    Object.entries(clientValidationFieldLabelKeys).map(([field, labelKey]) => [
      field,
      t(labelKey as never),
    ]),
  );

  const navigate = useNavigateWithBlocker(form);

  const { DialogCmp } = useConfirmUnsavedChanges(form.formState.isDirty);

  const queryClient = useQueryClient();
  const deleteClientModal = useModal();

  const updateClientMutation = useMutation({
    meta: configurationChangeMeta,
    mutationFn: (data: ClientEditFormData) =>
      updateClient(mapFormDataToEditClient(data, Number(clientId))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.client] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.clients] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.configurationIssues],
      });
    },
  });

  const onSubmit: SubmitHandler<ClientEditFormData> = (
    data: ClientEditFormData,
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
          <FormValidationSummary fieldLabels={clientValidationFieldLabels} />
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
            <Button type="submit" disabled={updateClientMutation.isPending}>
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
