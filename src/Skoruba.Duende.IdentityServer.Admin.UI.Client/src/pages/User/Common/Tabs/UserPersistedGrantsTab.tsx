import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { KeySquare, Trash } from "lucide-react";
import { DataTable } from "@/components/DataTable/DataTable";
import {
  useUserPersistedGrants,
  useDeletePersistedGrant,
  useDeleteAllPersistedGrantsForUser,
} from "@/services/UserServices";
import { toast } from "@/components/ui/use-toast";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import Loading from "@/components/Loading/Loading";
import { PersistedGrant } from "@/models/Users/UserModels";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import useModal from "@/hooks/modalHooks";
import { useState } from "react";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

type Props = {
  userId: string;
};

const UserPersistedGrantsTab: React.FC<Props> = ({ userId }) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const deleteModal = useModal();
  const deleteAllModal = useModal();

  const [grantToDelete, setGrantToDelete] = useState<PersistedGrant | null>(
    null
  );

  const { data, isLoading } = useUserPersistedGrants(
    userId,
    pagination.pageIndex,
    pagination.pageSize
  );
  const deleteMutation = useDeletePersistedGrant();
  const deleteAllMutation = useDeleteAllPersistedGrantsForUser();

  const openDeleteDialog = (grant: PersistedGrant) => {
    setGrantToDelete(grant);
    deleteModal.openModal();
  };

  const confirmDelete = () => {
    if (!grantToDelete) return;
    deleteMutation.mutate(grantToDelete.key, {
      onSuccess: () => {
        toast({
          title: t("Actions.Hooray"),
          description: t("User.PersistedGrants.Deleted"),
        });
        deleteModal.closeModal();
        setGrantToDelete(null);
      },
    });
  };

  const confirmDeleteAll = () => {
    deleteAllMutation.mutate(userId, {
      onSuccess: () => {
        toast({
          title: t("Actions.Hooray"),
          description: t("User.PersistedGrants.DeletedAll"),
        });
        deleteAllModal.closeModal();
      },
    });
  };

  const columns = [
    {
      accessorKey: "type",
      header: t("User.PersistedGrants.Type"),
    },
    {
      accessorKey: "clientId",
      header: t("User.PersistedGrants.ClientId"),
    },
    {
      accessorKey: "creationTime",
      header: t("User.PersistedGrants.CreationTime"),
      cell: ({ row }: any) =>
        row.original.creationTime
          ? new Date(row.original.creationTime).toLocaleString()
          : "-",
    },
    {
      accessorKey: "expiration",
      header: t("User.PersistedGrants.Expiration"),
      cell: ({ row }: any) =>
        row.original.expiration
          ? new Date(row.original.expiration).toLocaleString()
          : "-",
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          type="button"
          variant="ghost"
          onClick={() => openDeleteDialog(row.original)}
          className="text-red-500"
          title={t("Actions.Delete")}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <CardWrapper
      title={t("User.Tabs.PersistedGrants")}
      description={t("User.Tabs.PersistedGrantsDescription")}
      icon={KeySquare}
    >
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          variant="destructive"
          onClick={deleteAllModal.openModal}
          disabled={(data?.persistedGrants?.length ?? 0) === 0}
        >
          <Trash className="h-4 w-4 mr-2" />
          {t("User.PersistedGrants.DeleteAllGrants")}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.persistedGrants ?? []}
        totalCount={data?.totalCount ?? 0}
        pagination={pagination}
        setPagination={setPagination}
      />

      <DeleteDialog
        isAlertOpen={deleteModal.isOpen}
        setIsAlertOpen={deleteModal.setValue}
        title={t("User.PersistedGrants.DeleteGrantTitle")}
        message={t("User.PersistedGrants.DeleteGrantConfirm")}
        handleDelete={confirmDelete}
      />

      <DeleteDialog
        isAlertOpen={deleteAllModal.isOpen}
        setIsAlertOpen={deleteAllModal.setValue}
        title={t("User.PersistedGrants.DeleteAllTitle")}
        message={t("User.PersistedGrants.DeleteAllConfirm")}
        handleDelete={confirmDeleteAll}
      />
    </CardWrapper>
  );
};

export default UserPersistedGrantsTab;
