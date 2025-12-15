import { TFunction } from "i18next";
import { z } from "zod";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const DualListTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const baseApiScopeSchema = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean(),
  showInDiscoveryDocument: z.boolean(),
  required: z.boolean(),
  emphasize: z.boolean(),
  userClaims: z.array(DualListTypeSchema).optional(),
});

export const createApiScopeSchema = (t: TFunction) =>
  baseApiScopeSchema.extend({
    name: z.string().min(1, {
      message: t("Validation.FieldRequired", {
        field: t("ApiScope.Section.Label.Name_Label"),
      }),
    }),
  });

export type ApiScopeFormData = z.infer<typeof baseApiScopeSchema>;

export const defaultApiScopeFormData: ApiScopeFormData = {
  name: "",
  displayName: undefined,
  description: undefined,
  enabled: true,
  showInDiscoveryDocument: true,
  required: false,
  emphasize: false,
  userClaims: [],
};

export const mapApiScopeToFormData = (
  data: client.IApiScopeApiDto
): ApiScopeFormData => ({
  name: data.name,
  displayName: data.displayName ?? defaultApiScopeFormData.displayName,
  description: data.description ?? defaultApiScopeFormData.description,
  enabled: data.enabled ?? defaultApiScopeFormData.enabled,
  showInDiscoveryDocument:
    data.showInDiscoveryDocument ??
    defaultApiScopeFormData.showInDiscoveryDocument,
  required: data.required ?? defaultApiScopeFormData.required,
  emphasize: data.emphasize ?? defaultApiScopeFormData.emphasize,
  userClaims:
    data.userClaims?.map((claim) => ({ id: claim, label: claim })) ?? [],
});

export const mapFormDataToApiScope = (
  id: number,
  data: ApiScopeFormData
): client.IApiScopeApiDto => ({
  id,
  name: data.name,
  displayName: data.displayName,
  description: data.description,
  enabled: data.enabled,
  showInDiscoveryDocument: data.showInDiscoveryDocument,
  required: data.required,
  emphasize: data.emphasize,
  userClaims: data.userClaims?.map((claim) => claim.id) ?? [],
  apiScopeProperties: undefined,
});
