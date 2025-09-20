import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getApiScopes } from "@/services/ApiScopeServices";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search } from "lucide-react";
import ApiScopesTable from "./ApiScopesTable";
import { Input } from "@/components/ui/input";
import { ApiScopeCreateUrl } from "@/routing/Urls";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";

const ApiScopes: React.FC = () => {
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

  const apiScopes = useQuery(
    [queryKeys.apiScopes, pagination, searchTerm],
    () => getApiScopes(searchTerm, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  return (
    <Page title={t("ApiScopes.PageTitle")}>
      {apiScopes.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate(ApiScopeCreateUrl)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("ApiScopes.AddNewApiScope")}
            </Button>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={t("ApiScopes.SearchPlaceholder")}
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
          <ApiScopesTable
            data={apiScopes.data!}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Page>
  );
};

export default ApiScopes;
