import React from "react";
import { Controller, Control } from "react-hook-form";
import DualListSelector, {
  DualListSelectorProps,
  Item,
} from "./dualListselector";

export type DualListSettings = Omit<
  DualListSelectorProps,
  "initialSelectedItems" | "onSelectedItemsChange"
>;

interface DualListSelectorAdapterProps extends DualListSettings {
  control: Control;
  name: string;
  initialSelectedItems?: Item[];
}

const DualListSelectorAdapter: React.FC<DualListSelectorAdapterProps> = ({
  control,
  name,
  initialSelectedItems = [],
  ...settings
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <DualListSelector
          {...settings}
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
