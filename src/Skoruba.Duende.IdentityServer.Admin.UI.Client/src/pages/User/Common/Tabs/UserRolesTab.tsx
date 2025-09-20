import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { DataTable } from "@/components/DataTable/DataTable";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import useModal from "@/hooks/modalHooks";
import {
  useUserRoles,
  useAddUserRole,
  useDeleteUserRole,
} from "@/services/UserServices";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import RolesModal from "@/components/Roles/RolesModal";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import Loading from "@/components/Loading/Loading";

type Props = {
  userId: string;
};

const UserRolesTab: React.FC<Props> = ({ userId }) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable(0, 5);
  const { isOpen, openModal, closeModal } = useModal();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const { data, isLoading } = useUserRoles(
    userId,
    pagination.pageIndex,
    pagination.pageSize
  );
  const addMutation = useAddUserRole(userId);
  const deleteMutation = useDeleteUserRole(userId);

  const handleAddRole = (roleId: string) => {
    addMutation.mutate(roleId, {
      onSuccess: () => {
        toast({
          title: t("Actions.Hooray"),
          description: t("Role.Actions.Added"),
        });
        closeModal();
      },
    });
  };

  const openDeleteDialog = (roleId: string) => {
    setSelectedRoleId(roleId);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRoleId) {
      deleteMutation.mutate(selectedRoleId, {
        onSuccess: () => {
          toast({ title: t("Role.Actions.Deleted") });
          setIsAlertOpen(false);
          setSelectedRoleId(null);
        },
      });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: t("Role.Section.Label.RoleName_Label"),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          onClick={() => openDeleteDialog(row.original.id)}
          className="text-red-500"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Button onClick={openModal} className="mb-4" type="button">
        {t("Role.Actions.Add")}
      </Button>

      <DataTable
        columns={columns}
        data={data?.roles ?? []}
        totalCount={data?.totalCount ?? 0}
        pagination={pagination}
        setPagination={setPagination}
      />

      <RolesModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleAddRole}
      />

      <DeleteDialog
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        title={t("Role.DeleteConfirmTitle")}
        message={t("Role.DeleteConfirmDescription")}
        handleDelete={confirmDelete}
      />
    </>
  );
};

export default UserRolesTab;
