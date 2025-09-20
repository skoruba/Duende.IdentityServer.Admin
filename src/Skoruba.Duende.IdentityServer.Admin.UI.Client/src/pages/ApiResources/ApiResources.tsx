import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getApiResources } from "@/services/ApiResourceServices";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search } from "lucide-react";
import ApiResourcesTable from "./ApiResourcesTable";
import { Input } from "@/components/ui/input";
import { ApiResourceCreateUrl } from "@/routing/Urls";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "@/services/QueryKeys";

const ApiResources: React.FC = () => {
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

  const apiResources = useQuery(
    [queryKeys.apiResources, pagination, searchTerm],
    () =>
      getApiResources(searchTerm, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  return (
    <Page title={t("ApiResources.PageTitle")}>
      {apiResources.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <Button
              className="w-full md:w-auto"
              onClick={() => navigate(ApiResourceCreateUrl)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("ApiResources.AddNewApiResource")}
            </Button>
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder="Search by resource name or ID"
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
          <ApiResourcesTable
            data={apiResources.data!}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Page>
  );
};

export default ApiResources;
