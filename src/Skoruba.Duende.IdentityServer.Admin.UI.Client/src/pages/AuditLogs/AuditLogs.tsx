import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
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
import { format, isValid, parse } from "date-fns";
import { queryKeys } from "@/services/QueryKeys";
import AuditLogDetail from "./AuditLogDetail";

const CREATED_PARAM_FORMAT = "yyyy-MM-dd";
// Marks the locations this page has produced itself by changing a filter.
const FILTER_CHANGE_STATE = "auditLogsFilterChange";

const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Partial<AuditLogData>>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);

  // The dashboard's recent activity links here with ?event=<EventName> and the
  // activity alert with ?created=yyyy-MM-dd. Both filters live in the URL, so a
  // bare link clears them and a cleared filter does not come back on reload.
  const eventFilter = searchParams.get("event") ?? undefined;
  const createdParam = searchParams.get("created");
  const date = useMemo(() => {
    if (!createdParam || !/^\d{4}-\d{2}-\d{2}$/.test(createdParam)) {
      return undefined;
    }

    const parsed = parse(createdParam, CREATED_PARAM_FORMAT, new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [createdParam]);

  // A navigation settles a moment after the key stroke, too late for a controlled
  // input. The text box keeps its own copy and takes the URL over only when the
  // location was changed from outside - a menu link, not the filter itself.
  const location = useLocation();
  const [eventInput, setEventInput] = useState(eventFilter ?? "");
  const [syncedLocationKey, setSyncedLocationKey] = useState(location.key);
  if (syncedLocationKey !== location.key) {
    setSyncedLocationKey(location.key);

    const state = location.state as { [FILTER_CHANGE_STATE]?: boolean } | null;
    if (!state?.[FILTER_CHANGE_STATE]) {
      setEventInput(eventFilter ?? "");
    }
  }

  const setSearchParam = (key: string, value: string | undefined) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      // Typing into the event filter must not fill the browser history.
      { replace: true, state: { [FILTER_CHANGE_STATE]: true } },
    );
  };

  const filtersToSend = {
    ...filters,
    event: eventFilter,
    created: date,
  };

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.auditLogs, pagination, filtersToSend],
    queryFn: () =>
      getAuditLogs(filtersToSend, pagination.pageIndex, pagination.pageSize),
    placeholderData: (previousData) => previousData,
  });

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
        value={eventInput}
        onChange={(e) => {
          setEventInput(e.target.value);
          setSearchParam("event", e.target.value);
        }}
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
                setSearchParam(
                  "created",
                  selectedDate
                    ? format(selectedDate, CREATED_PARAM_FORMAT)
                    : undefined,
                );
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {date && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchParam("created", undefined)}
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
