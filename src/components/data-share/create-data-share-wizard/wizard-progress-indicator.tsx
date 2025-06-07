import { cn } from "@/lib/utils";
import type { ConfigureProgressStep } from "@/lib/types";

interface WizardProgressIndicatorProps {
  currentStep: ConfigureProgressStep;
  steps: { id: ConfigureProgressStep; label: string }[];
}

export default function WizardProgressIndicator({ currentStep, steps }: WizardProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Wizard progress">
      <ol className="flex items-center justify-center space-x-4 sm:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex items-center">
            {/* Line removed */}
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2",
                  index < currentStepIndex ? "bg-primary border-primary" : "",
                  index === currentStepIndex ? "border-primary bg-primary scale-110" : "border-border bg-card",
                  index > currentStepIndex ? "border-border bg-card" : ""
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  index === currentStepIndex ? "text-white" : "text-black"
                )}>{index + 1}</span>
              </div>
              <p
                className={cn(
                  "mt-1 text-xs sm:text-sm font-medium whitespace-nowrap", // Added whitespace-nowrap and reduced mt
                  index === currentStepIndex ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
