import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shuffle,
  CalendarIcon,
  BadgeInfo,
  ClipboardCopy,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DualListSelectorAdapter from "@/components/ui/DualListSelectorAdapter";
import InputWithTable from "@/components/ui/inputwithtable";
import {
  FieldValues,
  Path,
  useFormContext,
  ControllerRenderProps,
  Control,
} from "react-hook-form";
import { Item } from "../ui/dualListselector";
import { toast } from "../ui/use-toast";
import {
  generateRandomClientId,
  generateRandomSharedSecret,
  RandomValues,
} from "@/helpers/CryptoHelper";
import {
  secondsToFormattedTime,
  secondsToFormattedTimeLabels,
} from "@/helpers/DateTimeHelper";
import { ZodType } from "zod";
import { SearchDropdown } from "../SearchDropdown/SearchDropdown";
import { useTranslation } from "react-i18next";

type TooltipFieldProps = {
  children: React.ReactNode;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
};

type SwitchFieldProps = {
  field: ControllerRenderProps;
  label: string;
  description?: string;
  required: boolean;
};

type InputFieldProps = {
  field: ControllerRenderProps;
  placeholder?: string;
  generateRandomValue: RandomValues;
  copyToClipboard?: boolean;
};

type TextareaFieldProps = {
  field: ControllerRenderProps;
  placeholder?: string;
};

type SelectFieldProps = {
  field: ControllerRenderProps;
  options: { value: string; label: string }[];
};

type DualListFieldProps = {
  field: ControllerRenderProps;
  control: Control;
  initialItems: Item[];
};

type DateFieldProps = {
  field: ControllerRenderProps;
};

type TimeFieldProps = {
  field: ControllerRenderProps;
};

type NumberFieldProps = {
  field: ControllerRenderProps;
  placeholder?: string;
  showFormattedTime?: boolean;
};

type InputWithTableFieldProps = {
  field: ControllerRenderProps;
  validationSchema?: ZodType;
  search?: boolean;
  searchDataSource?: { id: string; name: string }[];
};

type SearchDropdownFieldProps = {
  field: ControllerRenderProps;
  items: { id: string; name: string }[];
};

export const TooltipField: React.FC<TooltipFieldProps> = ({
  children,
  description,
  side = "right",
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} maxWidth="600px">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SwitchField: React.FC<SwitchFieldProps> = ({
  field,
  label,
  description,
  required,
}) => (
  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
    <div className="space-y-0.5">
      <div className="flex items-center">
        <FormLabel required={required}>{label}</FormLabel>
        {description && (
          <TooltipField description={description}>
            <BadgeInfo
              className="ml-2 text-muted-foreground cursor-pointer"
              size={16}
            />
          </TooltipField>
        )}
      </div>
    </div>
    <FormControl>
      <Switch checked={field.value} onCheckedChange={field.onChange} />
    </FormControl>
  </FormItem>
);

const InputField: React.FC<InputFieldProps> = ({
  field,
  placeholder,
  generateRandomValue,
  copyToClipboard,
}) => {
  const { t } = useTranslation();

  const handleCopyToClipboard = () => {
    if (field.value) {
      navigator.clipboard.writeText(field.value).then(() => {
        toast({
          title: t("Components.FormRow.CopiedToClipboard"),
          description: field.value,
        });
      });
    }
  };

  const handleRandomValue = () => {
    if (generateRandomValue === RandomValues.SharedSecret) {
      field.onChange(generateRandomSharedSecret());
    } else if (generateRandomValue === RandomValues.ClientId) {
      field.onChange(generateRandomClientId());
    }
  };

  return (
    <FormControl>
      <div className={generateRandomValue ? "flex" : ""}>
        <Input placeholder={placeholder} {...field} autoComplete="off" />
        {[RandomValues.ClientId, RandomValues.SharedSecret].includes(
          generateRandomValue
        ) && (
          <Button
            type="button"
            onClick={handleRandomValue}
            className="ms-1"
            variant="outline"
          >
            <Shuffle />
          </Button>
        )}
        {copyToClipboard && (
          <Button
            type="button"
            variant={"outline"}
            onClick={handleCopyToClipboard}
            className="ms-1"
            disabled={!field.value}
          >
            <ClipboardCopy />
          </Button>
        )}
      </div>
    </FormControl>
  );
};

const TextareaField: React.FC<TextareaFieldProps> = ({
  field,
  placeholder,
}) => (
  <FormControl>
    <Textarea placeholder={placeholder} {...field} className="resize-none" />
  </FormControl>
);

const SelectField: React.FC<SelectFieldProps> = ({ field, options }) => {
  const { t } = useTranslation();

  return (
    <FormControl>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
        value={field.value}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("Components.FormRow.SelectOption")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormControl>
  );
};

const DualListField: React.FC<DualListFieldProps> = ({
  field,
  control,
  initialItems,
}) => (
  <FormControl>
    <DualListSelectorAdapter
      control={control}
      initialItems={initialItems}
      name={field.name}
    />
  </FormControl>
);

const DateField: React.FC<DateFieldProps> = ({ field }) => {
  const { t } = useTranslation();

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
  };

  return (
    <FormControl>
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full pl-3 pr-10 justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>{t("Components.FormRow.PickDate")}</span>
              )}

              <CalendarIcon className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />

              {field.value && (
                <span
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value ?? undefined}
            onSelect={field.onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormControl>
  );
};

const TimeField: React.FC<TimeFieldProps> = ({ field }) => (
  <FormControl>
    <Input
      type="time"
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      className="w-full"
    />
  </FormControl>
);

const NumberField: React.FC<NumberFieldProps> = ({
  field,
  placeholder,
  showFormattedTime = true,
}) => (
  <>
    <FormControl>
      <Input
        type="number"
        value={field.value ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          field.onChange(value === "" ? undefined : Number(value));
        }}
        onBlur={field.onBlur}
        ref={field.ref}
        className="w-full"
        placeholder={placeholder}
      />
    </FormControl>
    {showFormattedTime && field.value !== undefined && (
      <FormDescription className="ms-2">
        {secondsToFormattedTime({
          seconds: field.value,
          labels: secondsToFormattedTimeLabels,
        })}
      </FormDescription>
    )}
  </>
);

const InputWithTableField: React.FC<InputWithTableFieldProps> = ({
  field,
  validationSchema,
  search,
  searchDataSource,
}) => (
  <FormControl>
    <InputWithTable
      value={field.value}
      onChange={field.onChange}
      validationSchema={validationSchema}
      search={search}
      searchDataSource={searchDataSource}
    />
  </FormControl>
);

const SearchDropdownField: React.FC<SearchDropdownFieldProps> = ({
  field,
  items,
}) => (
  <FormControl>
    <SearchDropdown
      items={items}
      value={field.value}
      onChange={field.onChange}
    />
  </FormControl>
);

type FormRowProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
  placeholder?: string;
  type?:
    | "input"
    | "textarea"
    | "switch"
    | "select"
    | "dualList"
    | "inputWithTable"
    | "date"
    | "time"
    | "number"
    | "searchDropdown";
  selectSettings?: {
    options?: { value: string; label: string }[];
  };
  inputSettings?: {
    copyToClipboard?: boolean;
    generateRandomValue?: RandomValues;
  };
  dualListSettings?: {
    initialItems?: Item[];
  };
  searchDropdownSettings?: {
    items: { id: string; name: string }[];
  };
  inputWithTableSettings?: {
    search?: boolean;
    searchDataSource?: { id: string; name: string }[];
    validationSchema?: ZodType;
  };
  includeSeparator?: boolean;
  numberSettings?: {
    showFormattedTime?: boolean;
  };
};

export const FormRow = <T extends FieldValues>({
  name,
  label,
  description,
  placeholder,
  className,
  required = false,
  type = "input",
  selectSettings: { options } = { options: [] },
  inputSettings: {
    copyToClipboard = false,
    generateRandomValue = RandomValues.None,
  } = {},
  dualListSettings: { initialItems } = { initialItems: [] },
  searchDropdownSettings: { items } = { items: [] },
  includeSeparator = false,
  inputWithTableSettings: { validationSchema, search, searchDataSource } = {
    validationSchema: undefined,
    search: false,
    searchDataSource: [],
  },
  numberSettings: { showFormattedTime = true } = {},
}: FormRowProps<T>) => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <>
            {type === "switch" ? (
              <SwitchField
                field={field}
                label={label}
                description={description}
                required={required}
              />
            ) : (
              <FormItem className={className}>
                <div className="flex items-center mt-4">
                  <FormLabel required={required}>{label}</FormLabel>
                  {description && (
                    <TooltipField description={description}>
                      <BadgeInfo
                        className="ml-2 text-muted-foreground cursor-pointer"
                        size={16}
                      />
                    </TooltipField>
                  )}
                </div>
                {type === "input" && (
                  <InputField
                    field={field}
                    placeholder={placeholder}
                    generateRandomValue={generateRandomValue}
                    copyToClipboard={copyToClipboard}
                  />
                )}
                {type === "textarea" && (
                  <TextareaField field={field} placeholder={placeholder} />
                )}
                {type === "select" && (
                  <SelectField field={field} options={options!} />
                )}
                {type === "dualList" && (
                  <DualListField
                    field={field}
                    control={control}
                    initialItems={initialItems!}
                  />
                )}
                {type === "searchDropdown" && (
                  <SearchDropdownField field={field} items={items!} />
                )}
                {type === "date" && <DateField field={field} />}
                {type === "time" && <TimeField field={field} />}
                {type === "number" && (
                  <NumberField
                    field={field}
                    placeholder={placeholder}
                    showFormattedTime={showFormattedTime}
                  />
                )}
                {type === "inputWithTable" && (
                  <InputWithTableField
                    field={field}
                    validationSchema={validationSchema}
                    search={search}
                    searchDataSource={searchDataSource}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          </>
        )}
      />
      {includeSeparator && <hr className="my-4" />}
    </>
  );
};
