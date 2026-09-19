import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useEnvironmentInfo } from "@/services/InfoServices";

// No status colours here: green belongs to "Healthy", red to real problems.
// Production is the environment where a mistake is costly, so it is the only
// one that stands out - as a solid badge instead of an outlined one.
const isProduction = (environmentName: string) =>
  environmentName.toLowerCase().startsWith("prod");

const stripProtocol = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/+$/, "");

const EnvironmentBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { data } = useEnvironmentInfo();

  const environmentName = data?.environmentName;
  if (!data || !environmentName) return null;

  const production = isProduction(environmentName);

  return (
    <span
      title={t("Home.Environment.Title")}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        production
          ? "border-foreground bg-foreground text-background"
          : "bg-muted/60 text-foreground/80",
        className,
      )}
    >
      <span className="shrink-0">{environmentName}</span>
      {data.identityServerBaseUrl && (
        <>
          <span aria-hidden className="opacity-50">
            ·
          </span>
          <a
            href={data.identityServerBaseUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "truncate font-normal hover:underline",
              production
                ? "text-background/80 hover:text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {stripProtocol(data.identityServerBaseUrl)}
          </a>
        </>
      )}
    </span>
  );
};

export default EnvironmentBadge;
