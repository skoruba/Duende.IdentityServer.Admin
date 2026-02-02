import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useStandardClaims } from "@/services/ClientServices";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

const ApiScopeClaimsTab: React.FC = () => {
  const { t } = useTranslation();
  const claims = useStandardClaims();

  return claims.isLoading ? (
    <Loading />
  ) : (
    <CardWrapper
      title={t("ApiScope.Tabs.UserClaims")}
      description={t("ApiScope.Tabs.UserClaimsDescription")}
      icon={User}
    >
      <FormRow
        name="userClaims"
        label={t("ApiScope.Section.Label.UserClaims_Label")}
        description={t("ApiScope.Section.Label.UserClaims_Info")}
        type="dualList"
        dualListSettings={{
          initialItems:
            claims.data?.map((claim) => ({
              id: claim,
              label: claim,
            })) ?? [],
        }}
      />
    </CardWrapper>
  );
};

export default ApiScopeClaimsTab;
