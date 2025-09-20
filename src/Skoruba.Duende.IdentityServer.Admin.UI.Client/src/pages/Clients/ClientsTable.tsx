import { DataTable } from "@/components/DataTable/DataTable";
import { ClientEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ClientActions from "./ClientsActions";
import {
  ClientsData,
  ClientTypeKey,
  ClientTypeLabel,
} from "@/models/Clients/ClientModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";

type ClientsTableProps = {
  data: ClientsData;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const ClientsTable = ({
  data,
  pagination,
  setPagination,
}: ClientsTableProps) => {
  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "clientName",
      header: t("Clients.ClientName"),
      cell: ({ row }: any) => {
        const client = row.original;
        return (
          <Link
            to={ClientEditUrl.replace(":clientId", client.id.toString())}
            className="underline"
          >
            {client.clientName}
          </Link>
        );
      },
    },
    {
      accessorKey: "clientId",
      header: t("Clients.ClientId"),
      cell: ({ row }: any) => {
        const client = row.original;
        return (
          <code className="bg-muted px-2 py-1 rounded">{client.clientId}</code>
        );
      },
    },
    {
      accessorKey: "clientType",
      header: t("Clients.ClientType"),
      cell: ({ row }: any) => {
        const client = row.original;

        const fullTypeValue = client.clientProperties?.find(
          (clientProperty: any) => clientProperty.key === ClientTypeKey
        )?.value;

        const typeEntry = Object.entries(ClientTypeLabel).find(
          ([, label]) => label === fullTypeValue
        );

        const typeKey = typeEntry?.[0] ?? "Generic";

        return (
          <Badge variant="outline">
            {t(`Client.ClientTypes.${typeKey}` as any)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => <ClientActions client={row.original} />,
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

export default ClientsTable;
