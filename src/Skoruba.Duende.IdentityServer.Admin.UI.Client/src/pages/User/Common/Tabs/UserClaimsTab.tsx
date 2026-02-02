import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Trash, Tag } from "lucide-react";
import { DataTable } from "@/components/DataTable/DataTable";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import useModal from "@/hooks/modalHooks";
import {
  useUserClaims,
  useAddUserClaim,
  useDeleteUserClaim,
} from "@/services/UserServices";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import ClaimsModal from "@/components/Claims/ClaimsModal";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import Loading from "@/components/Loading/Loading";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

type Props = {
  userId: string;
};

const UserClaimsTab: React.FC<Props> = ({ userId }) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable(0, 5);
  const { isOpen, openModal, closeModal } = useModal();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);

  const { data, isLoading } = useUserClaims(
    userId,
    pagination.pageIndex,
    pagination.pageSize
  );
  const addMutation = useAddUserClaim(userId);
  const deleteMutation = useDeleteUserClaim(userId);

  const handleAddClaim = (input: { key: string; value: string }) => {
    addMutation.mutate(input, {
      onSuccess: () => {
        toast({
          description: t("Claim.Actions.Added"),
          title: t("Actions.Hooray"),
        });
        closeModal();
      },
    });
  };

  const openDeleteDialog = (claimId: number) => {
    setSelectedClaimId(claimId);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClaimId != null) {
      deleteMutation.mutate(selectedClaimId, {
        onSuccess: () => {
          toast({
            description: t("Claim.Actions.Deleted"),
            title: t("Actions.Hooray"),
          });
          setIsAlertOpen(false);
          setSelectedClaimId(null);
        },
      });
    }
  };

  const columns = [
    {
      accessorKey: "claimType",
      header: t("Claim.Key"),
    },
    {
      accessorKey: "claimValue",
      header: t("Claim.Value"),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: { claimId: number } } }) => (
        <Button
          variant="ghost"
          onClick={() => openDeleteDialog(row.original.claimId)}
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
    <CardWrapper
      title={t("User.Tabs.Claims")}
      description={t("User.Tabs.ClaimsDescription")}
      icon={Tag}
    >
      <Button onClick={openModal} className="mb-4" type="button">
        {t("Claim.Actions.Add")}
      </Button>

      <DataTable
        columns={columns}
        data={data?.claims ?? []}
        totalCount={data?.totalCount ?? 0}
        pagination={pagination}
        setPagination={setPagination}
      />

      <ClaimsModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleAddClaim}
      />

      <DeleteDialog
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        title={t("Claim.DeleteConfirmTitle")}
        message={t("Claim.DeleteConfirmDescription")}
        handleDelete={confirmDelete}
      />
    </CardWrapper>
  );
};

export default UserClaimsTab;
