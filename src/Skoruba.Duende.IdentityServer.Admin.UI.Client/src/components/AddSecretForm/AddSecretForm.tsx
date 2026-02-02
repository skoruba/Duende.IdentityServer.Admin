import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import SecretForm, {
  SecretsFormData,
  defaultValues,
  createSecretFormSchema as secretFormSchema,
} from "../SecretForm/SecretForm";
import { useTranslation } from "react-i18next";

type AddSecretFormProps = {
  onSubmit: SubmitHandler<SecretsFormData>;
  onCancel: () => void;
  isSubmitting: boolean;
};

const AddSecretForm: React.FC<AddSecretFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();

  const form = useForm<SecretsFormData>({
    defaultValues,
    resolver: zodResolver(secretFormSchema(t)),
    mode: "onChange",
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.stopPropagation();

    form.handleSubmit((data) => {
      onSubmit(data);
      toast({
        title: t("Actions.Hooray"),
        description: t("ClientSecret.Actions.Added"),
      });
    })(event);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <SecretForm form={form} />
        <div className="flex gap-4 justify-end mt-4">
          <Button type="button" onClick={onCancel}>
            {t("Actions.Cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {t("Actions.Save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddSecretForm;
