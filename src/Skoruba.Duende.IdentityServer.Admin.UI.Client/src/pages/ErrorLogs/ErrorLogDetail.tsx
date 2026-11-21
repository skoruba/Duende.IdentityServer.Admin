import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/CopyButton/CopyButton";
import { ErrorLogData } from "@/models/ErrorLogs/ErrorLogModels";
import { parseLogEvent } from "@/lib/errorLogs/parseLogEvent";
import LogLevelBadge from "./LogLevelBadge";

type ErrorLogDetailProps = {
  log: ErrorLogData | null;
  onClose: () => void;
};

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="space-y-2">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const ErrorLogDetail = ({ log, onClose }: ErrorLogDetailProps) => {
  const { t } = useTranslation();
  const event = useMemo(() => parseLogEvent(log?.logEvent), [log?.logEvent]);

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-h-[calc(100vh-2rem)] max-w-[900px] overflow-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {log && <LogLevelBadge level={log.level} />}
            {t("ErrorLogs.DetailsModalTitle")}
          </DialogTitle>
          <DialogDescription>
            {log && format(new Date(log.timeStamp), "dd.MM.yyyy HH:mm:ss")}
            {event.applicationName && ` · ${event.applicationName}`}
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-6">
            <Section title={t("ErrorLogs.Message")}>
              <p className="whitespace-pre-wrap break-words text-sm">
                {log.message}
              </p>
            </Section>

            {log.exception && (
              <Section
                title={t("ErrorLogs.Exception")}
                action={
                  <CopyButton value={log.exception} variant="ghost" size="sm">
                    {t("ErrorLogs.Copy")}
                  </CopyButton>
                }
              >
                <pre className="max-h-80 overflow-auto rounded bg-muted p-3 text-xs">
                  <code>{log.exception}</code>
                </pre>
              </Section>
            )}

            <Section title={t("ErrorLogs.Properties")}>
              {event.properties.length > 0 ? (
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-[minmax(0,12rem)_1fr]">
                  {event.properties.map((property) => (
                    <div key={property.name} className="contents">
                      <dt className="font-medium text-muted-foreground">
                        {property.name}
                      </dt>
                      <dd className="break-all font-mono text-xs">
                        {property.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("ErrorLogs.NoProperties")}
                </p>
              )}
            </Section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ErrorLogDetail;
