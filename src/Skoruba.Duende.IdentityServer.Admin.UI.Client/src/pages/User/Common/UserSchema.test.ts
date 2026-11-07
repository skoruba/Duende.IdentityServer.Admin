import { describe, expect, it } from "vitest";
import { createFormSchema, defaultUserFormData } from "./UserSchema";

const withEmail = (email: string) => ({
  ...defaultUserFormData,
  userName: "user",
  email,
});

const emailIssues = (requireEmail: boolean, email: string) =>
  createFormSchema(requireEmail)
    .safeParse(withEmail(email))
    .error?.issues.filter((issue) => issue.path[0] === "email") ?? [];

describe("user formSchema", () => {
  it("requires an email when the Admin API requires a unique email", () => {
    expect(emailIssues(true, "")).toHaveLength(1);
    expect(emailIssues(true, "user@example.com")).toHaveLength(0);
  });

  it("accepts a user without an email when the email is optional", () => {
    expect(emailIssues(false, "")).toHaveLength(0);
    expect(emailIssues(false, "user@example.com")).toHaveLength(0);
  });

  it("rejects an invalid email in both cases", () => {
    expect(emailIssues(true, "not-an-email")).toHaveLength(1);
    expect(emailIssues(false, "not-an-email")).toHaveLength(1);
  });
});
