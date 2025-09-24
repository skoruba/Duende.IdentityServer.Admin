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
    <ol className="flex items-center w-full text-xs font-medium sm:text-base">
      {steps.map((st, index) => {
        const isPast = st.step < step;
        const isCurrent = st.step === step;
        const isFuture = st.step > step;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={st.step}
            className={cx(
              "flex relative",
              { "w-full": !isLast },
              !isLast &&
                "after:content-[''] after:w-full after:h-0.5 after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-4",
              !isLast && (isPast ? "after:bg-primary" : "after:bg-muted")
            )}
          >
            <div className="block whitespace-nowrap z-10">
              <span
                className={cx(
                  "w-6 h-6 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-10 lg:h-10 border",
                  isPast &&
                    "bg-primary text-primary-foreground border-transparent",
                  isCurrent &&
                    !stepHasError &&
                    "bg-primary text-primary-foreground border-2 border-primary",
                  isCurrent &&
                    stepHasError &&
                    "bg-destructive text-destructive-foreground border-2 border-destructive",
                  isFuture &&
                    "bg-muted text-muted-foreground border-muted-foreground/20"
                )}
              >
                {isPast ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent && stepHasError ? (
                  <X className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </span>

              <span
                className={cx(
                  isPast && "text-foreground",
                  isCurrent && !stepHasError && "text-foreground",
                  isCurrent && stepHasError && "text-destructive",
                  isFuture && "text-muted-foreground"
                )}
              >
                {st.name}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ActiveStepper;
