import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScopeKind, ScopeUsage } from "./ScopeUsage";

type ScopeUsageButtonProps = {
  scopeKind: ScopeKind;
  scopeId: number;
  scopeName: string;
  clientCount?: number;
};

const ScopeUsageButton = ({
  scopeKind,
  scopeId,
  scopeName,
  clientCount,
}: ScopeUsageButtonProps) => {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          <Link2 className="mr-2 h-4 w-4" />
          {t("ScopeUsage.UsedBy")}
          {clientCount !== undefined && (
            <Badge
              variant={clientCount > 0 ? "secondary" : "outline"}
              className="ml-2 px-1.5 py-0"
              title={t("ScopeUsage.ClientCount", { count: clientCount })}
            >
              {clientCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("ScopeUsage.UsedBy")}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {scopeName}
          </DialogDescription>
        </DialogHeader>
        <ScopeUsage scopeKind={scopeKind} scopeId={scopeId} />
      </DialogContent>
    </Dialog>
  );
};

export default ScopeUsageButton;
