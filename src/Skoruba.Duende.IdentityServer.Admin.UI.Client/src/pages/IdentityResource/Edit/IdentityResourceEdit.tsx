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
import { Fingerprint } from "lucide-react";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import ResourceConfigurationIssues from "@/components/ConfigurationIssues/ResourceConfigurationIssues";

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

  const onIdentityResourceDeleted = useCallback(() => {
    deleteModal.closeModal();
    navigateWithBlocker(IdentityResourcesUrl);
  }, [deleteModal, navigateWithBlocker]);

  if (isLoading || !identityResourceData) {
    return <Loading fullscreen />;
  }

  return (
    <Page
      title={t("IdentityResource.Edit.PageTitle")}
      icon={Fingerprint}
      accentKind="management"
      breadcrumb={
        <Breadcrumbs
          items={[
            {
              url: IdentityResourcesUrl,
              name: t("IdentityResources.PageTitle"),
            },
            { name: identityResourceData.name },
          ]}
        />
      }
    >
      <DeleteIdentityResourceDialog
        identityResourceId={Number(resourceId)}
        identityResourceName={identityResourceData.name}
        modal={deleteModal}
        onIdentityResourceDeleted={onIdentityResourceDeleted}
      />

      <ResourceConfigurationIssues
        resourceId={Number(resourceId)}
        resourceType={client.ConfigurationResourceType.IdentityResource}
      />

      <IdentityResourceForm
        mode={IdentityResourceFormMode.Edit}
        resourceId={resourceId}
        defaultValues={identityResourceData}
        onIdentityResourceDelete={onIdentityResourceDelete}
        setNavigateWithBlocker={setNavigateWithBlocker}
      />
    </Page>
  );
};

export default IdentityResourceEdit;
