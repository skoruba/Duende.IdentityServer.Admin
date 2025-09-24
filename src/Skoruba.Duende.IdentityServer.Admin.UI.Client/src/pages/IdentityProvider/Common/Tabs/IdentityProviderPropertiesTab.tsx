import React from "react";
import PropertiesForm from "@/components/Properties/PropertiesForm";
import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const IdentityProviderPropertiesTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("IdentityProvider.Tabs.Properties")}
      description={t("IdentityProvider.Tabs.PropertiesDescription")}
      icon={Settings}
    >
      <PropertiesForm />
    </CardWrapper>
  );
};

export default IdentityProviderPropertiesTab;
