/**
 * Placeholder component for features temporarily disabled during infrastructure updates
 */

export function TemporarilyDisabled({ feature }: { feature?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-black uppercase mb-4">
          Temporarily Unavailable
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          {feature ? `${feature} is` : "This feature is"} currently being updated and will return soon.
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors uppercase font-bold"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
