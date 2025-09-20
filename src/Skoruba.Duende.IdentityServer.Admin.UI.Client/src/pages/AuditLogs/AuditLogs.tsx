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
import { Code, CalendarIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { queryKeys } from "@/services/QueryKeys";

const AuditLogs: React.FC = () => {
  const { t } = useTranslation();
  const { pagination, setPagination } = usePaginationTable();

  const [filters, setFilters] = useState<Partial<AuditLogData>>({});
  const [selectedLog, setSelectedLog] = useState<AuditLogData | null>(null);
  const [activeTab, setActiveTab] = useState("data");
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
            setActiveTab("data");
          }}
        >
          <Code className="w-4 h-4 mr-2" />
          {t("AuditLogs.ViewDetails")}
        </Button>
      ),
    },
  ];

  return (
    <Page title={t("AuditLogs.PageTitle")}>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
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
            <PopoverContent align="start" className="w-auto p-2 space-y-2">
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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setDate(undefined);
                handleChange("created", undefined);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="overflow-auto max-w-[900px] max-h-[calc(100vh-2rem)]"
        >
          <DialogHeader>
            <DialogTitle>{t("AuditLogs.DetailsModalTitle")}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="data">{t("AuditLogs.Data")}</TabsTrigger>
              <TabsTrigger value="subject">
                {t("AuditLogs.SubjectAdditionalData")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              {selectedLog?.data ? (
                <pre className="p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                  <code>{selectedLog.data}</code>
                </pre>
              ) : (
                <p className="text-muted-foreground">{t("AuditLogs.NoData")}</p>
              )}
            </TabsContent>

            <TabsContent value="subject">
              {selectedLog?.subjectAdditionalData ? (
                <pre className="p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                  <code>{selectedLog.subjectAdditionalData}</code>
                </pre>
              ) : (
                <p className="text-muted-foreground">
                  {t("AuditLogs.NoSubjectAdditionalData")}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default AuditLogs;
