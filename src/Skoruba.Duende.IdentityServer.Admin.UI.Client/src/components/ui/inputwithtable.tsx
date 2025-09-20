import React, { useState, useEffect } from "react";
import { z, ZodType } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "./dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Input } from "./input";
import { SearchDropdown } from "../SearchDropdown/SearchDropdown";
import { useTranslation } from "react-i18next";

const InputWithTable: React.FC<{
  value: string[];
  onChange: (items: string[]) => void;
  validationSchema?: ZodType;
  search?: boolean;
  searchDataSource?: { id: string; name: string }[];
}> = ({
  value,
  onChange,
  validationSchema,
  search = false,
  searchDataSource = [],
}) => {
  const { t } = useTranslation();

  const [items, setItems] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  useEffect(() => {
    setItems(value);
  }, [value]);

  const validateItem = (value: string): string | null => {
    const schema =
      validationSchema ||
      z.string().min(1, t("Components.InputWithTable.ItemCannotBeEmpty"));
    const validationResult = schema.safeParse(value);
    return validationResult.success
      ? null
      : validationResult.error.errors[0].message;
  };

  const handleAddItem = () => {
    const error = validateItem(inputValue);
    if (error) {
      setInputError(error);
      return;
    }
    const updatedItems = [...items, inputValue];
    setItems(updatedItems);
    onChange(updatedItems);
    setInputValue("");
    setInputError(null);
  };

  const handleEditItem = () => {
    if (editIndex === null) return;
    const error = validateItem(editValue);
    if (error) {
      setDialogError(error);
      return;
    }
    const updatedItems = [...items];
    updatedItems[editIndex] = editValue;
    setItems(updatedItems);
    onChange(updatedItems);
    setEditValue("");
    setEditIndex(null);
    setDialogError(null);
  };

  const handleDelete = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    setItems(updatedItems);
    onChange(updatedItems);
  };

  return (
    <div>
      <div className="flex">
        {search ? (
          <SearchDropdown
            items={searchDataSource}
            value={inputValue}
            onChange={(value) => setInputValue(value)}
          />
        ) : (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("Components.InputWithTable.EnterItem")}
            className={inputError ? "input-error" : ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
        )}
        <Button
          onClick={handleAddItem}
          type="button"
          className="ms-1"
          variant="outline"
        >
          {t("Components.InputWithTable.AddItem")}
        </Button>
      </div>
      <div>
        <p className="text-sm font-medium text-destructive mt-2">
          {inputError}
        </p>
      </div>
      {items.length !== 0 && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Components.InputWithTable.Item")}</TableHead>
                <TableHead>{t("Components.InputWithTable.Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      className="me-2"
                      variant="secondary"
                      onClick={() => {
                        setEditIndex(index);
                        setEditValue(item);
                      }}
                    >
                      {t("Actions.Edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(index)}
                      type="button"
                    >
                      {t("Actions.Delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {editIndex !== null && (
        <Dialog open={editIndex !== null}>
          <DialogContent>
            <DialogTitle>{t("Components.InputWithTable.Edit")}</DialogTitle>
            <DialogDescription>
              {t("Components.InputWithTable.UpdateSave")}
            </DialogDescription>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={t("Components.InputWithTable.EditItem")}
            />
            {dialogError && (
              <p className="text-sm font-medium text-destructive mt-2">
                {dialogError}
              </p>
            )}
            <DialogFooter>
              <Button onClick={handleEditItem}>{t("Actions.Save")}</Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  onClick={() => {
                    setEditIndex(null);
                    setEditValue("");
                    setDialogError(null);
                  }}
                >
                  {t("Actions.Cancel")}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InputWithTable;
