import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuditLogData } from "@/models/AuditLogs/AuditLogsModels";
import { AuditLogsUrl } from "@/routing/Urls";
import { getTargetHref, getTargetLabelKey } from "./auditTarget";
import { humanizeEventName } from "@/lib/auditLogs/eventName";
import {
  formatAuditLogData,
  getAuditLogRequestInfo,
  getAuditLogTarget,
} from "@/lib/auditLogs/describeAuditLog";

type ActivityDetailDialogProps = {
  log: AuditLogData | null;
  onClose: () => void;
  /** The row that opened the dialog; focus goes back to it on close. */
  returnFocusTo?: HTMLElement | null;
};

const Field = ({
  label,
  children,
  mono = false,
}: {
  label: string;
  children?: React.ReactNode;
  mono?: boolean;
}) =>
  children ? (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "mt-0.5 break-all font-mono text-xs"
            : "mt-0.5 break-words text-sm font-medium"
        }
      >
        {children}
      </dd>
    </div>
  ) : null;

const ActivityDetailDialog = ({
  log,
  onClose,
  returnFocusTo,
}: ActivityDetailDialogProps) => {
  const { t } = useTranslation();

  const created = log ? new Date(log.created) : undefined;
  const info = getAuditLogRequestInfo(log?.action, log?.subjectAdditionalData);
  const payload = formatAuditLogData(log?.data);
  const target = getAuditLogTarget(log?.data);
  const targetHref = getTargetHref(target);
  // undefined (not an empty fragment) when there is nothing to show, so the
  // field hides together with its label.
  const targetNode =
    target?.type === "name" ? (
      target.name
    ) : target?.type === "entity" && targetHref ? (
      // The event recorded only an id - one click shows which entity it is.
      <Link
        to={targetHref}
        className="inline-flex items-center gap-1 rounded-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t(getTargetLabelKey(target), { id: target.id })}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    ) : undefined;

  return (
    <Dialog open={log !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onInteractOutside={() => undefined}
        onCloseAutoFocus={(event) => {
          // Opened without a Radix trigger, so focus would land on <body>.
          if (returnFocusTo) {
            event.preventDefault();
            returnFocusTo.focus();
          }
        }}
        className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-auto"
      >
        <DialogHeader>
          <DialogTitle>{humanizeEventName(log?.event)}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {log?.event}
          </DialogDescription>
        </DialogHeader>

        {log && created && (
          <>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <Field label={t("Home.ActivityDetail.Target")}>{targetNode}</Field>
              <Field label={t("Home.ActivityDetail.PerformedBy")}>
                {log.subjectName}
                {log.subjectType && (
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    ({log.subjectType})
                  </span>
                )}
              </Field>
              <Field label={t("Home.ActivityDetail.When")}>
                {format(created, "PPpp")}
                <span className="ml-1.5 font-normal text-muted-foreground">
                  ({formatDistanceToNowStrict(created, { addSuffix: true })})
                </span>
              </Field>
              <Field label={t("Home.ActivityDetail.IpAddress")} mono>
                {info.remoteIpAddress}
              </Field>
              <Field label={t("Home.ActivityDetail.Request")} mono>
                {info.request}
              </Field>
              <Field label={t("Home.ActivityDetail.TraceId")} mono>
                {info.traceIdentifier}
              </Field>
              <Field label={t("Home.ActivityDetail.SubjectId")} mono>
                {log.subjectIdentifier}
              </Field>
              <Field label={t("AuditLogs.Source")}>{log.source}</Field>
            </dl>

            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">
                {t("Home.ActivityDetail.RecordedData")}
              </p>
              {payload ? (
                <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
                  {payload}
                </pre>
              ) : (
                <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
                  {t("Home.ActivityDetail.NoData")}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link
                  to={`${AuditLogsUrl}?event=${encodeURIComponent(log.event ?? "")}`}
                >
                  {t("Home.ActivityDetail.OpenInAuditLog")}
                  <ArrowRight className="ms-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailDialog;
