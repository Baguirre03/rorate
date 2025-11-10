export interface StatItem {
  value: string | number;
  label: string;
}

export interface StatsDisplayProps {
  title: string;
  description?: string;
  stats: StatItem[];
  percentage: number;
  className?: string;
  showProgressBar?: boolean;
}

export default function StatsDisplay({
  title,
  description,
  stats,
  percentage,
  className = "",
  showProgressBar = true,
}: StatsDisplayProps) {
  return (
    <div
      className={`mb-6 sm:mb-12 pb-6 sm:pb-12 border-b border-border/50 ${className}`}
    >
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-8">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {showProgressBar && (
          <div className="mt-6">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-green-500 dark:bg-green-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
