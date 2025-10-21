import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { IdentityResourcesUrl } from "@/routing/Urls";
import { useQuery } from "react-query";
import { getIdentityResource } from "@/services/IdentityResourceServices";
import IdentityResourceForm, {
  IdentityResourceFormMode,
} from "../Common/IdentityResourceForm";
import { queryKeys } from "@/services/QueryKeys";
import DeleteIdentityResourceDialog from "../Common/DeleteIdentityResourceDialog";
import useModal from "@/hooks/modalHooks";
import { useCallback, useState } from "react";

const IdentityResourceEdit = () => {
  const { t } = useTranslation();
  const { resourceId } = useParams<{ resourceId: string }>();
  const deleteModal = useModal();
  const [navigateWithBlocker, setNavigateWithBlocker] = useState<
    (to: string) => void
  >(() => () => {});

  const { data: identityResourceData, isLoading } = useQuery(
    [queryKeys.identityResource, resourceId],
    () => getIdentityResource(Number(resourceId))
  );

  const onIdentityResourceDelete = useCallback(() => {
    deleteModal.openModal();
  }, [deleteModal]);

  if (isLoading || !identityResourceData) {
    return <Loading fullscreen />;
  }

  return (
    <Page title={t("IdentityResource.Edit.PageTitle")}>
      <Breadcrumbs
        items={[
          { url: IdentityResourcesUrl, name: t("IdentityResources.PageTitle") },
          { name: identityResourceData.name },
        ]}
      />

      <IdentityResourceForm
        mode={IdentityResourceFormMode.Edit}
        resourceId={resourceId}
        defaultValues={identityResourceData}
        onIdentityResourceDelete={onIdentityResourceDelete}
        setNavigateWithBlocker={setNavigateWithBlocker}
      />

      <DeleteIdentityResourceDialog
        identityResourceId={Number(resourceId)}
        identityResourceName={identityResourceData.name}
        modal={deleteModal}
        onIdentityResourceDeleted={() => {
          deleteModal.closeModal();
          navigateWithBlocker(IdentityResourcesUrl);
        }}
      />
    </Page>
  );
};

export default IdentityResourceEdit;
