import { LucideIcon } from "lucide-react";
import { Building2 } from "lucide-react";

export interface NoDataProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function NoData({
  icon: Icon = Building2,
  title,
  description,
  className = "",
}: NoDataProps) {
  return (
    <div
      className={`mb-6 sm:mb-12 py-12 sm:py-16 text-center px-4 ${className}`}
    >
      <Icon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
      <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-sm sm:text-base text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
