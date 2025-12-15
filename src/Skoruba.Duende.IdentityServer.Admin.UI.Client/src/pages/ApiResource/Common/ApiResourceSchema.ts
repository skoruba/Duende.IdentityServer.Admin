import { IApiResourceApiDto } from "@skoruba/duende.identityserver.admin.api.client/dist/types/client";
import { TFunction } from "i18next";
import { z } from "zod";

const DualListTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

const baseApiResourceSchema = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  description: z.string().optional(),
  showInDiscoveryDocument: z.boolean(),
  enabled: z.boolean(),
  requireResourceIndicator: z.boolean(),
  allowedAccessTokenSigningAlgorithms: z.array(z.string()).optional(),
  userClaims: z.array(DualListTypeSchema).optional(),
  scopes: z.array(DualListTypeSchema).optional(),
});

export const createApiResourceSchema = (t: TFunction) =>
  baseApiResourceSchema.extend({
    name: z.string().min(1, {
      message: t("Validation.FieldRequired", {
        field: t("ApiResource.Section.Label.Name_Label"),
      }),
    }),
  });

export type ApiResourceFormData = z.infer<typeof baseApiResourceSchema>;

export const defaultApiResourceFormData: ApiResourceFormData = {
  name: "",
  displayName: undefined,
  description: undefined,
  showInDiscoveryDocument: true,
  enabled: true,
  requireResourceIndicator: false,
  allowedAccessTokenSigningAlgorithms: [],
  userClaims: [],
  scopes: [],
};

export const mapApiResourceToFormData = (
  data: IApiResourceApiDto
): ApiResourceFormData => ({
  name: data.name,
  displayName: data.displayName ?? defaultApiResourceFormData.displayName,
  description: data.description ?? defaultApiResourceFormData.description,
  showInDiscoveryDocument:
    data.showInDiscoveryDocument ??
    defaultApiResourceFormData.showInDiscoveryDocument,
  enabled: data.enabled ?? defaultApiResourceFormData.enabled,
  requireResourceIndicator:
    data.requireResourceIndicator ??
    defaultApiResourceFormData.requireResourceIndicator,
  allowedAccessTokenSigningAlgorithms:
    data.allowedAccessTokenSigningAlgorithms || [],
  userClaims:
    data.userClaims?.map((claim) => ({ id: claim, label: claim })) || [],
  scopes: data.scopes?.map((scope) => ({ id: scope, label: scope })) || [],
});

export const mapFormDataToApiResource = (
  id: number,
  data: ApiResourceFormData
): IApiResourceApiDto => ({
  name: data.name,
  displayName: data.displayName,
  description: data.description,
  showInDiscoveryDocument: data.showInDiscoveryDocument,
  enabled: data.enabled,
  requireResourceIndicator: data.requireResourceIndicator,
  allowedAccessTokenSigningAlgorithms: data.allowedAccessTokenSigningAlgorithms,
  userClaims: (data.userClaims ?? []).map((claim) => claim.id),
  scopes: (data.scopes ?? []).map((scope) => scope.id),
  id: id,
});
