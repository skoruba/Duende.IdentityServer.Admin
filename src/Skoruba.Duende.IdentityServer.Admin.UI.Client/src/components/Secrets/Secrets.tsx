import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable/DataTable";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading/Loading";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddSecretForm from "@/components/AddSecretForm/AddSecretForm";
import { SecretsFormData } from "@/components/SecretForm/SecretForm";
import { useTranslation } from "react-i18next";
import { SecretData, SecretsData } from "@/models/Common/CommonModels";
import {
  combineDateTimeForUnspecifiedDb,
  timeZoneDateFormat,
} from "@/helpers/DateTimeHelper";

type SecretsTableProps = {
  resourceId: number;
  queryKey: string[];
  getSecrets: (
    resourceId: number,
    pageIndex: number,
    pageSize: number
  ) => Promise<SecretsData>;
  addSecret: (resourceId: number, data: SecretsFormData) => Promise<void>;
  deleteSecret: (secretId: number) => Promise<void>;
};

const SecretsTable: React.FC<SecretsTableProps> = ({
  resourceId,
  queryKey,
  getSecrets,
  addSecret,
  deleteSecret,
}) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable(0, 5);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [secretToDelete, setSecretToDelete] = React.useState<SecretData | null>(
    null
  );

  const queryClient = useQueryClient();

  const secretsQuery = useQuery(
    [...queryKey, pagination],
    () => getSecrets(resourceId, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  const addMutation = useMutation(
    (data: SecretsFormData) => addSecret(resourceId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKey);
        setDialogOpen(false);
      },
    }
  );

  const deleteMutation = useMutation((id: number) => deleteSecret(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });

  const handleAddSecret = (data: SecretsFormData) => {
    const combinedExpiration = combineDateTimeForUnspecifiedDb(
      data.expiration,
      data.expirationTime
    );

    addMutation.mutate({
      ...data,
      expiration: data.addExpiration ? combinedExpiration : null,
    });
  };

  const columns: ColumnDef<SecretData>[] = [
    {
      accessorKey: "type",
      header: t("Client.Label.SecretType_Label"),
    },
    {
      accessorKey: "description",
      header: t("Client.Label.SecretDescription_Label"),
    },
    {
      accessorKey: "expiration",
      header: t("Client.Label.ClientSecret_ExpirationDate"),
      cell: ({ row }) => (
        <span>
          {row.original.expiration
            ? format(new Date(row.original.expiration), timeZoneDateFormat)
            : null}
        </span>
      ),
    },
    {
      accessorKey: "created",
      header: t("Client.Label.ClientSecret_Created"),
      cell: ({ row }) => (
        <span>
          {format(new Date(row.original?.created), timeZoneDateFormat)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          onClick={() => setSecretToDelete(row.original)}
          type="button"
          variant={"destructive"}
          size={"sm"}
        >
          {t("Actions.Delete")}
        </Button>
      ),
    },
  ];
  const confirmDelete = () => {
    if (!secretToDelete) return;
    deleteMutation.mutate(secretToDelete.id);
    setSecretToDelete(null);
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("Secret.PageTitle")}</h2>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          {t("Secret.Actions.Add")}
        </Button>
      </div>

      {secretsQuery.isLoading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={secretsQuery.data?.items ?? []}
          totalCount={secretsQuery.data?.totalCount ?? -1}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] overflow-auto max-h-[calc(100vh-2rem)]">
          <DialogHeader>
            <DialogTitle>{t("Secret.Actions.Add")}</DialogTitle>
          </DialogHeader>
          <AddSecretForm
            onSubmit={handleAddSecret}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={addMutation.isLoading}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!secretToDelete}
        onOpenChange={(open) => !open && setSecretToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Actions.ConfirmDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Secret.Actions.DeleteSecretConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSecretToDelete(null)}>
              {t("Actions.Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              {t("Actions.Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SecretsTable;
