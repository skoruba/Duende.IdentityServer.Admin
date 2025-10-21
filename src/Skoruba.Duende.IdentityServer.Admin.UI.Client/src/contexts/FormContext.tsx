import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";

// Define the generic interface for the form context
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
  steps: number[]; // Array of dynamic steps
  formSubmitted: boolean;
  formSubmitting: boolean;
}

// Create a generic context with default values
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
  steps: [], // Default to an empty array
  formSubmitted: false,
  formSubmitting: false,
});

// Define the provider with a generic type
interface IProps<T> {
  children: ReactNode;
  initialFormData: T;
  steps: number[]; // Array of steps (e.g., [1, 3, 4, 5])
}

export function FormProvider<T>({
  children,
  initialFormData,
  steps,
}: IProps<T>) {
  const [formData, setFormData] = useState<T>(initialFormData);
  const [stepIndex, setStepIndex] = useState(0); // Track current index in the steps array
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const onHandleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1)); // Move to the next step
  };

  const onHandleBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0)); // Move to the previous step
  };

  const setActiveStep = (step: number) => {
    const index = steps.indexOf(step);
    if (index !== -1) {
      setStepIndex(index); // Update stepIndex if the step exists
    }
  };

  const resetForm = () => {
    setStepIndex(0); // Reset to the first step
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
        step: steps[stepIndex], // Current step based on the index
        steps, // Provide the full array of steps
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

// Hook to use form state
export function useFormState<T>() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  return context as IFormContext<T>;
}
