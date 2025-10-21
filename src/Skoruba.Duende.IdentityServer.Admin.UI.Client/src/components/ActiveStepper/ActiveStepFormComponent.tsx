import { useFormState } from "@/contexts/FormContext";
import { Step } from "@/models/Step";
import React from "react";

type ActiveStepFormComponentProps = {
  steps: Step[];
};

const ActiveStepFormComponent = ({ steps }: ActiveStepFormComponentProps) => {
  const { step } = useFormState();

  return steps.map((st) =>
    st.step === step ? (
      <React.Fragment key={st.step}>{st.component}</React.Fragment>
    ) : null
  );
};

export default ActiveStepFormComponent;
