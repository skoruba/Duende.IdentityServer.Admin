"use client";

import * as React from "react";
import i18next from "i18next";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";

export function LanguageSelector() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("en");
  const { t } = useTranslation();

  const languages = [
    { value: "en", label: t("Footer.Languages.en"), flag: "🇬🇧" },
  ];

  React.useEffect(() => {
    const storedLang = localStorage.getItem("language");
    const initialLang = storedLang || i18next.language || "en";
    setValue(initialLang);
    i18next.changeLanguage(initialLang);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setValue(newLang);
    i18next.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? (
            <>
              <span className="mr-2">
                {languages.find((lang) => lang.value === value)?.flag}
              </span>
              {languages.find((lang) => lang.value === value)?.label}
            </>
          ) : (
            t("Footer.Languages.SelectLanguage")
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>{t("Footer.Languages.NotFound")}</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={() => handleLanguageChange(language.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{language.flag}</span>
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
