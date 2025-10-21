import {
  Activity,
  Cable,
  Cog,
  FileLock2,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
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
  IdentityProvidersUrl,
  AuditLogsUrl,
} from "@/routing/Urls";
import { useApplicationInformation } from "@/services/InfoServices";
import Loading from "@/components/Loading/Loading";

const Home = () => {
  const { t } = useTranslation();

  const { data: applicationInfo, isLoading } = useApplicationInformation();

  const cards = [
    {
      icon: <Laptop className="h-12 w-12" />,
      title: t("Home.Clients"),
      description: t("Home.ClientsDescription"),
      url: ClientsUrl,
    },
    {
      icon: <Cable className="h-12 w-12" />,
      title: t("Home.ApiResources"),
      description: t("Home.ApiResourcesDescription"),
      url: ApiResourcesUrl,
    },
    {
      icon: <ShieldCheck className="h-12 w-12" />,
      title: t("Home.ApiScopes"),
      description: t("Home.ApiScopesDescription"),
      url: ApiScopesUrl,
    },
    {
      icon: <Fingerprint className="h-12 w-12" />,
      title: t("Home.IdentityResources"),
      description: t("Home.IdentityResourcesDescription"),
      url: IdentityResourcesUrl,
    },
    {
      icon: <KeyRound className="h-12 w-12" />,
      title: t("Home.IdentityProviders"),
      description: t("Home.IdentityProvidersDescription"),
      url: IdentityProvidersUrl,
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: t("Home.Users"),
      description: t("Home.UsersDescription"),
      url: UsersUrl,
    },
    {
      icon: <Lock className="h-12 w-12" />,
      title: t("Home.Roles"),
      description: t("Home.RolesDescription"),
      url: RolesUrl,
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: t("Home.Logs"),
      description: t("Home.LogsDescription"),
      url: AuditLogsUrl,
    },
    {
      icon: <Cog className="h-12 w-12" />,
      title: t("Home.ConfigurationIssues"),
      description: t("Home.ConfigurationIssuesDescription"),
      url: ConfigurationIssuesUrl,
    },
    {
      icon: <FileLock2 className="h-12 w-12" />,
      title: t("Home.Keys"),
      description: t("Home.KeysDescription"),
      url: KeysUrl,
    },
  ];

  if (isLoading) {
    return <Loading fullscreen />;
  }

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
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg border bg-background p-2"
            >
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                {card.icon}
                <div className="space-y-2">
                  {card.url ? (
                    <Link to={card.url}>
                      <h3 className="font-bold">{card.title}</h3>
                    </Link>
                  ) : (
                    <h3 className="font-bold">{card.title}</h3>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DashboardCharts />
      </div>
    </section>
  );
};

export default Home;
