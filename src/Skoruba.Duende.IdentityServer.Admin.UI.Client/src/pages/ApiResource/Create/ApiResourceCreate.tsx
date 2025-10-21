import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ApiResourcesUrl } from "@/routing/Urls";
import ApiResourceForm, {
  ApiResourceFormMode,
} from "../Common/ApiResourceForm";
import { defaultApiResourceFormData } from "../Common/ApiResourceSchema";

const ApiResourceCreate = () => {
  const { t } = useTranslation();

  return (
    <Page title={t("ApiResource.Create.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: ApiResourcesUrl, name: t("ApiResources.PageTitle") },
          { name: t("ApiResource.Create.PageTitle") },
        ]}
      />
      <ApiResourceForm
        mode={ApiResourceFormMode.Create}
        defaultValues={defaultApiResourceFormData}
      />
    </Page>
  );
};

export default ApiResourceCreate;
