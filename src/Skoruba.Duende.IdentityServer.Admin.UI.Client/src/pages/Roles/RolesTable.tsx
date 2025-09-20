import { DataTable } from "@/components/DataTable/DataTable";
import { useTranslation } from "react-i18next";
import { RoleData, RolesData } from "@/models/Roles/RoleModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import RolesActions from "./RolesActions";
import { RoleEditUrl, RoleUsersUrl } from "@/routing/Urls";
import { Link, useNavigate } from "react-router-dom";
import { Users2 } from "lucide-react"; // lucide user icon
import { Button } from "@/components/ui/button";

type RolesTableProps = {
  data: RolesData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const RolesTable = ({ data, pagination, setPagination }: RolesTableProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "name",
      header: t("Role.Section.Label.RoleName_Label"),
      cell: ({ row }: { row: { original: RoleData } }) => {
        const role = row.original;
        return (
          <Link
            to={RoleEditUrl.replace(":roleId", role.id.toString())}
            className="underline"
          >
            {role.name}
          </Link>
        );
      },
    },
    {
      id: "users",
      header: t("Role.Users.UsersInRole"),
      cell: ({ row }: { row: { original: RoleData } }) => {
        const role = row.original;
        return (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              navigate(RoleUsersUrl.replace(":roleId", role.id.toString()));
            }}
          >
            <Users2 className="h-4 w-4 me-1" />
            {t("Role.Users.UsersInRoleShow")}
          </Button>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: RoleData } }) => (
        <RolesActions role={row.original} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data.items}
      totalCount={data.totalCount}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default RolesTable;
