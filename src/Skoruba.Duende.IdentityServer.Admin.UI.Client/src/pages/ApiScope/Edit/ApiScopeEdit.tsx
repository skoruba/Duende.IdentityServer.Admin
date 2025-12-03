import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { ApiScopesUrl } from "@/routing/Urls";
import { useQuery } from "react-query";
import { getApiScope } from "@/services/ApiScopeServices";
import ApiScopeForm from "../Common/ApiScopeForm";
import { queryKeys } from "@/services/QueryKeys";
import DeleteApiScopeDialog from "../Common/DeleteApiScopeDialog";
import useModal from "@/hooks/modalHooks";
import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";

export enum ApiScopeFormMode {
  Create = "create",
  Edit = "edit",
}

const ApiScopeEdit = () => {
  const { t } = useTranslation();
  const { scopeId } = useParams<{ scopeId: string }>();
  const deleteModal = useModal();
  const [navigateWithBlocker, setNavigateWithBlocker] = useState<
    (to: string) => void
  >(() => () => {});

  const { data: scopeData, isLoading } = useQuery(
    [queryKeys.apiScope, scopeId],
    () => getApiScope(Number(scopeId))
  );

  const onApiScopeDeleted = useCallback(() => {
    navigateWithBlocker(ApiScopesUrl);
  }, [navigateWithBlocker]);

  const apiScopeDelete = useCallback(() => {
    deleteModal.openModal();
  }, [deleteModal]);

  if (isLoading || !scopeData) {
    return <Loading fullscreen />;
  }

  return (
    <Page
      title={t("ApiScope.Edit.PageTitle")}
      icon={ShieldCheck}
      accentKind="management"
      breadcrumb={
        <Breadcrumbs
          items={[
            { url: ApiScopesUrl, name: t("ApiScopes.PageTitle") },
            { name: scopeData.name },
          ]}
        />
      }
    >
      <DeleteApiScopeDialog
        apiScopeId={Number(scopeId)}
        apiScopeName={scopeData.name}
        modal={deleteModal}
        onApiScopeDeleted={onApiScopeDeleted}
      />
      <ApiScopeForm
        mode={ApiScopeFormMode.Edit}
        scopeId={scopeId}
        defaultValues={scopeData}
        apiScopeDelete={apiScopeDelete}
        setNavigateWithBlocker={setNavigateWithBlocker}
      />
    </Page>
  );
};

export default ApiScopeEdit;
