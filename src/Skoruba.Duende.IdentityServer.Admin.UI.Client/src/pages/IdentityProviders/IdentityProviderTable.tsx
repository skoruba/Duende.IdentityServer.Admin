import { DataTable } from "@/components/DataTable/DataTable";
import Loading from "@/components/Loading/Loading";
import { useTranslation } from "react-i18next";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useIdentityProviders } from "@/services/IdentityProviderService";
import { IdentityProviderEditUrl } from "@/routing/Urls";
import { IdentityProviderModel } from "@/models/IdentityProviders/IdentityProviderModel";
import IdentityProvidersActions from "./IdentityProvidersActions";
import { Link } from "react-router-dom";

type Props = {
  searchTerm: string;
};

const IdentityProvidersTable: React.FC<Props> = ({ searchTerm }) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const { data, isLoading } = useIdentityProviders(
    searchTerm,
    pagination.pageIndex,
    pagination.pageSize
  );

  const columns = [
    {
      accessorKey: "scheme",
      header: t("IdentityProvider.Section.Label.Scheme_Label"),
      cell: ({ row }: { row: { original: IdentityProviderModel } }) => (
        <Link
          to={IdentityProviderEditUrl.replace(
            ":providerId",
            row.original.id.toString()
          )}
          className="underline"
        >
          {row.original.scheme}
        </Link>
      ),
    },
    {
      accessorKey: "displayName",
      header: t("IdentityProvider.Section.Label.DisplayName_Label"),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: IdentityProviderModel } }) => (
        <IdentityProvidersActions provider={row.original} />
      ),
    },
  ];

  if (isLoading) return <Loading fullscreen />;

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      totalCount={data?.totalCount ?? 0}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default IdentityProvidersTable;
