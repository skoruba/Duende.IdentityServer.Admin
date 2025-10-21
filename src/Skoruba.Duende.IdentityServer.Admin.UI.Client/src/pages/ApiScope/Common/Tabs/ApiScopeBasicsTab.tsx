import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const ApiScopeBasicsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("ApiScope.Tabs.Basics")}
      description={t("ApiScope.Tabs.BasicsDescription")}
      icon={Info}
    >
      <FormRow
        name="name"
        label={t("ApiScope.Section.Label.Name_Label")}
        description={t("ApiScope.Section.Label.Name_Info")}
        type="input"
        required
      />
      <FormRow
        name="displayName"
        label={t("ApiScope.Section.Label.DisplayName_Label")}
        description={t("ApiScope.Section.Label.DisplayName_Info")}
        type="input"
      />
      <FormRow
        name="description"
        label={t("ApiScope.Section.Label.Description_Label")}
        description={t("ApiScope.Section.Label.Description_Info")}
        type="textarea"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow
          name="enabled"
          label={t("ApiScope.Section.Label.Enabled_Label")}
          description={t("ApiScope.Section.Label.Enabled_Info")}
          type="switch"
        />
        <FormRow
          name="showInDiscoveryDocument"
          label={t("ApiScope.Section.Label.ShowInDiscoveryDocument_Label")}
          description={t("ApiScope.Section.Label.ShowInDiscoveryDocument_Info")}
          type="switch"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow
          name="required"
          label={t("ApiScope.Section.Label.Required_Label")}
          description={t("ApiScope.Section.Label.Required_Info")}
          type="switch"
        />
        <FormRow
          name="emphasize"
          label={t("ApiScope.Section.Label.Emphasize_Label")}
          description={t("ApiScope.Section.Label.Emphasize_Info")}
          type="switch"
        />
      </div>
    </CardWrapper>
  );
};

export default ApiScopeBasicsTab;
