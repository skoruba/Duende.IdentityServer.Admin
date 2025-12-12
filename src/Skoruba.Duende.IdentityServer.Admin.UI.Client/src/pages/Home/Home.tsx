import {
  Activity,
  Cable,
  Cog,
  FileLock2,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import DashboardCharts from "./DashboardCharts";
import {
  ApiResourcesUrl,
  ClientsUrl,
  ApiScopesUrl,
  IdentityResourcesUrl,
  KeysUrl,
  UsersUrl,
  RolesUrl,
  ConfigurationIssuesUrl,
  ConfigurationRulesUrl,
  IdentityProvidersUrl,
  AuditLogsUrl,
} from "@/routing/Urls";
import { useApplicationInformation } from "@/services/InfoServices";
import Loading from "@/components/Loading/Loading";
import cn from "classnames";

export const ACCENTS = {
  management: {
    bg: "bg-indigo-500/10",
    ring: "ring-1 ring-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  identity: {
    bg: "bg-emerald-500/10",
    ring: "ring-1 ring-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  providers: {
    bg: "bg-amber-500/10",
    ring: "ring-1 ring-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  monitoring: {
    bg: "bg-slate-500/10",
    ring: "ring-1 ring-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
  },
} as const;

type Kind = keyof typeof ACCENTS;

const Home = () => {
  const { t } = useTranslation();
  const { data: applicationInfo, isLoading } = useApplicationInformation();

  const cards: Array<{
    icon: JSX.Element;
    title: string;
    description: string;
    url: string;
    kind: Kind;
  }> = [
    {
      icon: <Laptop className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.Clients"),
      description: t("Home.ClientsDescription"),
      url: ClientsUrl,
      kind: "management",
    },
    {
      icon: <Cable className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.ApiResources"),
      description: t("Home.ApiResourcesDescription"),
      url: ApiResourcesUrl,
      kind: "management",
    },
    {
      icon: <ShieldCheck className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.ApiScopes"),
      description: t("Home.ApiScopesDescription"),
      url: ApiScopesUrl,
      kind: "management",
    },
    {
      icon: <Fingerprint className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.IdentityResources"),
      description: t("Home.IdentityResourcesDescription"),
      url: IdentityResourcesUrl,
      kind: "management",
    },

    {
      icon: <Users className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.Users"),
      description: t("Home.UsersDescription"),
      url: UsersUrl,
      kind: "identity",
    },
    {
      icon: <Lock className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.Roles"),
      description: t("Home.RolesDescription"),
      url: RolesUrl,
      kind: "identity",
    },

    {
      icon: <KeyRound className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.IdentityProviders"),
      description: t("Home.IdentityProvidersDescription"),
      url: IdentityProvidersUrl,
      kind: "providers",
    },
    {
      icon: <FileLock2 className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.Keys"),
      description: t("Home.KeysDescription"),
      url: KeysUrl,
      kind: "providers",
    },

    {
      icon: <Activity className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.Logs"),
      description: t("Home.LogsDescription"),
      url: AuditLogsUrl,
      kind: "monitoring",
    },
    {
      icon: <Cog className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.ConfigurationIssues"),
      description: t("Home.ConfigurationIssuesDescription"),
      url: ConfigurationIssuesUrl,
      kind: "monitoring",
    },
    {
      icon: <Settings className="h-12 w-12 stroke-[1.75]" />,
      title: t("Home.ConfigurationRules"),
      description: t("Home.ConfigurationRulesDescription"),
      url: ConfigurationRulesUrl,
      kind: "monitoring",
    },
  ];

  if (isLoading) return <Loading fullscreen />;

  return (
    <section id="features" className="container space-y-4 py-4 md:py-6 lg:py-6">
      <div className="mx-auto flex max-w-[64rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-2xl md:text-4xl">
          {applicationInfo?.applicationName ?? t("Home.Title")}
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          {t("Home.SubTitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          id="features-stats"
          className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2"
        >
          {cards.map((card, i) => {
            const accent = ACCENTS[card.kind];
            return (
              <Link
                key={i}
                to={card.url}
                className="group block relative overflow-hidden rounded-lg border bg-background p-2 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex min-h-[140px] items-center gap-4 rounded-md p-5">
                  <div
                    className={cn(
                      "inline-flex h-20 w-20 items-center justify-center rounded-full",
                      accent.bg,
                      accent.ring
                    )}
                  >
                    <div
                      className={cn(
                        "transition-transform duration-150 group-hover:scale-[1.03]",
                        accent.text
                      )}
                    >
                      {card.icon}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-base md:text-[17px] leading-tight">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-6">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <DashboardCharts />
      </div>
    </section>
  );
};

export default Home;
