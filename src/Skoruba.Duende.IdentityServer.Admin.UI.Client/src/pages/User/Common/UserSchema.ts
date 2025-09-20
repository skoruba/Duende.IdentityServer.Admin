import { z } from "zod";

export const formSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  email: z.string().email("Invalid email"),
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
