import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useStandardClaims } from "@/services/ClientServices";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";

const IdentityResourceClaimsTab: React.FC = () => {
  const { t } = useTranslation();

  const claims = useStandardClaims();

  return claims.isLoading ? (
    <Loading />
  ) : (
    <CardWrapper
      title={t("IdentityResource.Tabs.UserClaims")}
      description={t("IdentityResource.Tabs.UserClaimsDescription")}
      icon={User}
    >
      <FormRow
        name="userClaims"
        label={t("IdentityResource.Section.Label.UserClaims_Label")}
        description={t("IdentityResource.Section.Label.UserClaims_Info")}
        type="dualList"
        includeSeparator
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

export default IdentityResourceClaimsTab;
