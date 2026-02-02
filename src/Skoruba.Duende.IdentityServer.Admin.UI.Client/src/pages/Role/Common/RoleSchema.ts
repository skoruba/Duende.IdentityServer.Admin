import { z } from "zod";
import { t } from "i18next";

export const formSchema = z.object({
  name: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("Role.Section.Label.RoleName_Label"),
    })
  ),
});

export type RoleFormData = z.infer<typeof formSchema>;

export const defaultRoleFormData: RoleFormData = {
  name: "",
};
