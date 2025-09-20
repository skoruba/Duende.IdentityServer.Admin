import { DataTable } from "@/components/DataTable/DataTable";
import { ApiScopeEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApiScopesActions from "./ApiScopesActions";
import { ApiScopeData, ApiScopesData } from "@/models/ApiScopes/ApiScopeModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

type ApiScopesTableProps = {
  data: ApiScopesData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const ApiScopesTable = ({
  data,
  pagination,
  setPagination,
}: ApiScopesTableProps) => {
  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "name",
      header: t("ApiScopes.ApiScopeName"),
      cell: ({ row }: { row: { original: ApiScopeData } }) => {
        const scope = row.original;
        return (
          <Link
            to={ApiScopeEditUrl.replace(":scopeId", scope.id.toString())}
            className="underline"
          >
            {scope.name}
          </Link>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => <ApiScopesActions scope={row.original} />,
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

export default ApiScopesTable;
