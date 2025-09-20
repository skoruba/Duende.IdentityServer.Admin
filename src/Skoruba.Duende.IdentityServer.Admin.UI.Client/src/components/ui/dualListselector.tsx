import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ArrowRight, PlusCircle } from "lucide-react";
import { Separator } from "./separator";
import CustomItemModal from "@/pages/Client/CustomItemModal";
import { useToast } from "@/components/ui/use-toast";

export interface Item {
  id: string;
  label: string;
}

interface DualListSelectorProps {
  initialItems: Item[];
  initialSelectedItems?: Item[];
  onSelectedItemsChange?: (selectedItems: Item[]) => void;
}

const DualListSelector: React.FC<DualListSelectorProps> = ({
  initialItems,
  initialSelectedItems = [],
  onSelectedItemsChange,
}) => {
  const { toast } = useToast();

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] =
    useState<Item[]>(initialSelectedItems);
  const [searchTermLeft, setSearchTermLeft] = useState("");
  const [searchTermRight, setSearchTermRight] = useState("");
  const [isModalOpened, setIsModalOpened] = useState(false);

  // Dynamická aktualizace allItems při změně initialItems
  useEffect(() => {
    const customItems = allItems.filter(
      (item) =>
        !initialItems.some((i) => i.id === item.id) &&
        !selectedItems.some((s) => s.id === item.id)
    );

    const merged = [
      ...initialItems,
      ...selectedItems.filter(
        (item) => !initialItems.some((i) => i.id === item.id)
      ),
      ...customItems,
    ];

    setAllItems(merged);
  }, [initialItems, selectedItems]);

  // Aktualizuj selectedItems při změně zvenku
  useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  const notifySelectedItemsChange = (newSelected: Item[]) => {
    setSelectedItems(newSelected);
    onSelectedItemsChange?.(newSelected);
  };

  const moveToRight = (item: Item) => {
    if (!selectedItems.find((i) => i.id === item.id)) {
      notifySelectedItemsChange([...selectedItems, item]);
    }
  };

  const moveToLeft = (item: Item) => {
    notifySelectedItemsChange(selectedItems.filter((i) => i.id !== item.id));
  };

  const addCustomItem = (label: string) => {
    const newItem: Item = { id: label, label };

    const existsInSelected = selectedItems.some((i) => i.id === label);
    if (existsInSelected) {
      toast({
        variant: "destructive",
        title: `Item "${label}" is already selected`,
      });
      return;
    }

    const existsInAll = allItems.some((i) => i.id === label);
    if (!existsInAll) {
      setAllItems((prev) => [...prev, newItem]);
    }

    notifySelectedItemsChange([...selectedItems, newItem]);
    toast({ title: `Item "${label}" has been added` });
  };

  const selectAll = () => {
    const toSelect = allItems.filter(
      (item) => !selectedItems.find((i) => i.id === item.id)
    );
    notifySelectedItemsChange([...selectedItems, ...toSelect]);
  };

  const deselectAll = () => {
    notifySelectedItemsChange([]);
  };

  const leftItems = useMemo(
    () =>
      allItems.filter(
        (item) => !selectedItems.some((sel) => sel.id === item.id)
      ),
    [allItems, selectedItems]
  );

  const filteredLeft = useMemo(
    () =>
      leftItems.filter((item) =>
        item.label.toLowerCase().includes(searchTermLeft.toLowerCase())
      ),
    [leftItems, searchTermLeft]
  );

  const filteredRight = useMemo(
    () =>
      selectedItems.filter((item) =>
        item.label.toLowerCase().includes(searchTermRight.toLowerCase())
      ),
    [selectedItems, searchTermRight]
  );

  return (
    <div className="flex w-full gap-x-4">
      {/* LEFT */}
      <div className="flex flex-col basis-1/2 overflow-hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={selectAll}
          className="mb-2"
        >
          Select All
        </Button>
        <Input
          value={searchTermLeft}
          onChange={(e) => setSearchTermLeft(e.target.value)}
          placeholder="Search..."
        />
        <Separator className="mt-6" />
        <div className="flex-grow overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeft.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="truncate">{item.label}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => moveToRight(item)}
                    >
                      <ArrowRight />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col basis-1/2 overflow-hidden pl-2">
        <Button
          type="button"
          onClick={deselectAll}
          variant="destructive"
          className="mb-2"
        >
          Deselect All
        </Button>
        <Input
          value={searchTermRight}
          onChange={(e) => setSearchTermRight(e.target.value)}
          placeholder="Search..."
        />
        <Separator className="mt-6" />
        <div className="flex-grow overflow-auto max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="flex justify-end">
                  <Button
                    onClick={() => setIsModalOpened(true)}
                    variant="secondary"
                    className="ms-4 mt-1"
                    type="button"
                  >
                    <PlusCircle className="w-5 h-5 me-1" /> Add
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRight.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => moveToLeft(item)}
                      type="button"
                    >
                      <ArrowLeft />
                    </Button>
                  </TableCell>
                  <TableCell className="truncate">{item.label}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <CustomItemModal
          isOpen={isModalOpened}
          onClose={() => setIsModalOpened(false)}
          onAddItem={addCustomItem}
        />
      </div>
    </div>
  );
};

export default DualListSelector;
