import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { IdentityResourcesUrl } from "@/routing/Urls";
import IdentityResourceForm, {
  IdentityResourceFormMode,
} from "../Common/IdentityResourceForm";
import { defaultIdentityResourceFormData } from "../Common/IdentityResourceSchema";

const IdentityResourceCreate = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("IdentityResource.Create.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: IdentityResourcesUrl, name: t("IdentityResources.PageTitle") },
          { name: t("IdentityResource.Create.PageTitle") },
        ]}
      />
      <IdentityResourceForm
        mode={IdentityResourceFormMode.Create}
        defaultValues={defaultIdentityResourceFormData}
      />
    </Page>
  );
};

export default IdentityResourceCreate;
