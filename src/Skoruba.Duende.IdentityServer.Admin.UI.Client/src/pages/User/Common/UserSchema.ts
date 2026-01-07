import { z } from "zod";
import { t } from "i18next";

export const formSchema = z.object({
  userName: z.string().min(
    1,
    t("Validation.FieldRequired", {
      field: t("User.Section.Label.UserUserName_Label"),
    })
  ),
  email: z.string().email(t("Validation.InvalidEmail")),
  emailConfirmed: z.boolean().optional(),
  phoneNumber: z.string().optional(),
  phoneNumberConfirmed: z.boolean().optional(),
  lockoutEnabled: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  accessFailedCount: z.number().optional(),
  lockoutEndDate: z.date().nullable().optional(),
  lockoutEndTime: z.string().nullable().optional(),
});

export type UserFormData = z.infer<typeof formSchema>;

export const defaultUserFormData: UserFormData = {
  userName: "",
  email: "",
  emailConfirmed: false,
  phoneNumber: "",
  phoneNumberConfirmed: false,
  lockoutEnabled: false,
  twoFactorEnabled: false,
  accessFailedCount: 0,
  lockoutEndDate: null,
  lockoutEndTime: null,
};
