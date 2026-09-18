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
} from "@/components/SecretForm/SecretForm";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { Trans, useTranslation } from "react-i18next";
import { Tip } from "@/components/Tip/Tip";
import { Warning } from "@/components/Warning/Warning";
import {
  clientTypeRules,
  getSecretStepNotice,
} from "@/pages/Client/Wizard/Common/ClientTypeRules";
import { useMemo } from "react";
import { combineDateTimeForUnspecifiedDb } from "@/helpers/DateTimeHelper";

export const SecretStep = () => {
  const { t } = useTranslation();

  const { onHandleNext, setFormData, formData, onHandleBack } =
    useFormState<SecretsFormData>();

  const { onValidation, clientType } = useClientWizard();

  // The client type decides what the step starts with - JWK for a high security
  // client. It is only a starting point: a value entered earlier still wins.
  const stepDefaultValues = useMemo(
    () => ({
      ...defaultValues,
      secretType: clientType
        ? clientTypeRules[clientType].defaultSecretType
        : defaultValues.secretType,
    }),
    [clientType],
  );

  const form = useForm<SecretsFormData>({
    defaultValues: stepDefaultValues,
    resolver: zodResolver(secretFormSchema(t)),
    mode: "onChange",
  });

  useDirtyReset(form, formData, stepDefaultValues);

  const notice = getSecretStepNotice(clientType, form.watch("secretType"));
  const NoticeBox = notice?.kind === "warning" ? Warning : Tip;
  useTrackErrorState(onValidation, form.formState.errors, form.getValues());
  useDirtyFormState(form, "secret");

  const onSubmit: SubmitHandler<SecretsFormData> = (data) => {
    const combinedExpiration = combineDateTimeForUnspecifiedDb(
      data.expiration,
      data.expirationTime
    );

    setFormData((prev) => ({
      ...prev,
      ...data,
      expiration: data.addExpiration ? combinedExpiration : null,
    }));

    onHandleNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {notice && (
          <NoticeBox>
            <Trans
              i18nKey={notice.messageKey as never}
              components={{ strong: <strong /> }}
            />
          </NoticeBox>
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
