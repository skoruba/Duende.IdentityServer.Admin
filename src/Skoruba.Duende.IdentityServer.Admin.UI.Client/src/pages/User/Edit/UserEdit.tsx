import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { UsersUrl } from "@/routing/Urls";
import { useQuery } from "react-query";
import { getUser } from "@/services/UserServices";
import UserForm, { UserFormMode } from "../Common/UserForm";
import { queryKeys } from "@/services/QueryKeys";

const UserEdit = () => {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery([queryKeys.user, userId], () =>
    getUser(userId!)
  );

  if (isLoading || !data) {
    return <Loading fullscreen />;
  }

  return (
    <Page title={t("User.Edit.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: UsersUrl, name: t("Users.PageTitle") },
          { name: data.userName },
        ]}
      />
      <UserForm mode={UserFormMode.Edit} userId={userId} defaultValues={data} />
    </Page>
  );
};

export default UserEdit;
