import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimeValue } from "@/lib/errorLogs/errorLogFilters";

type DateTimeFilterProps = {
  label: string;
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
};

const DateTimeFilter = ({ label, value, onChange }: DateTimeFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-36 justify-start font-normal"
              aria-label={label}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.date ? (
                format(value.date, "dd.MM.yyyy")
              ) : (
                <span className="text-muted-foreground">
                  {t("ErrorLogs.AnyDate")}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={value.date}
              defaultMonth={value.date}
              onSelect={(date) => {
                setIsOpen(false);
                onChange({ date, time: date ? value.time : undefined });
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          step={60}
          className="w-28"
          aria-label={`${label} ${t("ErrorLogs.Time")}`}
          disabled={!value.date}
          value={value.time ?? ""}
          onChange={(e) =>
            onChange({ ...value, time: e.target.value || undefined })
          }
        />
        {value.date && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={t("ErrorLogs.ClearDate")}
            onClick={() => onChange({})}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DateTimeFilter;
