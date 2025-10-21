import { useState, useEffect } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

type Item = {
  id: string;
  name: string;
};

type SearchDropdownProps = {
  items: Item[];
  value?: string;
  onChange: (searchTerm: string) => void;
  inputProps?: InputProps;
};

export function SearchDropdown({
  items,
  value = "",
  onChange,
  inputProps,
}: SearchDropdownProps) {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredItems = searchTerm
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const handleChange = (value: string) => {
    setSearchTerm(value);
    onChange(value);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2 mb-2">
        <Input
          type="text"
          placeholder={t("Components.SearchDropdown.Search")}
          value={searchTerm}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          {...inputProps}
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <ScrollArea className="h-[320px]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  handleChange(item.name);
                  setIsOpen(false);
                }}
              >
                <span>{item.name}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
