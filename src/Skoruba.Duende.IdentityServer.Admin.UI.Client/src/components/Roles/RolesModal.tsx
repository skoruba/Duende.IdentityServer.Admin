import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRolesList } from "@/services/RoleService";
import Loading from "../Loading/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleId: string) => void;
};

const RolesModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { data: roles, isLoading } = useRolesList();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const handleSubmit = () => {
    if (selectedRoleId) {
      onSubmit(selectedRoleId);
    }

    setSelectedRoleId("");
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Role.Actions.Add")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder={t("Role.Actions.Select")} />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id!}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} disabled={!selectedRoleId}>
            {t("Actions.Add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RolesModal;
