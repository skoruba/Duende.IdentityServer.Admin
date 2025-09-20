import { Step } from "@/models/Step";
import cx from "classnames";
import { Check, X } from "lucide-react";

type ActiveStepperProps = {
  step: number;
  steps: Step[];
  stepHasError: boolean;
};

const ActiveStepper = ({ step, steps, stepHasError }: ActiveStepperProps) => {
  return (
    <ol className="flex items-center w-full text-xs text-gray-900 font-medium sm:text-base">
      {steps.map((st, index) => (
        <li
          key={st.step}
          className={cx("flex relative", {
            "w-full": index !== steps.length - 1,
            "text-black dark:text-white": st.step <= step,
            "text-gray-500 dark:text-gray-400": st.step > step,
            "after:content-[''] after:w-full after:h-0.5 after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-4":
              index !== steps.length - 1,
            "after:bg-gray-300 dark:after:bg-gray-600": st.step >= step,
            "after:bg-black dark:after:bg-white": st.step < step,
          })}
        >
          <div className="block whitespace-nowrap z-10">
            <span
              className={cx(
                "w-6 h-6 border rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-10 lg:h-10",
                {
                  "bg-black text-white dark:bg-white dark:text-black border-transparent":
                    st.step === step && !stepHasError,
                  "bg-destructive text-white dark:bg-destructive dark:text-white border-transparent":
                    st.step === step && stepHasError,
                  "bg-white dark:bg-gray-800 border-black dark:border-white":
                    st.step < step,
                  "bg-gray-50 dark:bg-gray-900 border-gray-200": st.step > step,
                  "border-2": st.step === step,
                  "border border-gray-300 dark:border-gray-600": st.step > step,
                }
              )}
            >
              {st.step < step ? (
                <Check className="w-4 h-4 text-black dark:text-white" />
              ) : st.step === step && stepHasError ? (
                <X className="w-4 h-4 text-white dark:text-white" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cx({
                "text-destructive": st.step === step && stepHasError,
              })}
            >
              {st.name}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default ActiveStepper;
