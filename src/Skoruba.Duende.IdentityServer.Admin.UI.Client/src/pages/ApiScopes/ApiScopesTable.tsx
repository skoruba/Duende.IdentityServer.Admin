import { DataTable } from "@/components/DataTable/DataTable";
import { ApiScopeEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApiScopesActions from "./ApiScopesActions";
import ScopeUsageButton from "@/components/ScopeUsage/ScopeUsageButton";
import { useScopeClientCounts } from "@/components/ScopeUsage/useScopeClientCounts";
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
  const clientCounts = useScopeClientCounts(
    data.items.map((scope) => scope.name),
  );

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
      id: "usedBy",
      header: t("ScopeUsage.UsedBy"),
      cell: ({ row }: { row: { original: ApiScopeData } }) => (
        <ScopeUsageButton
          scopeKind="apiScope"
          scopeId={row.original.id}
          scopeName={row.original.name}
          clientCount={clientCounts.data?.[row.original.name]}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: ApiScopeData } }) => (
        <ApiScopesActions scope={row.original} />
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

export default ApiScopesTable;
