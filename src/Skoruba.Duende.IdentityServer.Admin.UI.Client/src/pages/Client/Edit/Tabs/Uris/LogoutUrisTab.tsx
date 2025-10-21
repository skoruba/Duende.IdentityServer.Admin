import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const LogoutUrisTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="frontChannelLogoutUri"
        label={t("Client.Label.FrontChannelLogoutUri_Label")}
        description={t("Client.Label.FrontChannelLogoutUri_Info")}
        type="input"
        includeSeparator
      />
      <FormRow
        name="frontChannelLogoutSessionRequired"
        label={t("Client.Label.FrontChannelLogoutSessionRequired_Label")}
        description={t("Client.Label.FrontChannelLogoutSessionRequired_Info")}
        type="switch"
        includeSeparator
      />
      <FormRow
        name="backChannelLogoutUri"
        label={t("Client.Label.BackChannelLogoutUri_Label")}
        description={t("Client.Label.BackChannelLogoutUri_Info")}
        type="input"
        includeSeparator
      />
      <FormRow
        name="backChannelLogoutSessionRequired"
        label={t("Client.Label.BackChannelLogoutSessionRequired_Label")}
        description={t("Client.Label.BackChannelLogoutSessionRequired_Info")}
        type="switch"
      />
    </>
  );
};

export default LogoutUrisTab;
