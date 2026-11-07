import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { ScopeUsage } from "@/components/ScopeUsage/ScopeUsage";
import { Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const IdentityResourceUsageTab = () => {
  const { t } = useTranslation();
  const { resourceId } = useParams<{ resourceId: string }>();

  if (!resourceId) return null;

  return (
    <CardWrapper
      title={t("IdentityResource.Tabs.UsedBy")}
      description={t("IdentityResource.Tabs.UsedByDescription")}
      icon={Link2}
    >
      <ScopeUsage scopeKind="identityResource" scopeId={Number(resourceId)} />
    </CardWrapper>
  );
};

export default IdentityResourceUsageTab;
