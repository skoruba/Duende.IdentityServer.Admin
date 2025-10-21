import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFormState } from "@/contexts/FormContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  useDirtyFormState,
  useDirtyReset,
  useTrackErrorState,
} from "@/components/hooks/useTrackDirtyState";
import SecretForm, {
  defaultValues,
  SecretsFormData,
  createSecretFormSchema as secretFormSchema,
} from "../../../../components/SecretForm/SecretForm";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { Trans, useTranslation } from "react-i18next";
import { Tip } from "@/components/Tip/Tip";
import { ClientType } from "@/models/Clients/ClientModels";
import { combineDateTimeForUnspecifiedDb } from "@/helpers/DateTimeHelper";

export const SecretStep = () => {
  const { t } = useTranslation();

  const { onHandleNext, setFormData, formData, onHandleBack } =
    useFormState<SecretsFormData>();

  const { onValidation, clientType } = useClientWizard();

  const form = useForm<SecretsFormData>({
    defaultValues,
    resolver: zodResolver(secretFormSchema(t)),
    mode: "onChange",
  });

  useDirtyReset(form, formData, defaultValues);
  useTrackErrorState(onValidation, form.formState.errors, form.getValues());
  useDirtyFormState(form, "secret");

  const onSubmit: SubmitHandler<SecretsFormData> = (data) => {
    const combinedExpiration = combineDateTimeForUnspecifiedDb(
      data.expiration,
      data.expirationTime
    );

    setFormData((prev: any) => ({
      ...prev,
      ...data,
      expiration: data.addExpiration ? combinedExpiration : null,
    }));

    onHandleNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {clientType === ClientType.HighSecure && (
          <Tip>
            <Trans
              i18nKey="Client.Tips.HighSecureAuth"
              components={{ strong: <strong /> }}
            />
          </Tip>
        )}

        <SecretForm form={form} />
        <div className="flex justify-between mt-4">
          <Button onClick={onHandleBack} variant="outline">
            {t("Actions.Back")}
          </Button>
          <Button type="submit">{t("Actions.Next")}</Button>
        </div>
      </form>
    </Form>
  );
};
