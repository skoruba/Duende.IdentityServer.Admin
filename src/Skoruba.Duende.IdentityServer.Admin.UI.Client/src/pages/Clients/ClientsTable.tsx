import { DataTable } from "@/components/DataTable/DataTable";
import { ClientEditUrl } from "@/routing/Urls";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ClientActions from "./ClientsActions";
import {
  ClientsData,
  ClientTypeKey,
  ClientTypeLabel,
  type ClientData,
} from "@/models/Clients/ClientModels";
import { PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

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

  const columns: ColumnDef<ClientData, unknown>[] = [
    {
      accessorKey: "clientName",
      header: t("Clients.ClientName"),
      cell: ({ row }) => {
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
      cell: ({ row }) => {
        const client = row.original;
        return (
          <code className="bg-muted px-2 py-1 rounded">{client.clientId}</code>
        );
      },
    },
    {
      accessorKey: "clientType",
      header: t("Clients.ClientType"),
      cell: ({ row }) => {
        const client = row.original;

        const fullTypeValue = client.clientProperties?.find(
          (clientProperty) => clientProperty.key === ClientTypeKey
        )?.value;

        const typeKeys = Object.keys(ClientTypeLabel) as Array<
          keyof typeof ClientTypeLabel
        >;
        const typeKey =
          typeKeys.find((key) => ClientTypeLabel[key] === fullTypeValue) ??
          "Generic";
        const translationKey = `Client.ClientTypes.${typeKey}` as const;

        return (
          <Badge variant="outline">{t(translationKey)}</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ClientActions client={row.original} />,
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
