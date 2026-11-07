import ApiHelper from "@/helpers/ApiHelper";
import {
  ErrorLogData,
  ErrorLogsData,
} from "@/models/ErrorLogs/ErrorLogModels";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const getClient = () => new client.LogsClient(ApiHelper.getApiBaseUrl());

export const getErrorLogs = async (
  searchText: string,
  pageIndex: number,
  pageSize: number,
): Promise<ErrorLogsData> => {
  const response = await getClient().errorLog(
    searchText || undefined,
    pageIndex + 1,
    pageSize,
  );

  const items: ErrorLogData[] =
    response.logs?.map((log) => ({
      id: log.id,
      level: log.level ?? "",
      timeStamp: log.timeStamp,
      message: log.message ?? "",
      messageTemplate: log.messageTemplate ?? "",
      exception: log.exception || undefined,
      logEvent: log.logEvent || undefined,
    })) ?? [];

  return { items, totalCount: response.totalCount };
};

// The API takes the day as midnight UTC, so the picked calendar day is kept
// whatever the time zone of the browser.
export const deleteErrorLogsOlderThan = async (day: Date): Promise<void> => {
  await getClient().deleteErrorLog(
    new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())),
  );
};
