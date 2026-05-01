/**
 * Loading Skeleton Components
 * Used to show placeholder states while content loads
 */

export function AlertSkeleton() {
  return (
    <div className="bg-dark-surface rounded-lg p-lg w-80 mobile:w-[90vw]">
      <div className="flex gap-md">
        <div className="w-8 h-8 rounded skeleton" />
        <div className="flex-1 space-y-md">
          <div className="h-5 w-3/4 rounded skeleton" />
          <div className="h-4 w-full rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border-primary">
      <div className="skeleton-image skeleton" />
      <div className="p-md space-y-md">
        <div className="h-4 w-4/5 rounded skeleton" />
        <div className="space-y-sm">
          <div className="h-3 w-full rounded skeleton" />
          <div className="h-3 w-3/4 rounded skeleton" />
        </div>
        <div className="h-8 w-full rounded skeleton" />
      </div>
    </div>
  );
}

export function StreamHealthSkeleton() {
  return (
    <div className="bg-dark-surface rounded-lg p-md border border-border-primary">
      <div className="space-y-md">
        <div className="h-4 w-20 rounded skeleton" />
        <div className="h-8 w-16 rounded skeleton" />
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-md">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg bg-dark-surface skeleton animate-delay-100"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-md">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-md">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 h-8 rounded skeleton"
              style={{ animationDelay: `${(rowIdx * cols + colIdx) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-md">
      <div className="h-8 w-40 rounded skeleton" />
      <div className="space-y-sm">
        <div className="h-4 w-20 rounded skeleton" />
        <div className="h-10 w-full rounded skeleton" />
      </div>
      <div className="space-y-sm">
        <div className="h-4 w-20 rounded skeleton" />
        <div className="h-10 w-full rounded skeleton" />
      </div>
      <div className="h-10 w-32 rounded skeleton" />
    </div>
  );
}

export function AvatarSkeleton() {
  return <div className="w-12 h-12 rounded-full skeleton" />;
}

export function HeaderSkeleton() {
  return (
    <div className="space-y-md">
      <div className="h-8 w-3/4 rounded skeleton" />
      <div className="h-4 w-full rounded skeleton" />
      <div className="h-4 w-5/6 rounded skeleton" />
    </div>
  );
}
