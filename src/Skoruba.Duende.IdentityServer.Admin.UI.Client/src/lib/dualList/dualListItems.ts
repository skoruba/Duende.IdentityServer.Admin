import type { Item } from "@/components/ui/dualListselector";

/**
 * Every item the selector knows about, selected or not. A deselected item only
 * fills a gap - one that is known from elsewhere keeps its label and position.
 */
export const mergeDualListItems = (
  initialItems: Item[],
  selectedItems: Item[],
  customItems: Item[],
  deselectedItems: Item[],
): Item[] => {
  const merged = new Map<string, Item>();

  [...initialItems, ...selectedItems, ...customItems].forEach((item) => {
    merged.set(item.id, item);
  });

  deselectedItems.forEach((item) => {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
};

/**
 * Remembers the items that have just left the selection. A selected item does not
 * have to be among the offered ones, so without this it would vanish from both
 * lists and could not be selected again.
 */
export const rememberDeselectedItems = (
  deselectedItems: Item[],
  previousSelected: Item[],
  nextSelected: Item[],
): Item[] => {
  const removed = previousSelected.filter(
    (item) =>
      !nextSelected.some((next) => next.id === item.id) &&
      !deselectedItems.some((known) => known.id === item.id),
  );

  return removed.length > 0 ? [...deselectedItems, ...removed] : deselectedItems;
};
