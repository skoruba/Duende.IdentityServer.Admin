import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getIdentityResources } from "@/services/IdentityResourceServices";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search, Fingerprint } from "lucide-react";
import IdentityResourcesTable from "./IdentityResourcesTable";
import { Input } from "@/components/ui/input";
import { IdentityResourceCreateUrl } from "@/routing/Urls";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";

const IdentityResources: React.FC = () => {
  const { pagination, setPagination } = usePaginationTable();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    inputValue,
    handleInputChange,
    handleSearch,
    handleInputKeyDown,
    searchTerm,
  } = useSearch({
    onSearchComplete: () => {
      setPagination({ ...pagination, pageIndex: 0 });
    },
  });

  const identityResources = useQuery(
    [queryKeys.identityResources, pagination, searchTerm],
    () =>
      getIdentityResources(
        searchTerm,
        pagination.pageIndex,
        pagination.pageSize
      ),
    { keepPreviousData: true }
  );

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={() => navigate(IdentityResourceCreateUrl)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("IdentityResources.AddNewIdentityResource")}
      </Button>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("IdentityResources.SearchPlaceholder")}
          className="pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <Button variant="secondary" onClick={handleSearch}>
        {t("Actions.Search")}
      </Button>
    </div>
  );

  return (
    <Page
      title={t("IdentityResources.PageTitle")}
      icon={Fingerprint}
      accentKind="management"
      topSection={headerActions}
    >
      {identityResources.isLoading ? (
        <Loading fullscreen />
      ) : identityResources.data ? (
        <IdentityResourcesTable
          data={identityResources.data}
          pagination={pagination}
          setPagination={setPagination}
        />
      ) : null}
    </Page>
  );
};

export default IdentityResources;
