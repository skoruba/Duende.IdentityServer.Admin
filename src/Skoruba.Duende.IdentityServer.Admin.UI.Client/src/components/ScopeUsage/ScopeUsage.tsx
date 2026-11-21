import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DataTable } from "@/components/DataTable/DataTable";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import Loading from "@/components/Loading/Loading";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiResourceEditUrl, ClientEditUrl } from "@/routing/Urls";
import { queryKeys, queryWithoutCache } from "@/services/QueryKeys";
import {
  getApiScopeApiResources,
  getApiScopeClients,
} from "@/services/ApiScopeServices";
import { getIdentityResourceClients } from "@/services/IdentityResourceServices";
import { ScopeClientData } from "@/models/Clients/ClientModels";
import { ScopeApiResourceData } from "@/models/ApiResources/ApiResourceModels";

export type ScopeKind = "apiScope" | "identityResource";

type PagedData<TData> = { items: TData[]; totalCount: number };

const useScopeUsageQuery = <TData,>(
  queryKey: unknown[],
  getPage: (pageIndex: number, pageSize: number) => Promise<PagedData<TData>>,
  enabled = true,
) => {
  const { pagination, setPagination } = usePaginationTable();

  const query = useQuery({
    queryKey: [...queryKey, pagination],
    queryFn: () => getPage(pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
    enabled,
    ...queryWithoutCache,
  });

  return { query, pagination, setPagination };
};

type ScopeUsageTableProps<TData> = {
  data?: PagedData<TData>;
  isLoading: boolean;
  emptyMessage: string;
  columns: ColumnDef<TData, unknown>[];
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
};

const ScopeUsageTable = <TData,>({
  data,
  isLoading,
  emptyMessage,
  columns,
  pagination,
  setPagination,
}: ScopeUsageTableProps<TData>) => {
  if (isLoading) return <Loading />;

  if (data?.totalCount === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      totalCount={data?.totalCount ?? -1}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

const CountBadge = ({ count }: { count?: number }) =>
  count === undefined ? null : (
    <Badge variant="secondary" className="ml-2 px-1.5 py-0">
      {count}
    </Badge>
  );

const DisabledBadge = () => {
  const { t } = useTranslation();

  return (
    <Badge variant="outline" className="ml-2 text-muted-foreground">
      {t("ScopeUsage.Disabled")}
    </Badge>
  );
};

type ScopeUsageProps = {
  scopeKind: ScopeKind;
  scopeId: number;
};

export const ScopeUsage = ({ scopeKind, scopeId }: ScopeUsageProps) => {
  const { t } = useTranslation();
  const isApiScope = scopeKind === "apiScope";

  const clients = useScopeUsageQuery(
    [
      isApiScope ? queryKeys.apiScopeClients : queryKeys.identityResourceClients,
      scopeId,
    ],
    (pageIndex, pageSize) =>
      isApiScope
        ? getApiScopeClients(scopeId, pageIndex, pageSize)
        : getIdentityResourceClients(scopeId, pageIndex, pageSize),
  );

  const apiResources = useScopeUsageQuery(
    [queryKeys.apiScopeApiResources, scopeId],
    (pageIndex, pageSize) =>
      getApiScopeApiResources(scopeId, pageIndex, pageSize),
    isApiScope,
  );

  const clientColumns: ColumnDef<ScopeClientData, unknown>[] = [
    {
      accessorKey: "clientName",
      header: t("Clients.ClientName"),
      cell: ({ row }) => {
        const scopeClient = row.original;
        return (
          <>
            <Link
              to={ClientEditUrl.replace(":clientId", scopeClient.id.toString())}
              className="underline"
            >
              {scopeClient.clientName || scopeClient.clientId}
            </Link>
            {!scopeClient.enabled && <DisabledBadge />}
          </>
        );
      },
    },
    {
      accessorKey: "clientId",
      header: t("Clients.ClientId"),
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-1 rounded">
          {row.original.clientId}
        </code>
      ),
    },
  ];

  const apiResourceColumns: ColumnDef<ScopeApiResourceData, unknown>[] = [
    {
      accessorKey: "name",
      header: t("ApiResources.ApiResourceName"),
      cell: ({ row }) => {
        const apiResource = row.original;
        return (
          <>
            <Link
              to={ApiResourceEditUrl.replace(
                ":resourceId",
                apiResource.id.toString(),
              )}
              className="underline"
            >
              {apiResource.name}
            </Link>
            {!apiResource.enabled && <DisabledBadge />}
          </>
        );
      },
    },
    {
      accessorKey: "displayName",
      header: t("ScopeUsage.DisplayName"),
    },
  ];

  return (
    <Tabs defaultValue="clients" className="w-full">
      <TabsList>
        <TabsTrigger value="clients">
          {t("ScopeUsage.Clients")}
          <CountBadge count={clients.query.data?.totalCount} />
        </TabsTrigger>
        {isApiScope && (
          <TabsTrigger value="apiResources">
            {t("ScopeUsage.ApiResources")}
            <CountBadge count={apiResources.query.data?.totalCount} />
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="clients">
        <ScopeUsageTable
          data={clients.query.data}
          isLoading={clients.query.isLoading}
          emptyMessage={t(
            isApiScope
              ? "ScopeUsage.NoClientsApiScope"
              : "ScopeUsage.NoClientsIdentityResource",
          )}
          columns={clientColumns}
          pagination={clients.pagination}
          setPagination={clients.setPagination}
        />
      </TabsContent>
      {isApiScope && (
        <TabsContent value="apiResources">
          <ScopeUsageTable
            data={apiResources.query.data}
            isLoading={apiResources.query.isLoading}
            emptyMessage={t("ScopeUsage.NoApiResources")}
            columns={apiResourceColumns}
            pagination={apiResources.pagination}
            setPagination={apiResources.setPagination}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};
