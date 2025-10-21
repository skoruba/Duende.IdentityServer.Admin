import { z } from "zod";
import { TFunction } from "i18next";

export const urlValidationSchema = (t: TFunction) =>
  z.string().url(t("Validation.UrlRequired"));
