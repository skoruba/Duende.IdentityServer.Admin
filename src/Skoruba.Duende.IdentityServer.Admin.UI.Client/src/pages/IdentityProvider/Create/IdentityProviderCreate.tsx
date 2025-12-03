import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { IdentityProvidersUrl } from "@/routing/Urls";
import IdentityProviderForm, {
  IdentityProviderFormMode,
} from "../Common/IdentityProviderForm";
import { defaultIdentityProviderFormData } from "../Common/IdentityProviderSchema";
import { KeyRound } from "lucide-react";

const IdentityProviderCreate = () => {
  const { t } = useTranslation();

  return (
    <Page
      title={t("IdentityProvider.Create.PageTitle")}
      icon={KeyRound}
      accentKind="providers"
      breadcrumb={
        <Breadcrumbs
          items={[
            {
              url: IdentityProvidersUrl,
              name: t("IdentityProviders.PageTitle"),
            },
            { name: t("IdentityProvider.Create.PageTitle") },
          ]}
        />
      }
    >
      <IdentityProviderForm
        mode={IdentityProviderFormMode.Create}
        defaultValues={defaultIdentityProviderFormData}
      />
    </Page>
  );
};

export default IdentityProviderCreate;
