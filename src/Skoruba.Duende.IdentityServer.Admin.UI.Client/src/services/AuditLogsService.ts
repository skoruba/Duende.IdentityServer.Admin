import ApiHelper from "@/helpers/ApiHelper";
import {
  AuditLogData,
  AuditLogsData,
} from "@/models/AuditLogs/AuditLogsModels";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { format } from "date-fns";

export const getAuditLogs = async (
  filters: Partial<AuditLogData>,
  page: number,
  pageSize: number
): Promise<AuditLogsData> => {
  const clientLogs = new client.LogsClient(ApiHelper.getApiBaseUrl());

  const created = filters.created
    ? format(new Date(filters.created), "yyyy-MM-dd")
    : null;

  const auditLogs = await clientLogs.auditLog(
    filters.event ?? null,
    filters.source ?? null,
    filters.category ?? null,
    created,
    filters.subjectIdentifier ?? null,
    filters.subjectName ?? null,
    pageSize,
    page + 1
  );

  return {
    items: (auditLogs.logs ?? []).map((log) => ({
      id: log.id,
      event: log.event,
      source: log.source,
      category: log.category,
      subjectIdentifier: log.subjectIdentifier,
      subjectName: log.subjectName,
      subjectType: log.subjectType,
      subjectAdditionalData: log.subjectAdditionalData,
      action: log.action,
      data: log.data,
      created: log.created,
    })),
    totalCount: auditLogs.totalCount,
  };
};
