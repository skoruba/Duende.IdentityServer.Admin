import { Link2, Link2Off } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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
  const isUnused = clientCount === 0;
  const Icon = isUnused ? Link2Off : Link2;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "-ml-3 tabular-nums",
            (isUnused || clientCount === undefined) && "text-muted-foreground",
          )}
          aria-label={`${t("ScopeUsage.UsedBy")}: ${scopeName}`}
        >
          <Icon className="mr-2 h-4 w-4" />
          <span className={cn(clientCount !== undefined && "underline")}>
            {clientCount === undefined
              ? "—"
              : isUnused
                ? t("ScopeUsage.NoClients")
                : t("ScopeUsage.ClientCount", { count: clientCount })}
          </span>
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
