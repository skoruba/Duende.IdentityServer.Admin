import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import { RandomValues } from "@/helpers/CryptoHelper";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

const BasicsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("Client.Tabs.Basics")}
      description={t("Client.Tabs.BasicsDescription")}
      icon={Settings}
    >
      <FormRow
        name="clientId"
        label={t("Client.Label.ClientId_Label")}
        description={t("Client.Label.ClientId_Info")}
        placeholder={t("Client.Label.ClientId_Label")}
        type="input"
        inputSettings={{
          generateRandomValue: RandomValues.ClientId,
          copyToClipboard: true,
        }}
        required
        includeSeparator
      />
      <FormRow
        name="clientName"
        label={t("Client.Label.ClientName_Label")}
        description={t("Client.Label.ClientName_Info")}
        placeholder={t("Client.Label.ClientName_Label")}
        type="input"
        required
        includeSeparator
      />
      <FormRow
        name="description"
        label={t("Client.Label.Description_Label")}
        description={t("Client.Label.Description_Info")}
        placeholder={t("Client.Label.Description_Label")}
        type="textarea"
        includeSeparator
      />
      <FormRow
        name="enabled"
        label={t("Client.Label.Enabled_Label")}
        description={t("Client.Label.Enabled_Info")}
        type="switch"
      />
    </CardWrapper>
  );
};

export default BasicsTab;
