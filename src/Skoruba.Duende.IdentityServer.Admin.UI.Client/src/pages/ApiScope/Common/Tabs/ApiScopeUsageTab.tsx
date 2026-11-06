import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { ScopeUsage } from "@/components/ScopeUsage/ScopeUsage";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const ApiScopeUsageTab = () => {
  const { t } = useTranslation();
  const { scopeId } = useParams<{ scopeId: string }>();

  if (!scopeId) return null;

  return (
    <CardWrapper
      title={t("ApiScope.Tabs.UsedBy")}
      description={t("ApiScope.Tabs.UsedByDescription")}
      icon={Link2}
    >
      <ScopeUsage scopeKind="apiScope" scopeId={Number(scopeId)} />
    </CardWrapper>
  );
};

export default ApiScopeUsageTab;
