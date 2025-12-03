import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ApiScopesUrl } from "@/routing/Urls";
import ApiScopeForm from "../Common/ApiScopeForm";
import { defaultApiScopeFormData } from "../Common/ApiScopeSchema";
import { ApiScopeFormMode } from "../Edit/ApiScopeEdit";
import { ShieldCheck } from "lucide-react";

const ApiScopeCreate = () => {
  const { t } = useTranslation();

  return (
    <Page
      title={t("ApiScope.Create.PageTitle")}
      icon={ShieldCheck}
      accentKind="management"
      breadcrumb={
        <Breadcrumbs
          items={[
            { url: ApiScopesUrl, name: t("ApiScopes.PageTitle") },
            { name: t("ApiScope.Create.PageTitle") },
          ]}
        />
      }
    >
      <ApiScopeForm
        mode={ApiScopeFormMode.Create}
        defaultValues={defaultApiScopeFormData}
      />
    </Page>
  );
};

export default ApiScopeCreate;
