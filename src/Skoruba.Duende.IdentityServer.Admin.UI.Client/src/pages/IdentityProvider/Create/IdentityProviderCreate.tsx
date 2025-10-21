import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { IdentityProvidersUrl } from "@/routing/Urls";
import IdentityProviderForm, {
  IdentityProviderFormMode,
} from "../Common/IdentityProviderForm";
import { defaultIdentityProviderFormData } from "../Common/IdentityProviderSchema";

const IdentityProviderCreate = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("IdentityProvider.Create.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: IdentityProvidersUrl, name: t("IdentityProviders.PageTitle") },
          { name: t("IdentityProvider.Create.PageTitle") },
        ]}
      />
      <IdentityProviderForm
        mode={IdentityProviderFormMode.Create}
        defaultValues={defaultIdentityProviderFormData}
      />
    </Page>
  );
};

export default IdentityProviderCreate;
