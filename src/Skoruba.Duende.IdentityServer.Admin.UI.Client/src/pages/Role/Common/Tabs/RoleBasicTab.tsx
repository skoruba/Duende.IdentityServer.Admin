import { CardWrapper } from "@/components/CardWrapper/CardWrapper";
import { FormRow } from "@/components/FormRow/FormRow";
import { Button } from "@/components/ui/button";
import { RoleFormMode } from "../RoleForm";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

type RoleBasicTabProps = {
  mode: RoleFormMode;
};

const RoleBasicTab: React.FC<RoleBasicTabProps> = ({ mode }) => {
  const { t } = useTranslation();

  return (
    <CardWrapper
      title={t("Role.Tabs.Basics")}
      description={t("Role.Tabs.BasicsDescription")}
      icon={Info}
    >
      <FormRow
        name="name"
        label={t("Role.Section.Label.RoleName_Label")}
        description={t("Role.Section.Label.RoleName_Info")}
        placeholder={t("Role.Section.Label.RoleName_Label")}
        type="input"
        required
        includeSeparator
      />

      <Button type="submit" className="mt-4">
        {mode === RoleFormMode.Create ? t("Actions.Create") : t("Actions.Save")}
      </Button>
    </CardWrapper>
  );
};

export default RoleBasicTab;
