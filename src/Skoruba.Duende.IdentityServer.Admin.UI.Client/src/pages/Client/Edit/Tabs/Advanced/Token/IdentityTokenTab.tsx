import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useSigningAlgorithms } from "@/services/ClientServices";
import { useTranslation } from "react-i18next";

const IdentityTokenTab = () => {
  const { t } = useTranslation();

  const signingAlgorithms = useSigningAlgorithms();

  if (signingAlgorithms.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormRow
        name="identityTokenLifetime"
        label={t("Client.Label.IdentityTokenLifetime_Label")}
        description={t("Client.Label.IdentityTokenLifetime_Info")}
        type="number"
        includeSeparator
      />
      <FormRow
        name="allowedIdentityTokenSigningAlgorithms"
        label={t("Client.Label.SigningAlgorithms_Label")}
        description={t("Client.Label.SigningAlgorithms_Info")}
        type="inputWithTable"
        includeSeparator
        inputWithTableSettings={{
          search: true,
          searchDataSource:
            signingAlgorithms.data?.map((sa) => ({
              id: sa.value,
              name: sa.label,
            })) ?? [],
        }}
      />
      <FormRow
        name="alwaysIncludeUserClaimsInIdToken"
        label={t("Client.Label.AlwaysIncludeUserClaimsInIdToken_Label")}
        description={t("Client.Label.AlwaysIncludeUserClaimsInIdToken_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="includeJti"
        label={t("Client.Label.IncludeJwtId_Label")}
        description={t("Client.Label.IncludeJwtId_Info")}
        type="switch"
        includeSeparator
      />
    </>
  );
};

export default IdentityTokenTab;
