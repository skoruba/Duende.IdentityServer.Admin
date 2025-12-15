import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getConfigurationRulesMetadata,
  createConfigurationRule,
  updateConfigurationRule,
} from "@/services/ConfigurationRulesService";
import { queryKeys } from "@/services/QueryKeys";
import Loading from "@/components/Loading/Loading";
import ConfigurationRuleForm from "./ConfigurationRuleForm";
import { toast } from "@/components/ui/use-toast";

interface ConfigurationRuleModalProps {
  rule: client.ConfigurationRuleDto | null;
  existingRules: client.ConfigurationRuleDto[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfigurationRuleModal: React.FC<ConfigurationRuleModalProps> = ({
  rule,
  existingRules,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!rule;
  const queryClient = useQueryClient();

  const { data: metadata, isLoading: metadataLoading } = useQuery(
    ["configurationRulesMetadata"],
    getConfigurationRulesMetadata,
    { enabled: isOpen }
  );

  const saveMutation = useMutation(
    async (data: client.ConfigurationRuleDto) => {
      if (isEditMode && rule) {
        await updateConfigurationRule(rule.id, data);
      } else {
        await createConfigurationRule(data);
      }
    },
    {
      onSuccess: () => {
        // Invalidate configuration issues cache
        queryClient.invalidateQueries([queryKeys.configurationIssues]);
        queryClient.invalidateQueries([queryKeys.configurationIssuesSummary]);
        onSuccess();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: t("ConfigurationRules.SaveFailed"),
          description: t("ConfigurationRules.GenericError"),
        });
      },
    }
  );

  const handleFormSubmit = (data: client.ConfigurationRuleDto) => {
    saveMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("ConfigurationRules.EditRule")
              : t("ConfigurationRules.AddNewRule")}
          </DialogTitle>
        </DialogHeader>

        {metadataLoading ? (
          <Loading />
        ) : (
          metadata && (
            <ConfigurationRuleForm
              rule={rule}
              existingRules={existingRules}
              metadata={metadata}
              onSubmit={handleFormSubmit}
              isEditMode={isEditMode}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationRuleModal;
