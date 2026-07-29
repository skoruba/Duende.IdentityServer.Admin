import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFormState } from "@/contexts/FormContext";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  useDirtyFormState,
  useDirtyReset,
  useTrackErrorState,
} from "@/components/hooks/useTrackDirtyState";
import { FormRow } from "@/components/FormRow/FormRow";
import { Trans, useTranslation } from "react-i18next";
import { urlValidationSchema } from "../../Common/UrlListValidatorSchema";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { TFunction } from "i18next";
import { CopyableCode } from "@/components/CopyableCode/CopyableCode";
import { Tip } from "@/components/Tip/Tip";

const formSchema = (t: TFunction) =>
  z.object({
    redirectUri: z
      .string()
      .min(1, { message: t("Client.Wizard.Validation.RedirectUriRequired") })
      .pipe(urlValidationSchema(t)),
    logoutUri: urlValidationSchema(t).or(z.literal("")).optional(),
  });

export type UrisFormData = z.infer<ReturnType<typeof formSchema>>;

const defaultValues = {
  redirectUri: "",
  logoutUri: "",
};

export const ClientUrisStep = () => {
  const { onHandleNext, setFormData, formData, onHandleBack } =
    useFormState<UrisFormData>();

  const { onValidation } = useClientWizard();

  const { t } = useTranslation();

  const form = useForm<UrisFormData>({
    defaultValues,
    resolver: zodResolver(formSchema(t)),
    mode: "onChange",
  });

  useDirtyReset(form, formData, defaultValues);
  useTrackErrorState(onValidation, form.formState.errors, form.getValues());
  useDirtyFormState(form, "uris");

  const onSubmit: SubmitHandler<UrisFormData> = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    onHandleNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tip>
          <Trans
            i18nKey="Client.Tips.RedirectUris"
            components={{
              strong: <strong />,
              code: <CopyableCode />,
              br: <br />,
            }}
          />
        </Tip>

        <FormRow
          name="redirectUri"
          label={t("Client.Label.RedirectUri_Label")}
          description={t("Client.Label.RedirectUris_Info")}
          required
          includeSeparator
        />
        <FormRow
          name="logoutUri"
          label={t("Client.Label.PostLogoutRedirectUri_Label")}
          description={t("Client.Label.PostLogoutRedirectUris_Info")}
        />
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
