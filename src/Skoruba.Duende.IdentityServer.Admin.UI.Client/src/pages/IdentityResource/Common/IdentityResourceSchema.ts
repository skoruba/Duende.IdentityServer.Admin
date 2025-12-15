import { TFunction } from "i18next";
import { z } from "zod";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const DualListTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const baseIdentityResourceSchema = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean(),
  showInDiscoveryDocument: z.boolean(),
  required: z.boolean(),
  emphasize: z.boolean(),
  userClaims: z.array(DualListTypeSchema).optional(),
});

export const createIdentityResourceSchema = (t: TFunction) =>
  baseIdentityResourceSchema.extend({
    name: z.string().min(1, {
      message: t("Validation.FieldRequired", {
        field: t("IdentityResource.Section.Label.Name_Label"),
      }),
    }),
  });

export type IdentityResourceFormData = z.infer<typeof baseIdentityResourceSchema>;

export const defaultIdentityResourceFormData: IdentityResourceFormData = {
  name: "",
  displayName: undefined,
  description: undefined,
  enabled: true,
  showInDiscoveryDocument: true,
  required: false,
  emphasize: false,
  userClaims: [],
};

export const mapIdentityResourceToFormData = (
  data: client.IIdentityResourceApiDto
): IdentityResourceFormData => ({
  name: data.name,
  displayName: data.displayName ?? defaultIdentityResourceFormData.displayName,
  description: data.description ?? defaultIdentityResourceFormData.description,
  enabled: data.enabled ?? defaultIdentityResourceFormData.enabled,
  showInDiscoveryDocument:
    data.showInDiscoveryDocument ??
    defaultIdentityResourceFormData.showInDiscoveryDocument,
  required: data.required ?? defaultIdentityResourceFormData.required,
  emphasize: data.emphasize ?? defaultIdentityResourceFormData.emphasize,
  userClaims:
    data.userClaims?.map((claim) => ({ id: claim, label: claim })) ??
    defaultIdentityResourceFormData.userClaims,
});

export const mapFormDataToIdentityResource = (
  id: number,
  data: IdentityResourceFormData
): client.IIdentityResourceApiDto => ({
  id,
  name: data.name,
  displayName: data.displayName,
  description: data.description,
  enabled: data.enabled,
  showInDiscoveryDocument: data.showInDiscoveryDocument,
  required: data.required,
  emphasize: data.emphasize,
  userClaims: data.userClaims?.map((c) => c.id) ?? [],
});
