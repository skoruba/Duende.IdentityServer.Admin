import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useStandardClaims } from "@/services/ClientServices";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const UserClaimsTab = () => {
  const { t } = useTranslation();

  const claims = useStandardClaims();

  return claims.isLoading ? (
    <Loading />
  ) : (
    <CardWrapper
      title={t("ApiResource.Tabs.UserClaims")}
      description={t("ApiResource.Tabs.UserClaimsDescription")}
      icon={Shield}
    >
      <FormRow
        name="userClaims"
        label={t("ApiResource.Section.Label.UserClaims_Label")}
        description={t("ApiResource.Section.Label.UserClaims_Info")}
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

export default UserClaimsTab;
