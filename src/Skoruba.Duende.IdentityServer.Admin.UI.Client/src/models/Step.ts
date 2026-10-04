import type { JSX } from "react";

export type Step = {
  step: number;
  name: string;
  component: JSX.Element;
};
