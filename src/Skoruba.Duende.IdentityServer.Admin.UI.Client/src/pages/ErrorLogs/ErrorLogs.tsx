import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Code, FileWarning, FilterX, Search, Trash2 } from "lucide-react";
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
import {
  DateTimeValue,
  ERROR_LOG_LEVELS,
  formatDateTimeParam,
  parseDateTimeParam,
  toTimeRange,
} from "@/lib/errorLogs/errorLogFilters";
import { ErrorLogData } from "@/models/ErrorLogs/ErrorLogModels";
import {
  deleteErrorLogsOlderThan,
  getErrorLogs,
} from "@/services/ErrorLogsService";
import { queryKeys } from "@/services/QueryKeys";
import DateTimeFilter from "./DateTimeFilter";
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

  // The filters live in the URL (?level=Error&from=2026-11-09T09:30&to=...),
  // so a filtered view can be shared and survives a reload.
  const [searchParams, setSearchParams] = useSearchParams();
  const levels = searchParams.getAll("level");
  const from = parseDateTimeParam(searchParams.get("from"));
  const to = parseDateTimeParam(searchParams.get("to"));
  const timeRange = toTimeRange(from, to);
  const hasFilters = levels.length > 0 || !!from.date || !!to.date;

  const updateFilters = (update: (params: URLSearchParams) => void) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        update(next);
        return next;
      },
      { replace: true },
    );
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const toggleLevel = (level: string) =>
    updateFilters((params) => {
      const current = params.getAll("level");
      params.delete("level");
      const next = current.includes(level)
        ? current.filter((x) => x !== level)
        : [...current, level];
      next.forEach((x) => params.append("level", x));
    });

  const setDateTime = (name: "from" | "to", value: DateTimeValue) =>
    updateFilters((params) => {
      const formatted = formatDateTimeParam(value);
      if (formatted) {
        params.set(name, formatted);
      } else {
        params.delete(name);
      }
    });

  const clearFilters = () =>
    updateFilters((params) => {
      params.delete("level");
      params.delete("from");
      params.delete("to");
    });

  const logs = useQuery({
    queryKey: [
      queryKeys.errorLogs,
      pagination,
      searchTerm,
      levels,
      timeRange.from?.getTime(),
      timeRange.to?.getTime(),
    ],
    queryFn: () =>
      getErrorLogs(
        { searchText: searchTerm, levels, ...timeRange },
        pagination.pageIndex,
        pagination.pageSize,
      ),
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
            defaultMonth={deleteOlderThan}
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

  const isEmpty = logs.data?.totalCount === 0 && !searchTerm && !hasFilters;

  const filters = (
    <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t("ErrorLogs.Level")}
        </span>
        <div className="flex gap-1">
          {ERROR_LOG_LEVELS.map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={levels.includes(level) ? "default" : "outline"}
              aria-pressed={levels.includes(level)}
              onClick={() => toggleLevel(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>
      <DateTimeFilter
        label={t("ErrorLogs.From")}
        value={from}
        onChange={(value) => setDateTime("from", value)}
      />
      <DateTimeFilter
        label={t("ErrorLogs.To")}
        value={to}
        onChange={(value) => setDateTime("to", value)}
      />
      {hasFilters && (
        <Button type="button" variant="ghost" onClick={clearFilters}>
          <FilterX className="mr-2 h-4 w-4" />
          {t("ErrorLogs.ClearFilters")}
        </Button>
      )}
    </div>
  );

  return (
    <Page
      title={t("ErrorLogs.PageTitle")}
      icon={FileWarning}
      accentKind="monitoring"
      topSection={headerActions}
    >
      {!isEmpty && filters}
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
