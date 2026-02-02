import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { RolesUrl } from "@/routing/Urls";
import RoleForm, { RoleFormMode } from "../Common/RoleForm";
import { defaultRoleFormData } from "../Common/RoleSchema";
import { Lock } from "lucide-react";

const RoleCreate = () => {
  const { t } = useTranslation();

  return (
    <Page
      title={t("Role.Create.PageTitle")}
      icon={Lock}
      accentKind="identity"
      breadcrumb={
        <Breadcrumbs
          items={[
            { url: RolesUrl, name: t("Roles.PageTitle") },
            { name: t("Role.Create.PageTitle") },
          ]}
        />
      }
    >
      <RoleForm
        mode={RoleFormMode.Create}
        defaultValues={defaultRoleFormData}
      />
    </Page>
  );
};

export default RoleCreate;
