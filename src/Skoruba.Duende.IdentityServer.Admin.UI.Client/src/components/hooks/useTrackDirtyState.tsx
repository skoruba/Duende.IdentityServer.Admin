import { useDirtyGuard } from "@/contexts/DirtyGuardContext";
import { useEffect } from "react";
import {
  UseFormReturn,
  FieldValues,
  Path,
  PathValue,
  FieldErrors,
} from "react-hook-form";

export const useTrackErrorState = (
  onValidation: (hasError: boolean) => void,
  errors: FieldErrors,
  values: any
) => {
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    onValidation(hasErrors);
  }, [values, onValidation, errors]);
};

export const useDirtyReset = <T extends {}>(
  form: UseFormReturn<T>,
  formData: T | undefined,
  defaultValues: T
) => {
  useEffect(() => {
    if (!formData) {
      return;
    }

    const schemaKeys = Object.keys(defaultValues) as (keyof T)[];

    schemaKeys.forEach((key) => {
      const value = formData[key];

      if (value !== undefined) {
        form.setValue(
          key as unknown as Path<T>,
          value as PathValue<T, Path<T>>,
          {
            shouldDirty: true,
          }
        );
      }
    });
  }, [formData, form, defaultValues]);
};

export const useDirtyFormState = <T extends FieldValues>(
  form: UseFormReturn<T>,
  key: string
) => {
  const { setDirty } = useDirtyGuard();
  useEffect(() => {
    setDirty(key, form.formState.isDirty);
  }, [form.formState.isDirty, setDirty, key]);
};
