import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LogLevelBadge = ({ level }: { level: string }) => {
  if (level === "Fatal" || level === "Error") {
    return <Badge variant="destructive">{level}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        level === "Warning" &&
          "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {level}
    </Badge>
  );
};

export default LogLevelBadge;
