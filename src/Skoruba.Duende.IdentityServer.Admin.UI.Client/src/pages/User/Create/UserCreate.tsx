import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { UsersUrl } from "@/routing/Urls";
import UserForm, { UserFormMode } from "../Common/UserForm";
import { defaultUserFormData } from "../Common/UserSchema";

const UserCreate = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("User.Create.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: UsersUrl, name: t("Users.PageTitle") },
          { name: t("User.Create.PageTitle") },
        ]}
      />
      <UserForm
        mode={UserFormMode.Create}
        defaultValues={defaultUserFormData}
      />
    </Page>
  );
};

export default UserCreate;
