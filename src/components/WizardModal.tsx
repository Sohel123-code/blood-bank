import React from "react";

type WizardStep<Data> = {
  label: string;
  render: (
    data: Data,
    setData: React.Dispatch<React.SetStateAction<Data>>,
    errors: Record<string, string>
  ) => React.ReactNode;
  validate?: (data: Data) => Record<string, string>;
};

type WizardModalProps<Data> = {
  isOpen: boolean;
  title: string;
  steps: WizardStep<Data>[];
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  submitLabel?: string;
};

const WizardModal = <Data,>({
  isOpen,
  title,
  steps,
  data,
  setData,
  currentStep,
  setCurrentStep,
  onClose,
  onSubmit,
  submitLabel = "Submit"
}: WizardModalProps<Data>) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const total = steps.length;

  const handleNext = () => {
    const validate = step.validate;
    const nextErrors = validate ? validate(data) : {};
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setCurrentStep((s) => Math.min(s + 1, total - 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    const validate = step.validate;
    const nextErrors = validate ? validate(data) : {};
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length !== 0) return;
    try {
      setIsSubmitting(true);
      await onSubmit();
      setIsSubmitting(false);
      onClose();
      setCurrentStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wizard__backdrop" role="dialog" aria-modal="true">
      <div className="wizard">
        <div className="wizard__header">
          <div>
            <p className="pill wizard__pill">Step {currentStep + 1} of {total}</p>
            <h3 className="wizard__title">{title}</h3>
          </div>
          <button className="wizard__close" onClick={onClose} aria-label="Close wizard">
            ×
          </button>
        </div>

        <div className="wizard__progress">
          <div
            className="wizard__progress-bar"
            style={{ width: `${((currentStep + 1) / total) * 100}%` }}
          />
          <div className="wizard__progress-steps">
            {steps.map((s, idx) => (
              <div
                key={s.label}
                className={`wizard__progress-dot ${idx <= currentStep ? "wizard__progress-dot--active" : ""}`}
              >
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="wizard__content">{step.render(data, setData, errors)}</div>

        <div className="wizard__footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <div className="wizard__footer-actions">
            <button className="btn btn-ghost" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </button>
            {currentStep < total - 1 ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardModal;

