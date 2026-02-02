import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { RandomValues } from "@/helpers/CryptoHelper";
import { useSecretTypes } from "@/services/ClientServices";
import { TFunction } from "i18next";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Warning } from "../Warning/Warning";

export const defaultValues = {
  secretType: "SharedSecret" as const,
  secretValue: "",
  secretHashType: "sha256" as const,
  secretDescription: "",
  expiration: null,
  expirationTime: null,
  addExpiration: false,
};

export const createSecretFormSchema = (t: TFunction) =>
  z
    .object({
      secretType: z
        .string()
        .min(1, { message: t("Validation.SecretTypeRequired") }),
      secretValue: z
        .string()
        .min(1, { message: t("Validation.SecretValueRequired") }),
      secretHashType: z
        .enum(["sha256", "sha512"], {
          required_error: t("Validation.SecretHashTypeRequired"),
        })
        .optional(),
      secretDescription: z.string().optional(),
      expiration: z.date().nullable(),
      expirationTime: z.string().nullable(),
      addExpiration: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.addExpiration) {
        if (!data.expiration) {
          ctx.addIssue({
            code: "custom",
            message: t("Validation.ExpirationDateRequired"),
            path: ["expiration"],
          });
        }
        if (!data.expirationTime) {
          ctx.addIssue({
            code: "custom",
            message: t("Validation.ExpirationTimeRequired"),
            path: ["expirationTime"],
          });
        }
      }

      if (data.secretType === "SharedSecret" && !data.secretHashType) {
        ctx.addIssue({
          code: "custom",
          message: t("Validation.SecretHashTypeRequiredForSharedSecret"),
          path: ["secretHashType"],
        });
      }
    });

export type SecretsFormData = z.infer<
  ReturnType<typeof createSecretFormSchema>
>;

type SecretFormProps = {
  form: UseFormReturn<SecretsFormData>;
};

const SecretForm = ({ form }: SecretFormProps) => {
  const { t } = useTranslation();

  const { data: secretTypes, isLoading: secretTypesLoading } = useSecretTypes();

  if (secretTypesLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormRow
        required
        name="secretType"
        label={t("Client.Label.SecretType_Label")}
        description={t("Client.Label.SecretType_Info")}
        type="select"
        selectSettings={{
          options: secretTypes,
        }}
      />
      <hr className="my-4" />
      {form.watch("secretType") === "SharedSecret" && (
        <>
          <FormRow
            required
            name="secretHashType"
            label={t("Client.Label.HashType_Label")}
            description={t("Client.Label.HashType_Info")}
            type="select"
            selectSettings={{
              options: [
                { value: "sha256", label: "SHA-256" },
                { value: "sha512", label: "SHA-512" },
              ],
            }}
          />{" "}
          <hr className="my-4" />
        </>
      )}

      <FormRow
        required
        name="secretValue"
        label={t("Client.Label.SecretValue_Label")}
        description={t("Client.Label.SecretValue_Info")}
        placeholder={t("Client.Label.SecretValue_Label")}
        inputType="password"
        inputSettings={{
          generateRandomValue: RandomValues.SharedSecret,
          copyToClipboard: true,
        }}
      />

      <Warning className="mt-2">{t("ClientSecret.ValueWarning")}</Warning>
      <hr className="my-4" />
      <FormRow
        name="secretDescription"
        label={t("Client.Label.SecretDescription_Label")}
        description={t("Client.Label.SecretDescription_Info")}
        type="textarea"
      />
      <hr className="my-4" />
      <FormRow
        name="addExpiration"
        label={t("Client.Label.Expiration_Label")}
        description={t("Client.Label.Expiration_Info")}
        type="switch"
      />
      {form.watch("addExpiration") && (
        <div className="flex gap-6 mt-4">
          <FormRow
            name="expiration"
            label={t("Client.Label.ExpirationDate_Label")}
            description={t("Client.Label.ExpirationDate_Info")}
            type="date"
            className="flex-1"
          />
          <FormRow
            name="expirationTime"
            label={t("Client.Label.ExpirationTime_Label")}
            description={t("Client.Label.ExpirationTime_Info")}
            type="time"
            className="flex-1"
          />
        </div>
      )}
    </>
  );
};

export default SecretForm;
