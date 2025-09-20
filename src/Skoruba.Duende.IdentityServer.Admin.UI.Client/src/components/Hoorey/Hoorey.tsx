import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const Hoorey = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-500" />
      <span>{t("Actions.Hooray")}</span>
    </div>
  );
};

export default Hoorey;
