import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslation } from "react-i18next";

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (label: string) => void;
}

const schema = z.object({
  label: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
}) => {
  const { t } = useTranslation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    onAddItem(data.label);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{t("Modals.AddCustomValue")}</DialogTitle>
        </DialogHeader>

        <div className="m-6">
          <Form {...form}>
            <form className="space-y-8">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Modals.Item")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Modals.Label")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                {t("Actions.Save")}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomItemModal;
