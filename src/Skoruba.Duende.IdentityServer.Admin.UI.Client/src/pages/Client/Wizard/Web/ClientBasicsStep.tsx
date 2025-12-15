import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormState } from "@/contexts/FormContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  useDirtyReset,
  useDirtyFormState,
  useTrackErrorState,
} from "@/components/hooks/useTrackDirtyState";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { FormRow } from "@/components/FormRow/FormRow";
import { RandomValues } from "@/helpers/CryptoHelper";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { Tip } from "@/components/Tip/Tip";
import { Shuffle } from "lucide-react";

const createFormSchema = (t: TFunction) => {
  const clientIdLabel = t("Client.Label.ClientId_Label");
  const clientNameLabel = t("Client.Label.ClientName_Label");
  const requiredField = (label: string) =>
    t("Validation.FieldRequired", {
      field: label,
    });

  return z.object({
    clientId: z.string().min(1, {
      message: requiredField(clientIdLabel),
    }),
    clientName: z.string().min(1, {
      message: requiredField(clientNameLabel),
    }),
    description: z.string().optional(),
    requireConsent: z.boolean().optional(),
  });
};

export type BasicsFormData = z.infer<ReturnType<typeof createFormSchema>>;

const defaultValues: BasicsFormData = {
  clientId: "",
  clientName: "",
  description: "",
  requireConsent: true,
};

export const ClientBasicsStep = () => {
  const { onHandleNext, setFormData, formData } =
    useFormState<BasicsFormData>();

  const { excludeOptions, onValidation } = useClientWizard();

  const { t } = useTranslation();

  const form = useForm<BasicsFormData>({
    defaultValues,
    resolver: zodResolver(createFormSchema(t)),
    mode: "onChange",
  });

  useDirtyReset(form, formData, defaultValues);
  useTrackErrorState(onValidation, form.formState.errors, form.getValues());
  useDirtyFormState(form, "basics");

  const onSubmit: SubmitHandler<BasicsFormData> = (data) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    onHandleNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tip>
          <Trans
            i18nKey="Client.Tips.UniqueClientId"
            components={{
              strong: <strong />,
              generate: <Shuffle className="inline-block h-4" />,
            }}
          ></Trans>
        </Tip>

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
          name="description"
          label="Description"
          description={t("Client.Label.Description_Info")}
          placeholder={t("Client.Label.Description_Label")}
          type="textarea"
        />
        {!excludeOptions?.consent && (
          <FormRow
            name="requireConsent"
            label={t("Client.Label.RequireConsent_Label")}
            description={t("Client.Label.RequireConsent_Info")}
            type="switch"
          />
        )}
        <div className="flex gap-4 justify-end mt-4">
          <Button type="submit" className="mt-4">
            {t("Actions.Next")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
