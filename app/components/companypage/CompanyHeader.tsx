import Image from "next/image";
import { Building2 } from "lucide-react";

export interface CompanyHeaderProps {
  companyName: string;
  company?: {
    name?: string;
    logoUrl?: string | null;
  } | null;
  subtitle?: string;
  className?: string;
}

export default function CompanyHeader({
  companyName,
  company,
  subtitle = "Return Offer Statistics",
  className = "",
}: CompanyHeaderProps) {
  return (
    <div className={`mb-6 sm:mb-10 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4 mb-3">
        {company?.logoUrl ? (
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
            <Image
              src={company.logoUrl}
              alt={`${company.name || companyName} logo`}
              width={64}
              height={64}
              className="w-full h-full object-contain"
              unoptimized
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground truncate">
            {company?.name || companyName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
