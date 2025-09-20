import { z } from "zod";

export const IdentityProviderFormSchema = z.object({
  id: z.number().optional().default(0),
  scheme: z.string().min(1, "Scheme is required"),
  displayName: z.string().optional().nullable(),
  enabled: z.boolean(),
  type: z.string().optional(),
  properties: z
    .array(
      z.object({
        id: z.number().optional().default(0),
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
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
  displayName: undefined,
  enabled: true,
  type: "oidc",
  properties: [],
};
