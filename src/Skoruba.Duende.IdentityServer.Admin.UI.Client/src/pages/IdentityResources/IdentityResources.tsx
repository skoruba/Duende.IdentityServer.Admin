import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getIdentityResources } from "@/services/IdentityResourceServices";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search } from "lucide-react";
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

  return (
    <Page title={t("IdentityResources.PageTitle")}>
      {identityResources.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate(IdentityResourceCreateUrl)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("IdentityResources.AddNewIdentityResource")}
            </Button>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={t("IdentityResources.SearchPlaceholder")}
                className="w-full pr-10"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <Button className="w-full md:w-auto" onClick={handleSearch}>
              {t("Actions.Search")}
            </Button>
          </div>
          <IdentityResourcesTable
            data={identityResources.data!}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Page>
  );
};

export default IdentityResources;
