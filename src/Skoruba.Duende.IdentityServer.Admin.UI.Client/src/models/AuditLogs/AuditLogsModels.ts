export interface AuditLogData {
  id: number;
  event?: string;
  source?: string;
  category?: string;
  subjectIdentifier?: string;
  subjectName?: string;
  subjectType?: string;
  subjectAdditionalData?: string;
  action?: string;
  data?: string;
  created: Date;
}

export interface AuditLogsData {
  items: AuditLogData[];
  totalCount: number;
}
