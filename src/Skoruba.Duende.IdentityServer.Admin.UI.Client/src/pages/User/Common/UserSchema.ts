import { z } from "zod";
import { t } from "i18next";

const emailField = (requireEmail: boolean) => {
  const email = z.email(t("Validation.InvalidEmail"));

  return requireEmail
    ? z
        .string()
        .min(
          1,
          t("Validation.FieldRequired", {
            field: t("User.Section.Label.UserEmail_Label"),
          })
        )
        .pipe(email)
    : email.or(z.literal(""));
};

export const createFormSchema = (requireEmail: boolean) =>
  z.object({
    userName: z.string().min(
      1,
      t("Validation.FieldRequired", {
        field: t("User.Section.Label.UserUserName_Label"),
      })
    ),
    email: emailField(requireEmail),
    emailConfirmed: z.boolean().optional(),
    phoneNumber: z.string().optional(),
    phoneNumberConfirmed: z.boolean().optional(),
    lockoutEnabled: z.boolean().optional(),
    twoFactorEnabled: z.boolean().optional(),
    accessFailedCount: z.number().optional(),
    lockoutEndDate: z.date().nullable().optional(),
    lockoutEndTime: z.string().nullable().optional(),
    lockoutEnd: z.date().nullable().optional(),
  });

export const formSchema = createFormSchema(true);

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
  lockoutEnd: null,
};
