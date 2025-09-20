import { z } from "zod";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const DualListTypeSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const formSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean(),
  showInDiscoveryDocument: z.boolean(),
  required: z.boolean(),
  emphasize: z.boolean(),
  userClaims: z.array(DualListTypeSchema).optional(),
});

export type IdentityResourceFormData = z.infer<typeof formSchema>;

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
