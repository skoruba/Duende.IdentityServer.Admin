import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { IdentityProvidersUrl } from "@/routing/Urls";
import IdentityProviderForm, {
  IdentityProviderFormMode,
} from "../Common/IdentityProviderForm";
import Loading from "@/components/Loading/Loading";
import { useIdentityProviderById } from "@/services/IdentityProviderService";
import { defaultIdentityProviderFormData } from "../Common/IdentityProviderSchema";
import { KeyRound } from "lucide-react";

const IdentityProviderEdit = () => {
  const { t } = useTranslation();
  const { providerId } = useParams<{ providerId: string }>();

  const { data, isLoading } = useIdentityProviderById(Number(providerId));

  if (isLoading || !data) return <Loading fullscreen />;

  return (
    <Page
      title={t("IdentityProvider.Edit.PageTitle")}
      icon={KeyRound}
      accentKind="providers"
      breadcrumb={
        <Breadcrumbs
          items={[
            {
              url: IdentityProvidersUrl,
              name: t("IdentityProviders.PageTitle"),
            },
            { name: data.scheme },
          ]}
        />
      }
    >
      <IdentityProviderForm
        mode={IdentityProviderFormMode.Edit}
        defaultValues={data ?? defaultIdentityProviderFormData}
      />
    </Page>
  );
};

export default IdentityProviderEdit;
