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
import { SearchDropdown } from "@/components/SearchDropdown/SearchDropdown";
import { useTranslation } from "react-i18next";
import { useStandardClaims } from "@/services/ClientServices";
import Loading from "@/components/Loading/Loading";

const newClaimSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

type ClaimsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { key: string; value: string }) => void;
};

const ClaimsModal = ({ isOpen, onClose, onSubmit }: ClaimsModalProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ key: "", value: "" });
  const [errors, setErrors] = useState<{ key?: string; value?: string }>({});

  const standardClaims = useStandardClaims();

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleDropdownChange = (key: string) => {
    setFormData((prev) => ({ ...prev, key }));
    setErrors((prev) => ({ ...prev, key: undefined }));
  };

  const handleFormSubmit = () => {
    const parsed = newClaimSchema.safeParse(formData);

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
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t("Claim.Actions.Add")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="key"
              className={errors.key ? "text-destructive" : ""}
            >
              {t("Claim.Key")}
            </Label>
            {standardClaims.isLoading ? (
              <Loading />
            ) : (
              <SearchDropdown
                items={
                  standardClaims.data?.map((claim) => ({
                    id: claim,
                    name: claim,
                  })) ?? []
                }
                value={formData.key}
                onChange={handleDropdownChange}
                inputProps={{
                  className: errors.key ? "border-red-500" : "",
                  autoComplete: "off",
                }}
              />
            )}
            {errors.key && (
              <p className="text-sm text-destructive mt-1">{errors.key}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="value"
              className={errors.value ? "text-destructive" : ""}
            >
              {t("Claim.Value")}
            </Label>
            <Input
              id="value"
              placeholder="Enter value"
              value={formData.value}
              autoComplete="off"
              onChange={handleInputChange("value")}
              className={errors.value ? "border-red-500" : ""}
            />
            {errors.value && (
              <p className="text-sm text-destructive mt-1">{errors.value}</p>
            )}
          </div>
          <Button onClick={handleFormSubmit}>{t("Claim.Actions.Add")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimsModal;
