import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const IdentityProviderBasics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("IdentityProvider.Tabs.Basics")}
      description={t("IdentityProvider.Tabs.BasicsDescription")}
      icon={Info}
    >
      <FormRow
        name="scheme"
        label={t("IdentityProvider.Section.Label.Scheme_Label")}
        description={t("IdentityProvider.Section.Label.Scheme_Info")}
        type="input"
        required
      />
      <FormRow
        name="type"
        label={t("IdentityProvider.Section.Label.ProtocolType_Label")}
        description={t("IdentityProvider.Section.Label.ProtocolType_Info")}
        type="input"
        required
      />
      <FormRow
        name="displayName"
        label={t("IdentityProvider.Section.Label.DisplayName_Label")}
        description={t("IdentityProvider.Section.Label.DisplayName_Info")}
        type="input"
      />
      <FormRow
        name="enabled"
        label={t("IdentityProvider.Section.Label.Enabled_Label")}
        description={t("IdentityProvider.Section.Label.Enabled_Info")}
        type="switch"
      />
    </CardWrapper>
  );
};

export default IdentityProviderBasics;
