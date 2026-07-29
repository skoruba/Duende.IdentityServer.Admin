import { FormRow } from "@/components/FormRow/FormRow";
import GenerateJwkDialog from "@/components/GenerateJwkDialog/GenerateJwkDialog";
import Loading from "@/components/Loading/Loading";
import { Button } from "@/components/ui/button";
import { RandomValues } from "@/helpers/CryptoHelper";
import { useSecretTypes } from "@/services/ClientServices";
import { TFunction } from "i18next";
import { KeyRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Success } from "../Success/Success";
import { Tip } from "../Tip/Tip";
import { Warning } from "../Warning/Warning";

/** Secret types as returned by the API - see ClientConsts.GetSecretTypes(). */
export const SecretTypes = {
  SharedSecret: "SharedSecret",
  Jwk: "JWK",
} as const;

export const defaultValues = {
  secretType: "SharedSecret" as const,
  secretValue: "",
  secretHashType: "sha256" as const,
  secretDescription: "",
  expiration: null,
  expirationTime: null,
  addExpiration: false,
};

const privateJwkMembers = ["d", "p", "q", "dp", "dq", "qi", "oth", "k"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasStringMembers = (
  jwk: Record<string, unknown>,
  members: string[],
): boolean => members.every((member) => typeof jwk[member] === "string");

/** A key may also be expressed as a certificate chain instead of its raw members. */
const hasCertificateChain = (jwk: Record<string, unknown>): boolean =>
  Array.isArray(jwk.x5c) &&
  jwk.x5c.length > 0 &&
  jwk.x5c.every((entry) => typeof entry === "string");

/** Walks the whole structure - private members must not survive anywhere in it. */
const findPrivateMember = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findPrivateMember(item);
      if (found) {
        return found;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const member = privateJwkMembers.find((candidate) =>
    Object.prototype.hasOwnProperty.call(value, candidate),
  );
  if (member) {
    return member;
  }

  for (const nested of Object.values(value)) {
    const found = findPrivateMember(nested);
    if (found) {
      return found;
    }
  }

  return null;
};

type PublicJwkInspection = {
  /** Blocks the form - the value is unusable or leaks private key material. */
  error: string | null;
  /** Shown to the user but does not block - the value may still be valid. */
  warning: string | null;
};

const noJwkIssues: PublicJwkInspection = { error: null, warning: null };

const jwkError = (message: string): PublicJwkInspection => ({
  error: message,
  warning: null,
});

/**
 * Deliberately only rejects what is certainly wrong. Key types we do not know are
 * reported as a warning, because IdentityServer - not this form - decides what it
 * accepts, and there is no other way to enter the value.
 */
const inspectPublicJwk = (
  value: string,
  t: TFunction,
): PublicJwkInspection => {
  if (!value.trim()) {
    return jwkError(t("Validation.SecretValueRequired"));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return jwkError(t("Validation.JwkInvalidJson"));
  }

  if (!isRecord(parsed)) {
    return jwkError(t("Validation.JwkMustBeObject"));
  }

  const privateMember = findPrivateMember(parsed);
  if (privateMember) {
    return jwkError(t("Validation.JwkPublicOnly", { member: privateMember }));
  }

  if (Array.isArray(parsed.keys)) {
    return jwkError(t("Validation.JwkSetNotSupported"));
  }

  if (typeof parsed.kty !== "string") {
    return jwkError(t("Validation.JwkKeyTypeRequired"));
  }

  const hasChain = hasCertificateChain(parsed);

  switch (parsed.kty) {
    case "RSA":
      return hasStringMembers(parsed, ["n", "e"]) || hasChain
        ? noJwkIssues
        : jwkError(t("Validation.JwkRsaRequiredMembers"));
    case "EC":
      return hasStringMembers(parsed, ["crv", "x", "y"]) || hasChain
        ? noJwkIssues
        : jwkError(t("Validation.JwkEcRequiredMembers"));
    case "OKP":
      return hasStringMembers(parsed, ["crv", "x"])
        ? noJwkIssues
        : jwkError(t("Validation.JwkOkpRequiredMembers"));
    case "oct":
      return jwkError(t("Validation.JwkSymmetricNotSupported"));
    default:
      return {
        error: null,
        warning: t("Validation.JwkUnknownKeyType", { kty: parsed.kty }),
      };
  }
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

      if (data.secretType === SecretTypes.SharedSecret && !data.secretHashType) {
        ctx.addIssue({
          code: "custom",
          message: t("Validation.SecretHashTypeRequiredForSharedSecret"),
          path: ["secretHashType"],
        });
      }

      if (data.secretType === SecretTypes.Jwk) {
        const { error } = inspectPublicJwk(data.secretValue, t);

        if (error) {
          ctx.addIssue({
            code: "custom",
            message: error,
            path: ["secretValue"],
          });
        }
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

  const [isJwkDialogOpen, setIsJwkDialogOpen] = useState(false);

  const { data: secretTypes, isLoading: secretTypesLoading } = useSecretTypes();

  const secretType = form.watch("secretType");
  const secretValue = form.watch("secretValue");
  const isSharedSecret = secretType === SecretTypes.SharedSecret;
  const isJwk = secretType === SecretTypes.Jwk;
  const jwkInspection =
    isJwk && typeof secretValue === "string" && secretValue.trim().length > 0
      ? inspectPublicJwk(secretValue, t)
      : null;
  const hasValidPublicJwk = !!jwkInspection && !jwkInspection.error;
  const jwkWarning = jwkInspection?.warning ?? null;

  const handleUsePublicKey = (publicJwk: string) => {
    form.setValue("secretValue", publicJwk, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // The formats are not interchangeable - a JWK left behind in a shared secret
  // field would silently be hashed and stored as one.
  const previousSecretType = useRef(secretType);

  useEffect(() => {
    if (previousSecretType.current === secretType) {
      return;
    }

    previousSecretType.current = secretType;
    form.resetField("secretValue", { defaultValue: "" });
  }, [secretType, form]);

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
      {isSharedSecret && (
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

      {isJwk ? (
        <>
          <FormRow
            required
            name="secretValue"
            label={t("Client.Label.SecretValue_Label")}
            description={t("Client.Label.SecretValue_Info")}
            placeholder={t("ClientSecret.Jwk.ValuePlaceholder")}
            type="textarea"
            textareaSettings={{
              copyToClipboard: true,
              monospace: true,
              rows: 6,
            }}
          />
          {hasValidPublicJwk &&
            (jwkWarning ? (
              <Warning className="mt-2">{jwkWarning}</Warning>
            ) : (
              <Success className="mt-2">
                {t("ClientSecret.Jwk.PublicKeyValidated")}
              </Success>
            ))}
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => setIsJwkDialogOpen(true)}
          >
            <KeyRound className="me-2 h-4 w-4" />
            {t("ClientSecret.Jwk.GenerateAction")}
          </Button>
          <Tip className="mt-2">{t("ClientSecret.Jwk.ValueTip")}</Tip>
          <GenerateJwkDialog
            open={isJwkDialogOpen}
            onOpenChange={setIsJwkDialogOpen}
            onUsePublicKey={handleUsePublicKey}
          />
        </>
      ) : (
        <>
          <FormRow
            required
            name="secretValue"
            label={t("Client.Label.SecretValue_Label")}
            description={t("Client.Label.SecretValue_Info")}
            placeholder={t("Client.Label.SecretValue_Label")}
            inputType={isSharedSecret ? "password" : "text"}
            inputSettings={{
              generateRandomValue: isSharedSecret
                ? RandomValues.SharedSecret
                : RandomValues.None,
              copyToClipboard: true,
            }}
          />
          {/* Only a shared secret is hashed - the other types stay readable. */}
          {isSharedSecret ? (
            <Warning className="mt-2">{t("ClientSecret.ValueWarning")}</Warning>
          ) : (
            <Tip className="mt-2">{t("ClientSecret.PlainValueTip")}</Tip>
          )}
        </>
      )}

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
