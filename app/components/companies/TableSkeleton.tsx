export default function TableSkeleton() {
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      {/* Table Header - Desktop Only */}
      <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-muted/30 border-b border-border/50">
        <div></div>
        <div></div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Company
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          Contributions
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          Offers
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
          RO Rate
        </div>
        <div></div>
      </div>
      {/* Skeleton rows */}
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={index}
          className="border-b border-border/50 last:border-0 animate-pulse"
        >
          <div className="py-4 sm:py-5">
            {/* Desktop Grid Layout */}
            <div className="hidden md:grid md:grid-cols-[40px_48px_1fr_80px_80px_100px_32px] gap-4 sm:gap-6 px-4 sm:px-6 items-center">
              <div className="text-center">
                <div className="h-4 w-4 bg-muted rounded mx-auto blur-sm" />
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md blur-sm" />
              </div>
              <div className="min-w-0">
                <div className="h-5 w-32 bg-muted rounded blur-sm" />
              </div>
              <div className="text-right">
                <div className="h-5 w-8 bg-muted rounded blur-sm ml-auto" />
              </div>
              <div className="text-right">
                <div className="h-5 w-8 bg-muted rounded blur-sm ml-auto" />
              </div>
              <div className="text-right">
                <div className="h-5 w-12 bg-muted rounded blur-sm ml-auto" />
              </div>
              <div>
                <div className="h-4 w-4 bg-muted rounded blur-sm" />
              </div>
            </div>
            {/* Mobile Layout */}
            <div className="md:hidden px-4">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="shrink-0 w-8 text-center">
                  <div className="h-4 w-4 bg-muted rounded blur-sm mx-auto" />
                </div>
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-muted rounded-md blur-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-muted rounded blur-sm mb-1" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right flex-1">
                  <div className="h-3 w-16 bg-muted rounded blur-sm mb-0.5 ml-auto" />
                  <div className="h-4 w-8 bg-muted rounded blur-sm ml-auto" />
                </div>
                <div className="text-right flex-1">
                  <div className="h-3 w-12 bg-muted rounded blur-sm mb-0.5 ml-auto" />
                  <div className="h-4 w-8 bg-muted rounded blur-sm ml-auto" />
                </div>
                <div className="text-right flex-1">
                  <div className="h-3 w-16 bg-muted rounded blur-sm mb-0.5 ml-auto" />
                  <div className="h-4 w-12 bg-muted rounded blur-sm ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
