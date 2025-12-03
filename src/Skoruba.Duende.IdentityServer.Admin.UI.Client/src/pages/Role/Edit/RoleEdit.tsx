import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { RolesUrl } from "@/routing/Urls";
import RoleForm, { RoleFormMode } from "../Common/RoleForm";
import { useQuery } from "react-query";
import { getRole } from "@/services/RoleService";
import { queryKeys } from "@/services/QueryKeys";
import { Lock } from "lucide-react";

const RoleEdit = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery([queryKeys.role, roleId], () =>
    getRole(roleId!)
  );

  if (isLoading || !data) {
    return <Loading fullscreen />;
  }

  return (
    <Page
      title={t("Role.Edit.PageTitle")}
      icon={Lock}
      accentKind="identity"
      breadcrumb={
        <Breadcrumbs
          items={[
            { url: RolesUrl, name: t("Roles.PageTitle") },
            { name: data.name },
          ]}
        />
      }
    >
      <RoleForm mode={RoleFormMode.Edit} roleId={roleId} defaultValues={data} />
    </Page>
  );
};

export default RoleEdit;
