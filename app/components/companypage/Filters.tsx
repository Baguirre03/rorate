import { Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface FiltersProps {
  selectedYear: string;
  selectedInternType: string;
  selectedTerm: string;
  selectedPositionType: string;
  onYearChange: (value: string) => void;
  onInternTypeChange: (value: string) => void;
  onTermChange: (value: string) => void;
  onPositionTypeChange: (value: string) => void;
  availableYears: number[];
  availableTerms: string[];
  internTypes: string[];
  companyName: string;
  onTrackClick?: (
    event: string,
    data?: Record<string, string | number>
  ) => void;
  className?: string;
}

export default function Filters({
  selectedYear,
  selectedInternType,
  selectedTerm,
  selectedPositionType,
  onYearChange,
  onInternTypeChange,
  onTermChange,
  onPositionTypeChange,
  availableYears,
  availableTerms,
  internTypes,
  companyName,
  onTrackClick,
  className = "",
}: FiltersProps) {
  const handleInternTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onInternTypeChange(value);
    onTrackClick?.("click_intern_type_filter", {
      company: companyName,
      internType: value,
    });
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onTermChange(value);
    onTrackClick?.("click_term_filter", {
      company: companyName,
      term: value,
    });
  };

  return (
    <div className={`mb-6 sm:mb-12 ${className}`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wide">
          Filter Data
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Year Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
            Year
          </label>
          <Tabs value={selectedYear} onValueChange={onYearChange}>
            <TabsList className="w-full grid grid-cols-4 h-auto p-1">
              <TabsTrigger value="all" className="text-xs py-1.5">
                All
              </TabsTrigger>
              {availableYears.slice(0, 3).map((year) => (
                <TabsTrigger
                  key={year}
                  value={year.toString()}
                  className="text-xs py-1.5"
                >
                  {year}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Intern Type Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
            Intern Type
          </label>
          <select
            value={selectedInternType}
            onChange={handleInternTypeChange}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            <option value="all">All Types</option>
            {internTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Term Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
            Term
          </label>
          <select
            value={selectedTerm}
            onChange={handleTermChange}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            <option value="all">All Terms</option>
            {availableTerms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>

        {/* Position Type Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">
            Position Type
          </label>
          <Tabs
            value={selectedPositionType}
            onValueChange={onPositionTypeChange}
          >
            <TabsList className="w-full grid grid-cols-3 h-auto p-1">
              <TabsTrigger value="all" className="text-xs py-1.5">
                All
              </TabsTrigger>
              <TabsTrigger value="Full Time" className="text-xs py-1.5">
                Full Time
              </TabsTrigger>
              <TabsTrigger value="Intern" className="text-xs py-1.5">
                Intern
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
