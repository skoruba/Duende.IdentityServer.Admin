import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ApiResourcesUrl } from "@/routing/Urls";
import { useApiResource } from "@/services/ApiResourceServices";
import ApiResourceForm, {
  ApiResourceFormMode,
} from "../Common/ApiResourceForm";
import { useCallback, useState } from "react";
import DeleteApiResourceDialog from "../Common/DeleteApiResourceDialog";
import useModal from "@/hooks/modalHooks";

const ApiResourceEdit = () => {
  const { t } = useTranslation();
  const deleteModal = useModal();
  const { resourceId } = useParams<{ resourceId: string }>();

  const [navigateWithBlocker, setNavigateWithBlocker] = useState<
    (to: string) => void
  >(() => () => {});

  const onApiResourceDelete = useCallback(() => {
    deleteModal.openModal();
  }, [deleteModal]);

  const onApiResourceDeleted = useCallback(() => {
    deleteModal.closeModal();
    navigateWithBlocker(ApiResourcesUrl);
  }, [deleteModal, navigateWithBlocker]);

  const { data: resourceData, isLoading } = useApiResource(Number(resourceId));

  if (isLoading || !resourceData) {
    return <Loading fullscreen />;
  }

  return (
    <Page title={t("ApiResource.Edit.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: ApiResourcesUrl, name: t("ApiResources.PageTitle") },
          { name: resourceData.name },
        ]}
      />
      <DeleteApiResourceDialog
        apiResourceId={Number(resourceId)}
        apiResourceName={resourceData.name}
        modal={deleteModal}
        onApiResourceDeleted={onApiResourceDeleted}
      />
      <ApiResourceForm
        mode={ApiResourceFormMode.Edit}
        resourceId={resourceId}
        defaultValues={resourceData}
        onApiResourceDelete={onApiResourceDelete}
        setNavigateWithBlocker={setNavigateWithBlocker}
      />
    </Page>
  );
};

export default ApiResourceEdit;
