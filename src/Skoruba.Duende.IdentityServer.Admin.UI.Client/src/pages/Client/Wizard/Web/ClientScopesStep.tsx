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
import { useClientScopes } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";
import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";
import { ClientScope } from "@/models/Clients/ClientModels";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ApiResourceCreateUrl,
  IdentityResourceCreateUrl,
} from "@/routing/Urls";
import { Tip } from "@/components/Tip/Tip";
import { TFunction } from "i18next";

export type ScopesFormData = {
  scopes: ClientScope[];
};

const createFormSchema = (t: TFunction) =>
  z.object({
    scopes: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
        })
      )
      .min(1, {
        message: t("Client.Wizard.Validation.ScopesRequired"),
      }),
  });

const defaultValues: ScopesFormData = {
  scopes: [],
};

export const ClientScopesStep = () => {
  const { onHandleNext, setFormData, onHandleBack, formData } =
    useFormState<ScopesFormData>();
  const { t } = useTranslation();

  const { excludeOptions, onValidation } = useClientWizard();

  const form = useForm<ScopesFormData>({
    resolver: zodResolver(createFormSchema(t)),
    defaultValues,
    mode: "onChange",
  });

  useDirtyReset(form, formData, defaultValues);
  useTrackErrorState(onValidation, form.formState.errors, form.getValues());
  useDirtyFormState(form, "scopes");

  const onSubmit: SubmitHandler<ScopesFormData> = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    onHandleNext();
  };

  const clientScopes = useClientScopes(
    excludeOptions?.identityResources ?? false,
    false
  );

  return clientScopes.isLoading ? (
    <Loading />
  ) : (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tip>
          {t("Client.Tips.NoScopes")}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 underline"
            asChild
          >
            <Link
              to={IdentityResourceCreateUrl}
              className="flex items-center gap-1 text-blue-600"
              target="_blank"
            >
              <ArrowRight className="h-3 w-3" />
              {t("Client.Tips.NoScopesIdentityResource")}
            </Link>
          </Button>{" "}
          or{" "}
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 underline"
            asChild
          >
            <Link
              to={ApiResourceCreateUrl}
              className="flex items-center gap-1 text-blue-600"
              target="_blank"
            >
              <ArrowRight className="h-3 w-3" />
              {t("Client.Tips.NoScopesApiResource")}
            </Link>
          </Button>
          .
        </Tip>

        <FormRow
          name="scopes"
          label={t("Client.Label.AllowedScopes_Label")}
          description={t("Client.Label.AllowedScopes_Info")}
          type="dualList"
          dualListSettings={{
            initialItems: clientScopes.data ?? [],
          }}
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
