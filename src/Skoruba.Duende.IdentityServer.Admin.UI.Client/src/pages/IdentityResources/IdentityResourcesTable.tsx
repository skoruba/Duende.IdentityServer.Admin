import { DataTable } from "@/components/DataTable/DataTable";
import { IdentityResourceEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import IdentityResourcesActions from "./IdentityResourcesActions";
import ScopeUsageButton from "@/components/ScopeUsage/ScopeUsageButton";
import { useScopeClientCounts } from "@/components/ScopeUsage/useScopeClientCounts";
import {
  IdentityResourceData,
  IdentityResourcesData,
} from "@/models/IdentityResources/IdentityResourceModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

type Props = {
  data: IdentityResourcesData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const IdentityResourcesTable = ({ data, pagination, setPagination }: Props) => {
  const { t } = useTranslation();
  const clientCounts = useScopeClientCounts(
    data.items.map((resource) => resource.name),
  );

  const columns = [
    {
      accessorKey: "name",
      header: t("IdentityResources.IdentityResourceName"),
      cell: ({ row }: { row: { original: IdentityResourceData } }) => {
        const resource = row.original;
        return (
          <Link
            to={IdentityResourceEditUrl.replace(
              ":resourceId",
              resource.id.toString()
            )}
            className="underline"
          >
            {resource.name}
          </Link>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: IdentityResourceData } }) => (
        <div className="flex items-center justify-end gap-2">
          <ScopeUsageButton
            scopeKind="identityResource"
            scopeId={row.original.id}
            scopeName={row.original.name}
            clientCount={clientCounts.data?.[row.original.name]}
          />
          <IdentityResourcesActions resource={row.original} />
        </div>
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

export default IdentityResourcesTable;
