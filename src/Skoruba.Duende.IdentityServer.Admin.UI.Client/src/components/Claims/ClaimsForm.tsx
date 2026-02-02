import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable/DataTable";
import { Trash } from "lucide-react";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import useModal from "@/hooks/modalHooks";
import { useTranslation } from "react-i18next";
import ClaimsModal from "./ClaimsModal";

type FormData = {
  claims: Array<{
    id: number;
    key: string;
    value: string;
  }>;
};

const ClaimsForm = () => {
  const { isOpen, openModal, closeModal } = useModal();

  const { control } = useFormContext<FormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "claims",
  });

  const { pagination, setPagination } = usePaginationTable(0, 5);

  const handleAddClaim = (data: { key: string; value: string }) => {
    append({ id: 0, key: data.key, value: data.value });
    closeModal();
  };

  const handleRemoveClaim = (index: number) => {
    remove(index);
    if (pagination.pageIndex > 0 && fields.length % pagination.pageSize === 1) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: prev.pageIndex - 1,
      }));
    }
  };

  const paginatedData = fields.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  const { t } = useTranslation();

  const columns = [
    {
      accessorKey: "key",
      header: t("Claim.Key"),
    },
    {
      accessorKey: "value",
      header: t("Claim.Value"),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { index: number } }) => (
        <Button
          variant="ghost"
          onClick={() =>
            handleRemoveClaim(
              pagination.pageIndex * pagination.pageSize + row.index
            )
          }
          className="text-red-500"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div>
        <Button
          type="button"
          onClick={() => {
            openModal();
          }}
          className="mb-4"
        >
          {t("Claim.Actions.Add")}
        </Button>

        <DataTable
          columns={columns}
          data={paginatedData}
          totalCount={fields.length}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>

      <ClaimsModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleAddClaim}
      />
    </>
  );
};

export default ClaimsForm;
