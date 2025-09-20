import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useStandardClaims } from "@/services/ClientServices";
import { useTranslation } from "react-i18next";

const IdentityResourceClaimsTab: React.FC = () => {
  const { t } = useTranslation();

  const claims = useStandardClaims();

  return claims.isLoading ? (
    <Loading />
  ) : (
    <>
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
    </>
  );
};

export default IdentityResourceClaimsTab;
