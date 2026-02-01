import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

interface IFormContext<T> {
  formData: T;
  setFormData: Dispatch<SetStateAction<T>>;
  setFormSubmitted: Dispatch<SetStateAction<boolean>>;
  setFormSubmitting: Dispatch<SetStateAction<boolean>>;
  resetForm: () => void;
  onHandleBack: () => void;
  onHandleNext: () => void;
  setActiveStep: (step: number) => void;
  step: number;
  steps: number[];
  formSubmitted: boolean;
  formSubmitting: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormContext = createContext<IFormContext<any>>({
  formData: {},
  onHandleBack: () => {},
  onHandleNext: () => {},
  setFormData: () => {},
  resetForm: () => {},
  setFormSubmitted: () => {},
  setFormSubmitting: () => {},
  setActiveStep: () => {},
  step: 0,
  steps: [],
  formSubmitted: false,
  formSubmitting: false,
});

interface IProps<T> {
  children: ReactNode;
  initialFormData: T;
  steps: number[];
}

export function FormProvider<T>({
  children,
  initialFormData,
  steps,
}: IProps<T>) {
  const [formData, setFormData] = useState<T>(initialFormData);
  const [stepIndex, setStepIndex] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const onHandleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onHandleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const setActiveStep = (step: number) => {
    const index = steps.indexOf(step);
    if (index !== -1) {
      setStepIndex(index);
    }
  };

  const resetForm = () => {
    setStepIndex(0);
    setFormData(initialFormData);
    setFormSubmitted(false);
    setFormSubmitting(false);
  };

  return (
    <FormContext.Provider
      value={{
        setActiveStep,
        formData,
        setFormData,
        onHandleBack,
        onHandleNext,
        resetForm,
        step: steps[stepIndex],
        steps,
        formSubmitted,
        setFormSubmitted,
        formSubmitting,
        setFormSubmitting,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormState<T>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  return context as IFormContext<T>;
}
