import { cn } from "@/lib/utils";
import type { ExportWizardProgressStep } from "./types";

interface ExportWizardProgressIndicatorProps {
  currentStep: string;
  steps: { id: string; label: string }[];
}

export default function ExportWizardProgressIndicator({ currentStep, steps }: ExportWizardProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Wizard progress">
      <ol className="flex items-center justify-center space-x-4 sm:space-x-8">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex items-center">
            {/* Add connecting line for steps */}
            {index !== 0 && (
              <div className={cn(
                "absolute left-0 top-4 h-0.5 w-full -translate-x-1/2 transform",
                index <= currentStepIndex ? "bg-primary" : "bg-border"
              )} />
            )}
            <div className="relative flex flex-col items-center text-center z-10"> {/* Added relative and z-10 */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ease-in-out", // Added transition
                  index < currentStepIndex ? "bg-primary border-primary text-primary-foreground" : "",
                  index === currentStepIndex ? "border-primary bg-primary text-white scale-110" : "border-border bg-card", // Change text-primary-foreground to text-white
                  index > currentStepIndex ? "border-border bg-card text-muted-foreground" : "text-foreground"
                )}
              >
                {/* Use check icon for completed steps */}
                {index < currentStepIndex ? (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                     <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9.401 11.67c-.5.621-1.805.621-2.306 0L3.094 11.513a.75.75 0 0 1 1.04-.208l5.307 5.22L19.708 4.834a.75.75 0 0 1 .208-.208Z" clipRule="evenodd" />
                   </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1 text-xs sm:text-sm font-medium whitespace-nowrap",
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