import React, { useEffect, useMemo } from "react";
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

interface ConfigurationRuleFormProps {
  rule: client.ConfigurationRuleDto | null;
  existingRules: client.ConfigurationRuleDto[];
  metadata: client.ConfigurationRuleMetadataDto[];
  onSubmit: (data: any) => void;
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
  const [selectedRuleType, setSelectedRuleType] = React.useState<string>("");

  // Get current metadata based on selected or existing rule type
  const currentMetadata = metadata?.find(
    (m) => String(m.ruleType) === (selectedRuleType || String(rule?.ruleType))
  );

  // Check for duplicate rule type
  const isDuplicate =
    !isEditMode &&
    selectedRuleType &&
    existingRules.some((r) => String(r.ruleType) === selectedRuleType);

  // Build dynamic schema based on current metadata
  const buildSchema = () => {
    const baseSchema = {
      isEnabled: z.boolean(),
      issueType: z.enum(["Warning", "Recommendation", "Error"]),
      messageTemplate: z.string().min(1, t("Validation.Required")),
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
          parameterFields[paramName] = param.required
            ? z.string().min(1, t("Validation.Required"))
            : z.string().optional();
          break;

        case "number":
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
          break;

        case "boolean":
          parameterFields[paramName] = z.boolean();
          break;

        case "array":
          parameterFields[paramName] = param.required
            ? z.array(z.string()).min(1, t("Validation.AtLeastOneItem"))
            : z.array(z.string()).optional();
          break;
      }
    });

    return z.object({
      ...baseSchema,
      ...parameterFields,
    });
  };

  const schema = useMemo(() => buildSchema(), [currentMetadata]);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  // Initialize form when rule changes
  useEffect(() => {
    if (rule && isEditMode) {
      setSelectedRuleType(String(rule.ruleType));

      // Parse configuration JSON
      let configObject: any = {};
      try {
        configObject = rule.configuration ? JSON.parse(rule.configuration) : {};
      } catch {
        configObject = {};
      }

      // Initialize array parameters with empty arrays if not present
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
        issueType: String(rule.issueType) as any,
        messageTemplate: rule.messageTemplate || "",
        fixDescription: rule.fixDescription || "",
        ...configObject,
      });
    } else if (!rule && !selectedRuleType) {
      // Only reset when opening a new form (not when user is selecting a rule type)
      form.reset({
        isEnabled: true,
        issueType: "Recommendation" as any,
        messageTemplate: "",
        fixDescription: "",
      });
    }
  }, [rule, isEditMode]);

  // Update form when rule type changes (add new mode)
  useEffect(() => {
    if (selectedRuleType && !isEditMode && currentMetadata) {
      let configObject: any = {};
      try {
        configObject = currentMetadata.defaultConfiguration
          ? JSON.parse(currentMetadata.defaultConfiguration)
          : {};
      } catch {
        configObject = {};
      }

      // Initialize array parameters with empty arrays if not present
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
        issueType: "Recommendation" as any,
        messageTemplate: currentMetadata.defaultMessageTemplate || "",
        fixDescription: currentMetadata.defaultFixDescription || "",
        ...configObject,
      });
    }
  }, [selectedRuleType, isEditMode, currentMetadata]);

  const handleFormSubmit = (data: FormData) => {
    // Extract configuration parameters
    const configFields: Record<string, any> = {};
    currentMetadata?.parameters?.forEach((param) => {
      const paramName = param.name || "";
      if (data[paramName as keyof FormData] !== undefined) {
        configFields[paramName] = data[paramName as keyof FormData];
      }
    });

    const finalData: client.ConfigurationRuleDto = {
      ...rule,
      ruleType: (isEditMode
        ? rule?.ruleType
        : selectedRuleType) as unknown as client.ConfigurationRuleType,
      resourceType: currentMetadata?.resourceType as any,
      isEnabled: data.isEnabled,
      issueType: data.issueType as any,
      messageTemplate: data.messageTemplate,
      fixDescription: data.fixDescription || null,
      configuration:
        Object.keys(configFields).length > 0
          ? JSON.stringify(configFields)
          : null,
    } as client.ConfigurationRuleDto;

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
              onValueChange={setSelectedRuleType}
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
            />

            <FormRow
              name="fixDescription"
              label={t("ConfigurationRules.FixDescription")}
              description={t("ConfigurationRules.FixDescriptionDescription")}
              type="textarea"
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
