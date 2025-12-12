import React, { useState } from "react";
import { useQuery } from "react-query";
import { Button } from "@/components/ui/button";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import useModal from "@/hooks/modalHooks";
import { useTranslation } from "react-i18next";
import { Settings, PlusCircle } from "lucide-react";
import ConfigurationRulesTable from "./ConfigurationRulesTable";
import ConfigurationRuleModal from "./ConfigurationRuleModal";
import { queryKeys } from "@/services/QueryKeys";
import { getConfigurationRules } from "@/services/ConfigurationRulesService";

const ConfigurationRules: React.FC = () => {
  const { isOpen, closeModal, openModal } = useModal();
  const { t } = useTranslation();
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const rules = useQuery(
    [queryKeys.configurationRules],
    () => getConfigurationRules(),
    { keepPreviousData: true }
  );

  const handleAddNew = () => {
    setSelectedRule(null);
    openModal();
  };

  const handleEdit = (rule: any) => {
    setSelectedRule(rule);
    openModal();
  };

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("ConfigurationRules.AddNewRule")}
      </Button>
    </div>
  );

  return (
    <Page
      title={t("ConfigurationRules.PageTitle")}
      icon={Settings}
      accentKind="management"
      topSection={headerActions}
    >
      {rules.isLoading ? (
        <Loading fullscreen />
      ) : (
        <>
          <ConfigurationRulesTable
            data={rules.data!}
            onEdit={handleEdit}
            onRefresh={rules.refetch}
          />
          <ConfigurationRuleModal
            rule={selectedRule}
            isOpen={isOpen}
            onClose={closeModal}
            onSuccess={() => {
              closeModal();
              rules.refetch();
            }}
          />
        </>
      )}
    </Page>
  );
};

export default ConfigurationRules;
