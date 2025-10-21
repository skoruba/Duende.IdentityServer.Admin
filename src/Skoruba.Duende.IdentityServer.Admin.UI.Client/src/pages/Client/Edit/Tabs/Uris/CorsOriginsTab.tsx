import { FormRow } from "@/components/FormRow/FormRow";
import { useTranslation } from "react-i18next";

const CorsOriginsTab: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <FormRow
        name="allowedCorsOrigins"
        label={t("Client.Label.AllowedCorsOrigins_Label")}
        description={t("Client.Label.AllowedCorsOrigins_Info")}
        type="inputWithTable"
      />
    </>
  );
};

export default CorsOriginsTab;
