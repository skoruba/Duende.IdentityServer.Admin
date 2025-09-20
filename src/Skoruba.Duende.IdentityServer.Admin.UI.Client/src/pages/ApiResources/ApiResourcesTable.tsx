import { DataTable } from "@/components/DataTable/DataTable";
import { ApiResourceEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ApiResourcesActions from "./ApiResourcesActions";
import {
  ApiResourceData,
  ApiResourcesData,
} from "@/models/ApiResources/ApiResourceModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

type ApiResourcesTableProps = {
  data: ApiResourcesData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const ApiResourcesTable = ({
  data,
  pagination,
  setPagination,
}: ApiResourcesTableProps) => {
  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "name",
      header: t("ApiResources.ApiResourceName"),
      cell: ({ row }: { row: { original: ApiResourceData } }) => {
        const resource = row.original;
        return (
          <Link
            to={ApiResourceEditUrl.replace(
              ":resourceId",
              resource.id.toString()
            )}
            className="underline"
          >
            {resource.apiResourceName}
          </Link>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => <ApiResourcesActions resource={row.original} />,
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

export default ApiResourcesTable;
