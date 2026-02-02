import React, { useState } from "react";
import { useQuery } from "react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import { useTranslation } from "react-i18next";
import { usePaginationTable } from "@/components/DataTable/usePaginationTable";
import { getAuditLogs } from "@/services/AuditLogsService";
import { DataTable } from "@/components/DataTable/DataTable";
import { AuditLogData } from "@/models/AuditLogs/AuditLogsModels";
import { Code, CalendarIcon, X, Activity } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { queryKeys } from "@/services/QueryKeys";
import AuditLogDetail from "./AuditLogDetail";

const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const [filters, setFilters] = useState<Partial<AuditLogData>>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);
  const [date, setDate] = useState<Date | undefined>();

  const filtersToSend = {
    ...filters,
    created: date ?? undefined,
  };

  const { data, isLoading } = useQuery(
    [queryKeys.auditLogs, pagination, filtersToSend],
    () =>
      getAuditLogs(filtersToSend, pagination.pageIndex, pagination.pageSize),
    { keepPreviousData: true }
  );

  const handleChange = (key: keyof AuditLogData, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const columns = [
    { accessorKey: "event", header: t("AuditLogs.Event") },
    { accessorKey: "source", header: t("AuditLogs.Source") },
    { accessorKey: "subjectName", header: t("AuditLogs.SubjectName") },
    {
      accessorKey: "created",
      header: t("AuditLogs.Created"),
      cell: ({ row }: { row: { original: AuditLogData } }) =>
        format(new Date(row.original.created), "dd.MM.yyyy HH:mm:ss"),
    },
    {
      id: "details",
      cell: ({ row }: { row: { original: AuditLogData } }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedLog(row.original);
          }}
        >
          <Code className="w-4 h-4 mr-2" />
          {t("AuditLogs.ViewDetails")}
        </Button>
      ),
    },
  ];

  const headerFilters = (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:items-center">
      <Input
        placeholder={t("AuditLogs.SearchEvent")}
        onChange={(e) => handleChange("event", e.target.value)}
      />
      <Input
        placeholder={t("AuditLogs.SearchSource")}
        onChange={(e) => handleChange("source", e.target.value)}
      />
      <Input
        placeholder={t("AuditLogs.SearchSubject")}
        onChange={(e) => handleChange("subjectName", e.target.value)}
      />

      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal pr-10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd.MM.yyyy") : t("AuditLogs.SelectDate")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto space-y-2 p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate ?? undefined);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {date && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDate(undefined);
              handleChange("created", undefined);
            }}
            aria-label={t("AuditLogs.ClearDate")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Page
      title={t("AuditLogs.PageTitle")}
      icon={Activity}
      accentKind="monitoring"
      topSection={headerFilters}
    >
      {isLoading ? (
        <Loading fullscreen />
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          totalCount={data?.totalCount ?? 0}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}

      <AuditLogDetail
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        defaultTab="data"
      />
    </Page>
  );
};

export default AuditLogs;
