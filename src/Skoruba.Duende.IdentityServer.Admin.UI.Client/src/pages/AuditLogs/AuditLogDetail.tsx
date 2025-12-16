import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { AuditLogData } from "@/models/AuditLogs/AuditLogsModels";
import { Database, User } from "lucide-react";

type AuditLogDetailProps = {
  open: boolean;
  log: AuditLogData | null;
  onClose: () => void;
  defaultTab?: "data" | "subject";
};

const AuditLogDetail: React.FC<AuditLogDetailProps> = ({
  open,
  log,
  onClose,
  defaultTab = "data",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"data" | "subject">(defaultTab);

  React.useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab, log?.id]);

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : void 0)}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="overflow-auto max-w-[900px] max-h-[calc(100vh-2rem)]"
      >
        <DialogHeader>
          <DialogTitle>{t("AuditLogs.DetailsModalTitle")}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "data" | "subject")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t("AuditLogs.Data")}
            </TabsTrigger>
            <TabsTrigger value="subject" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t("AuditLogs.SubjectAdditionalData")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            {log?.data ? (
              <pre className="p-2 bg-gray-100 rounded text-sm overflow-x-auto">
                <code>{log.data}</code>
              </pre>
            ) : (
              <p className="text-muted-foreground">{t("AuditLogs.NoData")}</p>
            )}
          </TabsContent>

          <TabsContent value="subject">
            {log?.subjectAdditionalData ? (
              <pre className="p-2 bg-muted rounded text-sm overflow-x-auto">
                <code>{log.subjectAdditionalData}</code>
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
  );
};

export default AuditLogDetail;
