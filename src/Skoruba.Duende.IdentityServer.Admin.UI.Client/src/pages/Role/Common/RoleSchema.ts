import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Role name is required"),
});

export type RoleFormData = z.infer<typeof formSchema>;

export const defaultRoleFormData: RoleFormData = {
  name: "",
};
