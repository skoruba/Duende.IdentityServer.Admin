import React from "react";
import { Controller, Control } from "react-hook-form";
import DualListSelector, { Item } from "./dualListselector";

interface DualListSelectorAdapterProps {
  control: Control;
  name: string;
  initialItems: Item[];
  initialSelectedItems?: Item[];
}

const DualListSelectorAdapter: React.FC<DualListSelectorAdapterProps> = ({
  control,
  name,
  initialItems,
  initialSelectedItems = [],
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <DualListSelector
          initialItems={initialItems}
          initialSelectedItems={value || initialSelectedItems}
          onSelectedItemsChange={(newSelectedItems: Item[]) =>
            onChange(newSelectedItems)
          }
        />
      )}
    />
  );
};

export default DualListSelectorAdapter;
