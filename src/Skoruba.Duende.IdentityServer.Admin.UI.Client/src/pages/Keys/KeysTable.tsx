import { DataTable } from "@/components/DataTable/DataTable";
import Loading from "@/components/Loading/Loading";
import { useTranslation } from "react-i18next";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { useKeys } from "@/services/KeyServices";
import { KeyApiDto } from "@/models/Keys/KeysModel";
import KeysActions from "./KeysActions";

const KeysTable: React.FC = () => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const { data, isLoading } = useKeys(
    pagination.pageIndex,
    pagination.pageSize
  );

  const columns = [
    {
      accessorKey: "algorithm",
      header: t("Keys.Section.Label.Algorithm_Label"),
    },
    {
      accessorKey: "use",
      header: t("Keys.Section.Label.Use_Label"),
    },
    {
      accessorKey: "created",
      header: t("Keys.Section.Label.Created_Label"),
      cell: ({ row }: { row: { original: KeyApiDto } }) =>
        new Date(row.original.created).toLocaleString(),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: KeyApiDto } }) => (
        <KeysActions keyId={row.original.id} />
      ),
    },
  ];

  if (isLoading) return <Loading fullscreen />;

  return (
    <DataTable
      columns={columns}
      data={data?.keys ?? []}
      totalCount={data?.totalCount ?? 0}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default KeysTable;
