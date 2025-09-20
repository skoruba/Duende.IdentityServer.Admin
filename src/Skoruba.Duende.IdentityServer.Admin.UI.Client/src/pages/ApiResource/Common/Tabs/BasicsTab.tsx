import { FormRow } from "@/components/FormRow/FormRow";
import Loading from "@/components/Loading/Loading";
import { useSigningAlgorithms } from "@/services/ClientServices";
import { useTranslation } from "react-i18next";

const BasicsTab: React.FC = () => {
  const { t } = useTranslation();
  const signingAlgorithms = useSigningAlgorithms();

  if (signingAlgorithms.isLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormRow
        name="name"
        label={t("ApiResource.Section.Label.Name_Label")}
        description={t("ApiResource.Section.Label.Name_Info")}
        type="input"
        required
      />

      <FormRow
        name="displayName"
        label={t("ApiResource.Section.Label.DisplayName_Label")}
        description={t("ApiResource.Section.Label.DisplayName_Info")}
        type="input"
      />

      <FormRow
        name="description"
        label={t("ApiResource.Section.Label.Description_Label")}
        description={t("ApiResource.Section.Label.Description_Info")}
        type="textarea"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormRow
          name="enabled"
          label={t("ApiResource.Section.Label.Enabled_Label")}
          description={t("ApiResource.Section.Label.Enabled_Info")}
          type="switch"
        />
        <FormRow
          name="showInDiscoveryDocument"
          label={t("ApiResource.Section.Label.ShowInDiscoveryDocument_Label")}
          description={t(
            "ApiResource.Section.Label.ShowInDiscoveryDocument_Info"
          )}
          type="switch"
        />
        <FormRow
          name="requireResourceIndicator"
          label={t("ApiResource.Section.Label.RequireResourceIndicator_Label")}
          description={t(
            "ApiResource.Section.Label.RequireResourceIndicator_Info"
          )}
          type="switch"
        />
      </div>

      <FormRow
        name="allowedAccessTokenSigningAlgorithms"
        label={t("ApiResource.Section.Label.SigningAlgorithms_Label")}
        description={t("ApiResource.Section.Label.SigningAlgorithms_Info")}
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
    </>
  );
};

export default BasicsTab;
