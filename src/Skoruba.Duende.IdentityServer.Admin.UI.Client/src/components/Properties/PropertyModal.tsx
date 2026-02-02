import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const newPropertySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

type PropertyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { key: string; value: string }) => void;
};

const PropertyModal = ({ isOpen, onClose, onSubmit }: PropertyModalProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ key: "", value: "" });
  const [errors, setErrors] = useState<{ key?: string; value?: string }>({});

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleFormSubmit = () => {
    const parsed = newPropertySchema.safeParse(formData);

    if (!parsed.success) {
      const validationErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        key: validationErrors.key?.[0],
        value: validationErrors.value?.[0],
      });
      return;
    }

    onSubmit(parsed.data);
    setFormData({ key: "", value: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Property.Actions.Add")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="key"
              className={errors.key ? "text-destructive" : ""}
            >
              {t("Property.Key")}
            </Label>
            <Input
              id="key"
              placeholder={t("Property.Key")}
              value={formData.key}
              autoComplete="off"
              onChange={handleInputChange("key")}
              className={errors.value ? "border-red-500" : ""}
            />
            {errors.key && (
              <p className="text-sm text-destructive mt-1">{errors.key}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="value"
              className={errors.value ? "text-destructive" : ""}
            >
              {t("Property.Value")}
            </Label>
            <Input
              id="value"
              placeholder={t("Property.Value")}
              value={formData.value}
              onChange={handleInputChange("value")}
              className={errors.value ? "border-red-500" : ""}
              autoComplete="off"
            />
            {errors.value && (
              <p className="text-sm text-destructive mt-1">{errors.value}</p>
            )}
          </div>
          <Button onClick={handleFormSubmit}>
            {t("Property.Actions.Add")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;
