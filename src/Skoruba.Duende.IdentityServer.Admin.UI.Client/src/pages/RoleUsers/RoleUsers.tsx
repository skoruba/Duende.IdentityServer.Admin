import React from "react";
import { useParams } from "react-router-dom";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getRole, getRoleUsers } from "@/services/RoleService";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import RoleUsersTable from "./RoleUsersTable";
import { queryKeys } from "@/services/QueryKeys";
import { RolesUrl } from "@/routing/Urls";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";
import { Button } from "@/components/ui/button";

const RoleUsers: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const { pagination, setPagination } = usePaginationTable();
  const { t } = useTranslation();

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

  const roleQuery = useQuery([queryKeys.role, roleId], () => getRole(roleId!), {
    enabled: !!roleId,
  });

  const users = useQuery(
    [queryKeys.roleUsers, roleId, pagination, searchTerm],
    () =>
      getRoleUsers(
        roleId!,
        searchTerm,
        pagination.pageIndex,
        pagination.pageSize
      ),
    {
      enabled: !!roleId,
      keepPreviousData: true,
    }
  );

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("Users.SearchPlaceholder")}
          className="pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      <Button variant="secondary" onClick={handleSearch}>
        {t("Actions.Search")}
      </Button>
    </div>
  );

  const title =
    roleQuery.isLoading || !roleQuery.data
      ? t("Role.Users.PageTitle")
      : `${t("Role.Users.PageTitle")} - ${roleQuery.data.name}`;

  return (
    <Page
      title={title}
      icon={Lock}
      accentKind="identity"
      breadcrumb={
        <Breadcrumbs
          items={[
            { url: RolesUrl, name: t("Roles.PageTitle") },
            { name: roleQuery.data?.name ?? "" },
          ]}
        />
      }
      topSection={headerActions}
    >
      {roleQuery.isLoading || users.isLoading ? (
        <Loading fullscreen />
      ) : (
        <RoleUsersTable
          data={users.data!}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </Page>
  );
};

export default RoleUsers;
