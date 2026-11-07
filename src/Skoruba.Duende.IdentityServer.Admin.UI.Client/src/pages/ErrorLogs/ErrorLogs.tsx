import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Code, FileWarning, Search, Trash2 } from "lucide-react";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { DataTable } from "@/components/DataTable/DataTable";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import useSearch from "@/hooks/useSearch";
import { parseLogEvent } from "@/lib/errorLogs/parseLogEvent";
import { ErrorLogData } from "@/models/ErrorLogs/ErrorLogModels";
import {
  deleteErrorLogsOlderThan,
  getErrorLogs,
} from "@/services/ErrorLogsService";
import { queryKeys } from "@/services/QueryKeys";
import ErrorLogDetail from "./ErrorLogDetail";
import LogLevelBadge from "./LogLevelBadge";

// The application name is the assembly name; its last two parts (STS.Identity) read better
const shortApplicationName = (logEvent?: string) =>
  parseLogEvent(logEvent).applicationName?.split(".").slice(-2).join(".");

const ErrorLogs = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { pagination, setPagination } = usePaginationTable();
  const [selectedLog, setSelectedLog] = useState<ErrorLogData | null>(null);
  const [deleteOlderThan, setDeleteOlderThan] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    inputValue,
    handleInputChange,
    handleSearch,
    handleInputKeyDown,
    searchTerm,
  } = useSearch({
    onSearchComplete: () => setPagination({ ...pagination, pageIndex: 0 }),
  });

  const logs = useQuery({
    queryKey: [queryKeys.errorLogs, pagination, searchTerm],
    queryFn: () =>
      getErrorLogs(searchTerm, pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteErrorLogsOlderThan,
    onSuccess: (_, day) => {
      toast({
        title: t("Actions.Hooray"),
        description: t("ErrorLogs.Deleted", {
          date: format(day, "dd.MM.yyyy"),
        }),
      });
      queryClient.invalidateQueries({ queryKey: [queryKeys.errorLogs] });
    },
  });

  const columns: ColumnDef<ErrorLogData, unknown>[] = [
    {
      accessorKey: "timeStamp",
      header: t("ErrorLogs.TimeStamp"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {format(new Date(row.original.timeStamp), "dd.MM.yyyy HH:mm:ss")}
        </span>
      ),
    },
    {
      accessorKey: "level",
      header: t("ErrorLogs.Level"),
      cell: ({ row }) => <LogLevelBadge level={row.original.level} />,
    },
    {
      id: "application",
      header: t("ErrorLogs.Application"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {shortApplicationName(row.original.logEvent) ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "message",
      header: t("ErrorLogs.Message"),
      cell: ({ row }) => (
        <span className="line-clamp-2 break-words" title={row.original.message}>
          {row.original.message}
        </span>
      ),
    },
    {
      id: "details",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setSelectedLog(row.original)}
        >
          <Code className="mr-2 h-4 w-4" />
          {t("ErrorLogs.ViewDetails")}
        </Button>
      ),
    },
  ];

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Trash2 className="mr-2 h-4 w-4" />
            {t("ErrorLogs.DeleteOlderThan")}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <Calendar
            mode="single"
            selected={deleteOlderThan}
            disabled={{ after: new Date() }}
            onSelect={(day) => {
              setIsCalendarOpen(false);
              setDeleteOlderThan(day);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("ErrorLogs.SearchPlaceholder")}
          className="pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <Button variant="secondary" onClick={handleSearch}>
        {t("Actions.Search")}
      </Button>
    </div>
  );

  const isEmpty = logs.data?.totalCount === 0 && !searchTerm;

  return (
    <Page
      title={t("ErrorLogs.PageTitle")}
      icon={FileWarning}
      accentKind="monitoring"
      topSection={headerActions}
    >
      {logs.isLoading ? (
        <Loading fullscreen />
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-10 text-center">
          <FileWarning className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium">{t("ErrorLogs.Empty")}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs.data?.items ?? []}
          totalCount={logs.data?.totalCount ?? 0}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      <ErrorLogDetail log={selectedLog} onClose={() => setSelectedLog(null)} />

      <DeleteDialog
        isAlertOpen={!!deleteOlderThan}
        setIsAlertOpen={(open) => !open && setDeleteOlderThan(undefined)}
        title={t("ErrorLogs.DeleteOlderThan")}
        message={t("ErrorLogs.DeleteConfirm", {
          date: deleteOlderThan ? format(deleteOlderThan, "dd.MM.yyyy") : "",
        })}
        handleDelete={() => {
          if (deleteOlderThan) {
            deleteMutation.mutate(deleteOlderThan);
          }
          setDeleteOlderThan(undefined);
        }}
      />
    </Page>
  );
};

export default ErrorLogs;
