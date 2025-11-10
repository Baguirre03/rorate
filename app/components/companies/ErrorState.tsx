import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";

export interface CompaniesErrorStateProps {
  title?: string;
  description?: string;
  onBack: () => void;
  backLabel?: string;
  className?: string;
}

export default function CompaniesErrorState({
  title = "Error",
  description = "Failed to load data. Please try again.",
  onBack,
  backLabel = "Back to Home",
  className = "",
}: CompaniesErrorStateProps) {
  return (
    <div
      className={`min-h-screen bg-background py-6 sm:py-12 px-4 sm:px-6 ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4 sm:mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
        <div className="py-12 sm:py-16 text-center">
          <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
