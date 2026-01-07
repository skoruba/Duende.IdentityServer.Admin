import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useFormState } from "@/contexts/FormContext";
import { ClientWizardFormSummaryData } from "./ClientSummaryStep";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { useTranslation } from "react-i18next";
import { clientTypeRules, enforcedFieldMeta } from "../Common/ClientTypeRules";

const ClientSummaryTable = () => {
  const { formData, setActiveStep } =
    useFormState<ClientWizardFormSummaryData>();
  const { t } = useTranslation();
  const { excludeOptions, clientType } = useClientWizard();

  const createEditButton = (step: number, disabled: boolean = false) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setActiveStep(step)}
      className="p-2"
      disabled={disabled}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );

  const clientRules = clientType ? clientTypeRules[clientType] : undefined;

  return (
    <div>
      <section>
        <h2 className="text-xl font-semibold">
          {t("Client.Label.ClientDetails")}
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="flex flex-row">
              <TableHead className="flex-1 p-2">
                {t("Client.Label.Field")}
              </TableHead>
              <TableHead className="flex-1 p-2">
                {t("Client.Label.Value")}
              </TableHead>
              <TableHead className="flex-1 p-2 flex justify-end me-1">
                {t("Actions.Edit")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="flex flex-row">
              <TableCell className="flex-1 p-2">
                {t("Client.Label.ClientId_Label")}
              </TableCell>
              <TableCell className="flex-1 p-2">{formData.clientId}</TableCell>
              <TableCell className="flex-1 p-2 flex justify-end">
                {createEditButton(1)}
              </TableCell>
            </TableRow>
            <TableRow className="flex flex-row">
              <TableCell className="flex-1 p-2">
                {t("Client.Label.ClientName_Label")}
              </TableCell>
              <TableCell className="flex-1 p-2">
                {formData.clientName}
              </TableCell>
              <TableCell className="flex-1 p-2 flex justify-end">
                {createEditButton(1)}
              </TableCell>
            </TableRow>
            <TableRow className="flex flex-row">
              <TableCell className="flex-1 p-2">
                {t("Client.Label.Description_Label")}
              </TableCell>
              <TableCell className="flex-1 p-2">
                {formData.description}
              </TableCell>
              <TableCell className="flex-1 p-2 flex justify-end">
                {createEditButton(1)}
              </TableCell>
            </TableRow>

            {!excludeOptions?.consent && (
              <TableRow className="flex flex-row">
                <TableCell className="flex-1 p-2">
                  {t("Client.Label.RequireConsent_Label")}
                </TableCell>
                <TableCell className="flex-1 p-2">
                  {formData.requireConsent ? t("Actions.Yes") : t("Actions.No")}
                </TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(1)}
                </TableCell>
              </TableRow>
            )}

            {clientRules &&
              (
                Object.keys(clientRules.enforcedValues) as Array<
                  keyof typeof clientRules.enforcedValues
                >
              ).map((key) => {
                const value = clientRules.enforcedValues[key];
                if (value === undefined) return null;

                const meta = enforcedFieldMeta[key];
                if (!meta) return null;

                return (
                  <TableRow className="flex flex-row" key={key}>
                    <TableCell className="flex-1 p-2">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {t(meta.labelKey as any)}
                    </TableCell>
                    <TableCell className="flex-1 p-2">
                      {meta.format ? meta.format(value, t) : String(value)}
                    </TableCell>
                    <TableCell className="flex-1 p-2 flex justify-end">
                      {createEditButton(1, true)}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </section>

      {!excludeOptions?.uris && (
        <section className="mt-3">
          <h2 className="text-xl font-semibold">
            {t("Client.Label.RedirectLogoutUrisTitle")}
          </h2>
          <Table>
            <TableHeader>
              <TableRow className="flex flex-row">
                <TableHead className="flex-1 p-2">
                  {t("Client.Label.Field")}
                </TableHead>
                <TableHead className="flex-1 p-2">
                  {t("Client.Label.Value")}
                </TableHead>
                <TableHead className="flex-1 p-2 flex justify-end me-1">
                  {t("Actions.Edit")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="flex flex-row">
                <TableCell className="flex-1 p-2">
                  {t("Client.Label.RedirectUris_Label")}
                </TableCell>
                <TableCell className="flex-1 p-2">
                  {formData.redirectUris.join(", ")}
                </TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(2)}
                </TableCell>
              </TableRow>
              <TableRow className="flex flex-row">
                <TableCell className="flex-1 p-2">
                  {t("Client.Label.PostLogoutRedirectUris_Label")}
                </TableCell>
                <TableCell className="flex-1 p-2">
                  {formData.logoutUri}
                </TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold">{t("Client.Tabs.Scopes")}</h2>
        <Table>
          <TableHeader>
            <TableRow className="flex flex-row">
              <TableHead className="flex-1 p-2"></TableHead>
              <TableHead className="flex-1 p-2 flex justify-end me-1">
                {t("Actions.Edit")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formData.scopes.map((item: { id: string; label: string }) => (
              <TableRow className="flex flex-row" key={item.id}>
                <TableCell className="flex-1 p-2">{item.label}</TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {!excludeOptions?.secrets && (
        <section>
          <h2 className="text-xl font-semibold">{t("Client.Tabs.Secrets")}</h2>
          <Table>
            <TableHeader>
              <TableRow className="flex flex-row">
                <TableHead className="flex-1 p-2">
                  {t("Client.Label.Field")}
                </TableHead>
                <TableHead className="flex-1 p-2">
                  {t("Client.Label.Value")}
                </TableHead>
                <TableHead className="flex-1 p-2 flex justify-end me-1">
                  {t("Actions.Edit")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="flex flex-row">
                <TableCell className="flex-1 p-2">
                  {t("Client.Label.SecretType_Label")}
                </TableCell>
                <TableCell className="flex-1 p-2">
                  {formData.secretType}
                </TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(4)}
                </TableCell>
              </TableRow>
              <TableRow className="flex flex-row">
                <TableCell className="flex-1 p-2">
                  {t("Client.Label.SecretDescription_Label")}
                </TableCell>
                <TableCell className="flex-1 p-2">
                  {formData.secretDescription}
                </TableCell>
                <TableCell className="flex-1 p-2 flex justify-end">
                  {createEditButton(4)}
                </TableCell>
              </TableRow>
              {formData.addExpiration && (
                <>
                  <TableRow className="flex flex-row">
                    <TableCell className="flex-1 p-2">
                      {t("Client.Label.ClientSecret_ExpirationDate")}
                    </TableCell>
                    <TableCell className="flex-1 p-2">
                      {formData.expiration
                        ? new Date(formData.expiration).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="flex-1 p-2 flex justify-end">
                      {createEditButton(4)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="flex flex-row">
                    <TableCell className="flex-1 p-2">
                      {t("Client.Label.ClientSecret_ExpirationTime")}
                    </TableCell>
                    <TableCell className="flex-1 p-2">
                      {formData.expirationTime}
                    </TableCell>
                    <TableCell className="flex-1 p-2 flex justify-end">
                      {createEditButton(4)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
};

export default ClientSummaryTable;
