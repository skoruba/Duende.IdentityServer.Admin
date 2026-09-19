import { PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApplicationInformation } from "@/services/InfoServices";
import Loading from "@/components/Loading/Loading";
import { Button } from "@/components/ui/button";
import useModal from "@/hooks/modalHooks";
import ClientsWizardModals from "@/pages/Clients/ClientsWizardModals";
import AuditLogs from "./AuditLogs";
import ConfigurationIssuesSummary from "./ConfigurationIssuesSummary";
import RecentActivity from "./RecentActivity";
import SystemStatus from "./SystemStatus";
import {
  ClientsResourcesCard,
  IdentityCard,
  ProvidersKeysCard,
} from "./ResourceSections";

const Home = () => {
  const { t } = useTranslation();
  const { data: applicationInfo, isLoading } = useApplicationInformation();
  const { isOpen, closeModal, openModal } = useModal();

  if (isLoading) return <Loading fullscreen />;

  return (
    <div className="flex-1 bg-page-background">
    <section id="features" className="container space-y-5 py-6">
      <header className="rounded-2xl border bg-card px-6 py-4 shadow-sm md:px-7 md:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-semibold leading-tight tracking-tight md:text-2xl">
              {applicationInfo?.applicationName ?? t("Home.Title")}
            </h1>
            <SystemStatus version={applicationInfo?.applicationVersion} />
          </div>
          <Button
            onClick={openModal}
            className="shrink-0 self-start sm:self-auto"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("Clients.AddNewClient")}
          </Button>
        </div>
      </header>

      <div
        id="features-stats"
        className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12"
      >
        <ClientsResourcesCard
          onNewClient={openModal}
          className="md:col-span-2 lg:col-span-7"
        />
        <ConfigurationIssuesSummary className="md:col-span-2 lg:col-span-5" />

        <IdentityCard className="lg:col-span-4" />
        <ProvidersKeysCard className="lg:col-span-4" />
        <AuditLogs className="md:col-span-2 lg:col-span-4" />

        <RecentActivity className="md:col-span-2 lg:col-span-12" />
      </div>

      <ClientsWizardModals
        closeModalClientType={closeModal}
        isOpenModalClientType={isOpen}
      />
    </section>
    </div>
  );
};

export default Home;
