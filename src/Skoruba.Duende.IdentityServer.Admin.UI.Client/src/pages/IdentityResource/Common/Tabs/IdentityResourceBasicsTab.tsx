import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const IdentityResourceBasicsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="name"
        label={t("IdentityResource.Section.Label.Name_Label")}
        description={t("IdentityResource.Section.Label.Name_Info")}
        type="input"
        required
      />
      <FormRow
        name="displayName"
        label={t("IdentityResource.Section.Label.DisplayName_Label")}
        description={t("IdentityResource.Section.Label.DisplayName_Info")}
        type="input"
      />
      <FormRow
        name="description"
        label={t("IdentityResource.Section.Label.Description_Label")}
        description={t("IdentityResource.Section.Label.Description_Info")}
        type="textarea"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow
          name="enabled"
          label={t("IdentityResource.Section.Label.Enabled_Label")}
          description={t("IdentityResource.Section.Label.Enabled_Info")}
          type="switch"
        />
        <FormRow
          name="showInDiscoveryDocument"
          label={t(
            "IdentityResource.Section.Label.ShowInDiscoveryDocument_Label"
          )}
          description={t(
            "IdentityResource.Section.Label.ShowInDiscoveryDocument_Info"
          )}
          type="switch"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow
          name="required"
          label={t("IdentityResource.Section.Label.Required_Label")}
          description={t("IdentityResource.Section.Label.Required_Info")}
          type="switch"
        />
        <FormRow
          name="emphasize"
          label={t("IdentityResource.Section.Label.Emphasize_Label")}
          description={t("IdentityResource.Section.Label.Emphasize_Info")}
          type="switch"
        />
      </div>
    </>
  );
};

export default IdentityResourceBasicsTab;
