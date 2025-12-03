import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import { useFormState } from "@/contexts/FormContext";
import { BasicsFormData } from "./ClientBasicsStep";
import { ScopesFormData } from "./ClientScopesStep";
import { SecretsFormData } from "@/components/SecretForm/SecretForm";
import { UrisFormData } from "./ClientUrisStep";
import { toast } from "@/components/ui/use-toast";
import { useCreateClient } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";
import { mapFormDataToCreateClient } from "../../ClientSchema";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/Card/Card";
import ClientWebSummaryTree from "./ClientSummaryTree";
import ClientSummaryTable from "./ClientSummaryTable";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { ClientTypeKey, ClientTypeLabel } from "@/models/Clients/ClientModels";
import { useTranslation } from "react-i18next";
import { clientTypeRules } from "../Common/ClientTypeRules";
import Hoorey from "@/components/Hoorey/Hoorey";
import { ClientEditUrl } from "@/routing/Urls";
import { useNavigateWithBlockerInWizard } from "@/hooks/useConfirmUnsavedChanges";
import { getNowForUnspecifiedDb } from "@/helpers/DateTimeHelper";

export type ClientWizardFormSummaryData = BasicsFormData &
  ScopesFormData &
  UrisFormData &
  SecretsFormData &
  AdditionalConfiguration;

export type AdditionalConfiguration = {
  requirePushedAuthorization: boolean;
  requireDPoP: boolean;
  clientProperties: { key: string; value: string }[];
  allowOfflineAccess: boolean;
  requirePkce: boolean;
  requireClientSecret: boolean;
  authorizationCodeLifetime: number;
};

export enum View {
  Tree = "tree",
  Table = "table",
}

const ClientSummaryStep = () => {
  const { formData, onHandleBack, resetForm } =
    useFormState<ClientWizardFormSummaryData>();
  const { mutate: createClientAction, isLoading } = useCreateClient();
  const [view, setView] = useState<View>(View.Tree);
  const { t } = useTranslation();

  const navigate = useNavigateWithBlockerInWizard();

  const { additionData, excludeOptions, closeModal, clientType } =
    useClientWizard();

  const getFilteredFormData = (): Partial<ClientWizardFormSummaryData> => {
    const {
      requireConsent,
      redirectUris,
      logoutUri,
      secretType,
      secretValue,
      secretDescription,
      expiration,
      ...rest
    } = formData;

    const rules = clientType ? clientTypeRules[clientType] : undefined;

    return {
      ...rest,
      ...(excludeOptions?.consent ? {} : { requireConsent }),
      ...(excludeOptions?.uris ? {} : { redirectUris, logoutUri }),
      ...(excludeOptions?.secrets
        ? {}
        : { secretType, secretValue, secretDescription, expiration }),
      ...(rules?.enforcedValues ?? {}),
      clientProperties: [
        { key: ClientTypeKey, value: ClientTypeLabel[clientType!] },
      ],
    };
  };

  const createClientDto = () => {
    const filteredFormData = getFilteredFormData();

    return mapFormDataToCreateClient(
      filteredFormData,
      additionData?.grantTypes ?? []
    );
  };

  const onSubmit = async () => {
    try {
      const clientApiDto = createClientDto();
      const secrets = excludeOptions?.secrets
        ? undefined
        : new client.ClientSecretApiDto({
            id: 0,
            description: formData.secretDescription!,
            expiration: formData.expiration || undefined,
            hashType: formData.secretHashType,
            type: formData.secretType!,
            value: formData.secretValue,
            created: getNowForUnspecifiedDb(),
          });

      createClientAction(
        { clientData: clientApiDto, secret: secrets },
        {
          onSuccess: (data) => {
            toast({
              title: <Hoorey />,
              description: t("Client.Actions.Added"),
            });
            closeModal();
            resetForm();

            navigate(ClientEditUrl.replace(":clientId", String(data.id)));
          },
        }
      );
    } catch (error) {
      toast({
        title: t("Errors.Failed"),
        variant: "destructive",
        description: t("Errors.FailedMessage"),
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="space-y-6 mt-4">
        <Alert variant="default" className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <CircleCheckBig className="h-5 w-5 text-primary mt-1" />
            <div>
              <AlertTitle className="text-primary font-semibold">
                {t("Client.Label.FinalClientReview")}
              </AlertTitle>
              <AlertDescription>
                {t("Client.Label.FinalClientReviewMessage")}
              </AlertDescription>
            </div>
          </div>
          <RadioGroup
            value={view}
            onValueChange={(value) => setView(value as View)}
            className="flex items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={View.Tree} id="tree" />
              <Label htmlFor="tree">
                {t("Client.Label.FinalClientReviewTreeView")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={View.Table} id="table" />
              <Label htmlFor="table">
                {t("Client.Label.FinalClientReviewTableView")}
              </Label>
            </div>
          </RadioGroup>
        </Alert>
        {view === View.Table ? (
          <ClientSummaryTable />
        ) : (
          <ClientWebSummaryTree />
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button onClick={onHandleBack} variant="outline">
          {t("Actions.Back")}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? <Loading /> : t("Actions.Save")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientSummaryStep;
