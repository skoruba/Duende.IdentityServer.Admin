import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormState } from "@/contexts/FormContext";
import ActiveStepper from "@/components/ActiveStepper/ActiveStepper";
import ActiveStepFormComponent from "@/components/ActiveStepper/ActiveStepFormComponent";
import cx from "classnames";
import { useClientWizard } from "@/contexts/ClientWizardContext";
import { CLIENT_WIZARD_CONFIG } from "@/config/ClientWizardConfig";
import { ClientStepType } from "@/models/Clients/ClientModels";
import { useTranslation } from "react-i18next";
import { useDirtyGuard } from "@/contexts/DirtyGuardContext";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";

const ClientWizardModal = () => {
  const { stepErrors, clientType, toggleModal, isOpen } = useClientWizard();
  const { isAnyDirty, reset: resetDirty } = useDirtyGuard();

  const { DialogCmp, confirm } = useConfirmUnsavedChanges(isAnyDirty);

  if (clientType === undefined) {
    return null;
  }

  const config = CLIENT_WIZARD_CONFIG[clientType];

  const steps = config.steps.map(({ stepType, component: StepComponent }) => ({
    name: ClientStepType[stepType],
    step: stepType,
    component: <StepComponent />,
  }));

  const { step, resetForm } = useFormState();
  const { t } = useTranslation();

  const dialogClass = "sm:max-w-[900px] max-h-[calc(100vh-2rem)]";
  const reviewDialogClass = "max-w-full h-full";

  const isReviewStep = step === steps[steps.length - 1].step;

  const handleClose = async (open: boolean) => {
    if (open) {
      toggleModal(open);
      return;
    }
    if (isAnyDirty) {
      const confirmed = await confirm();
      if (confirmed) {
        toggleModal(false);
        resetForm();
        resetDirty();
      }
    } else {
      toggleModal(open);
      resetForm();
      resetDirty();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className={cx(
            "overflow-auto transition-all duration-500 ease-in-out",
            isReviewStep ? reviewDialogClass : dialogClass
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {isReviewStep
                ? t("Client.Wizard.ReviewSubmit")
                : t("Client.Wizard.NewClient")}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {isReviewStep
              ? t("Client.Wizard.ReviewClientDetails")
              : t("Client.Wizard.CreateNewClientDescription")}
          </DialogDescription>
          {!isReviewStep && (
            <div className="m-3">
              <ActiveStepper
                steps={steps}
                step={step}
                stepHasError={stepErrors}
              />
            </div>
          )}
          <div className="m-3">
            <ActiveStepFormComponent steps={steps} />
          </div>
        </DialogContent>
      </Dialog>
      {DialogCmp}
    </>
  );
};

export default ClientWizardModal;
