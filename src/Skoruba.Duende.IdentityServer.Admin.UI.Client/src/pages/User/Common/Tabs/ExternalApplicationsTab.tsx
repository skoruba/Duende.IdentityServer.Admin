import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Trash } from "lucide-react";
import { DataTable } from "@/components/DataTable/DataTable";
import {
  useUserExternalApps,
  useDeleteUserExternalApp,
} from "@/services/UserServices";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import Loading from "@/components/Loading/Loading";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";

type Props = {
  userId: string;
};

const ExternalApplicationsTab: React.FC<Props> = ({ userId }) => {
  const { t } = useTranslation();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<{
    loginProvider: string;
    providerKey: string;
  } | null>(null);

  const { data, isLoading } = useUserExternalApps(userId);
  const deleteMutation = useDeleteUserExternalApp(userId);

  const openDeleteDialog = (loginProvider: string, providerKey: string) => {
    setSelectedApp({ loginProvider, providerKey });
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedApp) return;

    deleteMutation.mutate(selectedApp, {
      onSuccess: () => {
        toast({
          title: t("Actions.Hooray"),
          description: t("User.Actions.DeleteExternalApplicationDeleted"),
        });
        setIsAlertOpen(false);
        setSelectedApp(null);
      },
    });
  };

  const columns = [
    {
      accessorKey: "providerKey",
      header: t("User.Section.Label.UserProviderProviderKey_Label"),
    },
    {
      accessorKey: "loginProvider",
      header: t("User.Section.Label.UserProviderProviderDisplayName_Label"),
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          onClick={() =>
            openDeleteDialog(row.original.provider, row.original.providerUserId)
          }
          className="text-red-500"
        >
          <Trash className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <CardWrapper
      title={t("User.Tabs.ExternalApplications")}
      description={t("User.Tabs.ExternalApplicationsDescription")}
      icon={Globe}
    >
      <DataTable
        columns={columns}
        data={data ?? []}
        totalCount={(data ?? []).length}
        pagination={{
          pageIndex: 0,
          pageSize: data?.length ?? 0,
          hidePagination: true,
        }}
        setPagination={() => {}}
      />

      <DeleteDialog
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
        title={t("User.Actions.DeleteExternalApplication")}
        message={t("User.Actions.DeleteExternalApplicationConfirm")}
        handleDelete={confirmDelete}
      />
    </CardWrapper>
  );
};

export default ExternalApplicationsTab;
