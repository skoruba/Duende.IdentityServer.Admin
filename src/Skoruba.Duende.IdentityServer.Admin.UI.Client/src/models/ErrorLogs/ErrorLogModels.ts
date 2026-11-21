export type ErrorLogData = {
  id: number;
  level: string;
  timeStamp: Date;
  message: string;
  messageTemplate: string;
  exception?: string;
  logEvent?: string;
};

export type ErrorLogsData = {
  items: ErrorLogData[];
  totalCount: number;
};
