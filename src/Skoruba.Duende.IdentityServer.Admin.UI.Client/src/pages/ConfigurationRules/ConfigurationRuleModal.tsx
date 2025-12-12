import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "react-query";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getConfigurationRulesMetadata,
  createConfigurationRule,
  updateConfigurationRule,
} from "@/services/ConfigurationRulesService";
import Loading from "@/components/Loading/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfigurationRuleModalProps {
  rule: client.ConfigurationRuleDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfigurationRuleModal: React.FC<ConfigurationRuleModalProps> = ({
  rule,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!rule;

  const [formData, setFormData] = useState<
    Partial<client.ConfigurationRuleDto>
  >({});
  const [configObject, setConfigObject] = useState<any>({});
  const [selectedRuleType, setSelectedRuleType] = useState<string>("");

  const { data: metadata, isLoading: metadataLoading } = useQuery(
    ["configurationRulesMetadata"],
    getConfigurationRulesMetadata,
    { enabled: isOpen }
  );

  const saveMutation = useMutation(
    async (data: client.ConfigurationRuleDto) => {
      if (isEditMode && rule) {
        await updateConfigurationRule(rule.id, data);
      } else {
        await createConfigurationRule(data);
      }
    },
    {
      onSuccess: () => {
        onSuccess();
      },
    }
  );

  useEffect(() => {
    if (rule && isOpen) {
      setFormData(rule);
      setSelectedRuleType(String(rule.ruleType));
      try {
        const config = rule.configuration ? JSON.parse(rule.configuration) : {};
        setConfigObject(config);
      } catch {
        setConfigObject({});
      }
    } else if (!rule && isOpen) {
      setFormData({
        isEnabled: false,
        issueType: "Recommendation" as any,
      });
      setConfigObject({});
      setSelectedRuleType("");
    }
  }, [rule, isOpen]);

  useEffect(() => {
    if (selectedRuleType && metadata && !isEditMode) {
      const meta = metadata.find(
        (m) => m.ruleType === (selectedRuleType as any)
      );
      if (meta) {
        setFormData({
          ruleType: selectedRuleType as unknown as client.ConfigurationRuleType,
          resourceType: meta.resourceType as any,
          issueType: "Recommendation" as any,
          isEnabled: false,
          messageTemplate: meta.defaultMessageTemplate || "",
          fixDescription: meta.defaultFixDescription || "",
          configuration: meta.defaultConfiguration || undefined,
        });
        try {
          const defaultConfig = meta.defaultConfiguration
            ? JSON.parse(meta.defaultConfiguration)
            : {};
          setConfigObject(defaultConfig);
        } catch {
          setConfigObject({});
        }
      }
    }
  }, [selectedRuleType, metadata, isEditMode]);

  const currentMetadata = metadata?.find(
    (m) => m.ruleType === (formData.ruleType || selectedRuleType)
  );

  const handleSubmit = () => {
    const finalData: client.ConfigurationRuleDto = {
      ...formData,
      configuration:
        Object.keys(configObject).length > 0
          ? JSON.stringify(configObject)
          : null,
    } as client.ConfigurationRuleDto;

    saveMutation.mutate(finalData);
  };

  const renderParameterField = (
    param: client.ConfigurationRuleParameterDto
  ) => {
    const paramName = param.name || "";
    const value = configObject[paramName] ?? param.defaultValue;

    switch (param.type) {
      case "string":
        return (
          <div key={param.name} className="space-y-2">
            <Label>
              {param.displayName}{" "}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              value={value || ""}
              onChange={(e) =>
                setConfigObject({
                  ...configObject,
                  [paramName]: e.target.value,
                })
              }
              placeholder={param.defaultValue?.toString()}
            />
            {param.description && (
              <p className="text-xs text-muted-foreground">
                {param.description}
              </p>
            )}
          </div>
        );

      case "number":
        return (
          <div key={param.name} className="space-y-2">
            <Label>
              {param.displayName}{" "}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                setConfigObject({
                  ...configObject,
                  [paramName]: Number(e.target.value),
                })
              }
              min={param.minValue}
              max={param.maxValue}
              placeholder={param.defaultValue?.toString()}
            />
            {param.description && (
              <p className="text-xs text-muted-foreground">
                {param.description}
                {param.minValue !== undefined &&
                  param.maxValue !== undefined &&
                  ` (${param.minValue} - ${param.maxValue})`}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div
            key={param.name}
            className="flex items-center justify-between space-y-2"
          >
            <div className="space-y-1">
              <Label>{param.displayName}</Label>
              {param.description && (
                <p className="text-xs text-muted-foreground">
                  {param.description}
                </p>
              )}
            </div>
            <Switch
              checked={value ?? false}
              onCheckedChange={(checked) =>
                setConfigObject({ ...configObject, [paramName]: checked })
              }
            />
          </div>
        );

      case "array":
        return (
          <div key={param.name} className="space-y-2">
            <Label>
              {param.displayName}{" "}
              {param.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              value={JSON.stringify(value || [], null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setConfigObject({ ...configObject, [paramName]: parsed });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              rows={4}
              placeholder={JSON.stringify(param.defaultValue || [], null, 2)}
            />
            {param.description && (
              <p className="text-xs text-muted-foreground">
                {param.description}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("ConfigurationRules.EditRule")
              : t("ConfigurationRules.AddNewRule")}
          </DialogTitle>
        </DialogHeader>

        {metadataLoading ? (
          <Loading />
        ) : (
          <div className="space-y-4 py-4">
            {currentMetadata && (
              <Alert>
                <AlertDescription>
                  {currentMetadata.description}
                </AlertDescription>
              </Alert>
            )}

            {!isEditMode && (
              <div className="space-y-2">
                <Label>Rule Type *</Label>
                <Select
                  value={selectedRuleType}
                  onValueChange={setSelectedRuleType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadata?.map((meta) => (
                      <SelectItem
                        key={meta.ruleType}
                        value={meta.ruleType || ""}
                      >
                        {meta.displayName} ({meta.resourceType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Enabled</Label>
              <Switch
                checked={formData.isEnabled || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isEnabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Issue Type *</Label>
              <Select
                value={String(formData.issueType || "Recommendation")}
                onValueChange={(value) =>
                  setFormData({ ...formData, issueType: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Recommendation">Recommendation</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message Template</Label>
              <Input
                value={formData.messageTemplate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, messageTemplate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fix Description</Label>
              <Textarea
                value={formData.fixDescription || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fixDescription: e.target.value })
                }
                rows={3}
              />
            </div>

            {currentMetadata &&
              currentMetadata.parameters &&
              currentMetadata.parameters.length > 0 && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Configuration Parameters</h3>
                  {currentMetadata.parameters.map((param) =>
                    renderParameterField(param)
                  )}
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Actions.Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={saveMutation.isLoading}>
            {saveMutation.isLoading ? "Saving..." : t("Actions.Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationRuleModal;
