import React from "react";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getRoles } from "@/services/RoleService";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { PlusCircle, Search, Lock as LockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { RoleCreateUrl } from "@/routing/Urls";
import RolesTable from "./RolesTable";
import { queryKeys } from "@/services/QueryKeys";

const Roles: React.FC = () => {
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

  const roles = useQuery(
    [queryKeys.roles, pagination, searchTerm],
    () => getRoles(searchTerm, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={() => navigate(RoleCreateUrl)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("Roles.AddNewRole")}
      </Button>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("Roles.SearchPlaceholder")}
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
      title={t("Roles.PageTitle")}
      icon={LockIcon}
      accentKind="identity"
      topSection={headerActions}
    >
      {roles.isLoading ? (
        <Loading fullscreen />
      ) : (
        <RolesTable
          data={roles.data!}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </Page>
  );
};

export default Roles;
