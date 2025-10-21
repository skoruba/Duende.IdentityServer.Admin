import React from "react";
import { useParams } from "react-router-dom";
import useSearch from "@/hooks/useSearch";
import { useQuery } from "react-query";
import { getRole, getRoleUsers } from "@/services/RoleService";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import RoleUsersTable from "./RoleUsersTable";
import { queryKeys } from "@/services/QueryKeys";
import { RolesUrl } from "@/routing/Urls";
import { Breadcrumbs } from "@/components/Breadcrumbs/Breadcrumbs";

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

  return (
    <Page
      title={
        roleQuery.isLoading
          ? t("Role.Users.PageTitle")
          : `${t("Role.Users.PageTitle")} - ${roleQuery.data?.name ?? ""}`
      }
    >
      <Breadcrumbs
        items={[
          { url: RolesUrl, name: t("Roles.PageTitle") },
          { name: roleQuery.data?.name ?? "" },
        ]}
      />

      {roleQuery.isLoading || users.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex-grow relative">
              <Input
                type="text"
                placeholder={t("Users.SearchPlaceholder")}
                className="w-full pr-10"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="button"
              className="btn btn-secondary w-full md:w-auto"
              onClick={handleSearch}
            >
              {t("Actions.Search")}
            </button>
          </div>
          <RoleUsersTable
            data={users.data!}
            pagination={pagination}
            setPagination={setPagination}
          />
        </>
      )}
    </Page>
  );
};

export default RoleUsers;
