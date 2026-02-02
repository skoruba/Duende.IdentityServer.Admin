import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { Form } from "@/components/ui/form";
import { FormRow } from "@/components/FormRow/FormRow";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { isEnumValue } from "@/lib/type-guards";

interface ConfigurationRuleFormProps {
  rule: client.ConfigurationRuleDto | null;
  existingRules: client.ConfigurationRuleDto[];
  metadata: client.ConfigurationRuleMetadataDto[];
  onSubmit: (data: client.ConfigurationRuleDto) => void;
  isEditMode: boolean;
}

const ConfigurationRuleForm: React.FC<ConfigurationRuleFormProps> = ({
  rule,
  existingRules,
  metadata,
  onSubmit,
  isEditMode,
}) => {
  const { t } = useTranslation();
  const [selectedRuleType, setSelectedRuleType] = React.useState<
    client.ConfigurationRuleType | ""
  >("");
  const requiredFieldMessage = useCallback(
    (label: string) => t("Validation.FieldRequired", { field: label }),
    [t]
  );

  const selectedTypeValue = selectedRuleType || rule?.ruleType;
  const currentMetadata = metadata?.find(
    (m) => String(m.ruleType) === String(selectedTypeValue)
  );

  const isDuplicate =
    !isEditMode &&
    selectedRuleType &&
    existingRules.some((r) => r.ruleType === selectedRuleType);

  const buildSchema = useCallback(() => {
    const baseSchema = {
      isEnabled: z.boolean(),
      issueType: z.nativeEnum(client.ConfigurationIssueType),
      messageTemplate: z
        .string()
        .min(1, requiredFieldMessage(t("ConfigurationRules.MessageTemplate"))),
      fixDescription: z.string().optional(),
    };

    if (!currentMetadata?.parameters) {
      return z.object(baseSchema);
    }

    const parameterFields: Record<string, z.ZodTypeAny> = {};

    currentMetadata.parameters.forEach((param) => {
      const paramName = param.name || "";

      switch (param.type) {
        case "string":
          {
            const fieldLabel =
              param.displayName || paramName || "Configuration parameter";
            parameterFields[paramName] = param.required
              ? z.string().min(1, {
                  message: requiredFieldMessage(fieldLabel),
                })
              : z.string().optional();
          }
          break;

        case "number":
          {
            let numberSchema = z.number();
            if (param.minValue !== undefined) {
              numberSchema = numberSchema.min(param.minValue);
            }
            if (param.maxValue !== undefined) {
              numberSchema = numberSchema.max(param.maxValue);
            }
            parameterFields[paramName] = param.required
              ? numberSchema
              : numberSchema.optional();
          }
          break;

        case "boolean":
          parameterFields[paramName] = z.boolean();
          break;

        case "array":
          {
            const fieldLabel =
              param.displayName || paramName || "Configuration parameter";
            parameterFields[paramName] = param.required
              ? z.array(z.string()).min(1, {
                  message: t("Validation.AtLeastOneItemField", {
                    field: fieldLabel,
                  }),
                })
              : z.array(z.string()).optional();
          }
          break;
      }
    });

    return z.object({
      ...baseSchema,
      ...parameterFields,
    });
  }, [currentMetadata, requiredFieldMessage, t]);

  const schema = useMemo(() => buildSchema(), [buildSchema]);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  useEffect(() => {
    if (rule && isEditMode) {
      setSelectedRuleType(rule.ruleType);

      let configObject: Record<string, unknown> = {};
      try {
        configObject = rule.configuration ? JSON.parse(rule.configuration) : {};
      } catch {
        configObject = {};
      }

      currentMetadata?.parameters?.forEach((param) => {
        if (
          param.type === "array" &&
          configObject[param.name || ""] === undefined
        ) {
          configObject[param.name || ""] = [];
        }
      });

      form.reset({
        isEnabled: rule.isEnabled,
        issueType: rule.issueType,
        messageTemplate: rule.messageTemplate || "",
        fixDescription: rule.fixDescription || "",
        ...configObject,
      });
    } else if (!rule && !selectedRuleType) {
      form.reset({
        isEnabled: true,
        issueType: client.ConfigurationIssueType.Recommendation,
        messageTemplate: "",
        fixDescription: "",
      });
    }
  }, [rule, isEditMode, currentMetadata?.parameters, form, selectedRuleType]);

  useEffect(() => {
    if (selectedRuleType && !isEditMode && currentMetadata) {
      let configObject: Record<string, unknown> = {};
      try {
        configObject = currentMetadata.defaultConfiguration
          ? JSON.parse(currentMetadata.defaultConfiguration)
          : {};
      } catch {
        configObject = {};
      }

      currentMetadata.parameters?.forEach((param) => {
        if (
          param.type === "array" &&
          configObject[param.name || ""] === undefined
        ) {
          configObject[param.name || ""] = param.defaultValue || [];
        }
      });

      form.reset({
        isEnabled: true,
        issueType: client.ConfigurationIssueType.Recommendation,
        messageTemplate: currentMetadata.defaultMessageTemplate || "",
        fixDescription: currentMetadata.defaultFixDescription || "",
        ...configObject,
      });
    }
  }, [selectedRuleType, isEditMode, currentMetadata, form]);

  const handleFormSubmit = (data: FormData) => {
    if (!isEditMode && !selectedRuleType) return;

    const resolvedRuleType = isEditMode
      ? rule?.ruleType
      : selectedRuleType || undefined;
    if (!resolvedRuleType) return;

    const resolvedResourceType = isEnumValue(
      client.ConfigurationResourceType,
      currentMetadata?.resourceType
    )
      ? currentMetadata?.resourceType
      : rule?.resourceType;
    if (!resolvedResourceType) return;

    const configFields: Record<string, unknown> = {};
    currentMetadata?.parameters?.forEach((param) => {
      const paramName = param.name || "";
      if (data[paramName as keyof FormData] !== undefined) {
        configFields[paramName] = data[paramName as keyof FormData];
      }
    });

    const finalData = rule
      ? new client.ConfigurationRuleDto(rule)
      : new client.ConfigurationRuleDto();

    finalData.id = rule?.id ?? 0;
    finalData.createdAt = rule?.createdAt ?? new Date();
    finalData.updatedAt = rule?.updatedAt;
    finalData.ruleType = resolvedRuleType;
    finalData.resourceType = resolvedResourceType;
    finalData.isEnabled = data.isEnabled;
    finalData.issueType = data.issueType;
    finalData.messageTemplate = data.messageTemplate;
    finalData.fixDescription = data.fixDescription || undefined;
    finalData.configuration =
      Object.keys(configFields).length > 0
        ? JSON.stringify(configFields)
        : undefined;

    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {currentMetadata && (
          <Alert>
            <AlertDescription>{currentMetadata.description}</AlertDescription>
          </Alert>
        )}

        {!isEditMode && (
          <div className="space-y-2">
            <Label>
              {t("ConfigurationRules.RuleType")}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRuleType || undefined}
              onValueChange={(value) => {
                if (isEnumValue(client.ConfigurationRuleType, value)) {
                  setSelectedRuleType(value);
                } else {
                  setSelectedRuleType("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("ConfigurationRules.SelectRuleType")}
                />
              </SelectTrigger>
              <SelectContent>
                {metadata?.map((meta) => {
                  const value = String(meta.ruleType);
                  return (
                    <SelectItem key={value} value={value}>
                      {meta.displayName} ({meta.resourceType})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {isDuplicate && (
              <Alert variant="destructive">
                <AlertDescription>
                  {t("ConfigurationRules.DuplicateRuleError")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {(isEditMode || selectedRuleType) && (
          <>
            <FormRow
              name="isEnabled"
              label={t("ConfigurationRules.Enabled")}
              type="switch"
            />

            <FormRow
              name="issueType"
              label={t("ConfigurationRules.IssueType")}
              required
              type="select"
              selectSettings={{
                options: [
                  { value: "Warning", label: t("ConfigurationRules.Warning") },
                  {
                    value: "Recommendation",
                    label: t("ConfigurationRules.Recommendation"),
                  },
                  { value: "Error", label: t("ConfigurationRules.Error") },
                ],
              }}
            />

            <FormRow
              name="messageTemplate"
              label={t("ConfigurationRules.MessageTemplate")}
              description={t("ConfigurationRules.MessageTemplateDescription")}
              required
              type="input"
              maxLength={500}
            />

            <FormRow
              name="fixDescription"
              label={t("ConfigurationRules.FixDescription")}
              description={t("ConfigurationRules.FixDescriptionDescription")}
              type="textarea"
              maxLength={1000}
            />
          </>
        )}

        {currentMetadata?.parameters &&
          currentMetadata.parameters.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">
                {t("ConfigurationRules.ConfigurationParameters")}
              </h3>
              {currentMetadata.parameters.map((param) => {
                const paramName = param.name || "";

                switch (param.type) {
                  case "string":
                    return (
                      <FormRow
                        key={paramName}
                        name={paramName}
                        label={param.displayName || paramName}
                        description={param.description}
                        required={param.required}
                        type="input"
                        placeholder={param.defaultValue?.toString()}
                      />
                    );

                  case "number":
                    return (
                      <FormRow
                        key={paramName}
                        name={paramName}
                        label={param.displayName || paramName}
                        description={`${param.description || ""} ${
                          param.minValue !== undefined &&
                          param.maxValue !== undefined
                            ? `(${param.minValue} - ${param.maxValue})`
                            : ""
                        }`}
                        required={param.required}
                        type="number"
                        placeholder={param.defaultValue?.toString()}
                        numberSettings={{
                          showFormattedTime: false,
                        }}
                      />
                    );

                  case "boolean":
                    return (
                      <FormRow
                        key={paramName}
                        name={paramName}
                        label={param.displayName || paramName}
                        description={param.description}
                        type="switch"
                      />
                    );

                  case "array":
                    return (
                      <FormRow
                        key={paramName}
                        name={paramName}
                        label={param.displayName || paramName}
                        description={param.description}
                        required={param.required}
                        type="inputWithTable"
                      />
                    );

                  default:
                    return null;
                }
              })}
            </div>
          )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isDuplicate || (!isEditMode && !selectedRuleType)}
          >
            {t("Actions.Save")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConfigurationRuleForm;
