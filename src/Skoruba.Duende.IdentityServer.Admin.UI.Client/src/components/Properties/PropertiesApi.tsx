import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "@/components/ui/button";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { DataTable } from "@/components/DataTable/DataTable";
import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import useModal from "@/hooks/modalHooks";
import PropertyModal from "./PropertyModal";
import Loading from "@/components/Loading/Loading";
import { PropertiesData, PropertyData } from "@/models/Common/CommonModels";
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
import { toast } from "../ui/use-toast";

type PropertiesTabProps = {
  resourceId: number;
  queryKey: string[];
  pageTitle: string;
  getProperties: (
    resourceId: number,
    pageIndex: number,
    pageSize: number
  ) => Promise<PropertiesData>;
  addProperty: (
    resourceId: number,
    data: { key: string; value: string }
  ) => Promise<void>;
  deleteProperty: (id: number) => Promise<void>;
};

const PropertiesApi: React.FC<PropertiesTabProps> = ({
  resourceId,
  queryKey,
  getProperties,
  addProperty,
  deleteProperty,
  pageTitle,
}) => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable(0, 5);
  const { isOpen, openModal, closeModal } = useModal();
  const [propertyToDelete, setPropertyToDelete] =
    React.useState<PropertyData | null>(null);

  const queryClient = useQueryClient();

  const propertiesQuery = useQuery(
    [...queryKey, pagination],
    () => getProperties(resourceId, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  const addMutation = useMutation(
    (data: { key: string; value: string }) => addProperty(resourceId, data),
    {
      onSuccess: () => {
        toast({
          title: t("Actions.Hooray"),
          description: t("Property.Actions.Added"),
        });
        queryClient.invalidateQueries(queryKey);
        closeModal();
      },
    }
  );

  const deleteMutation = useMutation((id: number) => deleteProperty(id), {
    onSuccess: () => {
      toast({
        title: t("Actions.Hooray"),
        description: t("Property.Actions.Deleted"),
      });
      queryClient.invalidateQueries(queryKey);
    },
  });

  const handleAddProperty = (data: { key: string; value: string }) => {
    addMutation.mutate(data);
  };

  const columns = [
    {
      accessorKey: "key",
      header: t("Property.Key"),
    },
    {
      accessorKey: "value",
      header: t("Property.Value"),
    },
    {
      id: "actions",
      cell: ({ row }: { row: { original: PropertyData } }) => (
        <Button
          onClick={() => setPropertyToDelete(row.original)}
          type="button"
          variant="ghost"
          className="text-red-500"
          size={"sm"}
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];
  const handleConfirmDelete = () => {
    if (!propertyToDelete) return;
    deleteMutation.mutate(propertyToDelete.id);
    setPropertyToDelete(null);
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{pageTitle}</h2>
        <Button type="button" onClick={openModal}>
          {t("Property.Actions.Add")}
        </Button>
      </div>

      {propertiesQuery.isLoading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={propertiesQuery.data?.items ?? []}
          totalCount={propertiesQuery.data?.totalCount ?? -1}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      <PropertyModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleAddProperty}
      />
      <AlertDialog
        open={!!propertyToDelete}
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Actions.ConfirmDeletion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Property.Actions.DeletePropertyConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPropertyToDelete(null)}>
              {t("Actions.Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              {t("Actions.Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PropertiesApi;
