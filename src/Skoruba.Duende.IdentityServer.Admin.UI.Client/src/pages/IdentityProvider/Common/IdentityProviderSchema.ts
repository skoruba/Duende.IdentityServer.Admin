import { z } from "zod";
import { t } from "i18next";

export const IdentityProviderFormSchema = z.object({
  id: z.number().optional().default(0),
  scheme: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("IdentityProvider.Section.Label.Scheme_Label"),
    })
  ),
  displayName: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("IdentityProvider.Section.Label.DisplayName_Label"),
    })
  ),
  enabled: z.boolean(),
  type: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("IdentityProvider.Section.Label.ProtocolType_Label"),
    })
  ),
  properties: z
    .array(
      z.object({
        id: z.number().optional().default(0),
        key: z.string().min(
          1,
          t("Validation.FieldRequired", { field: t("Property.Key") })
        ),
        value: z.string().min(
          1,
          t("Validation.FieldRequired", { field: t("Property.Value") })
        ),
      })
    )
    .default([]),
});

export type IdentityProviderFormData = z.infer<
  typeof IdentityProviderFormSchema
>;

export const defaultIdentityProviderFormData: IdentityProviderFormData = {
  id: 0,
  scheme: "",
  displayName: "",
  enabled: true,
  type: "oidc",
  properties: [],
};
