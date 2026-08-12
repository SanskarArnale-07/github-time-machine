const PARTICLES = Array.from({ length: 18 }, (_, id) => ({
  id,
  left: `${(id * 17.3 + 7) % 96}%`,
  top: `${(id * 23.7 + 11) % 90}%`,
  size: `${id % 3 === 0 ? 2 : 1}px`,
  delay: `${(id % 6) * -1.4}s`,
  duration: `${14 + (id % 5) * 3}s`,
  opacity: 0.16 + (id % 4) * 0.07,
}));

/** A dedicated, low-contrast field for the replay theater. */
export function ReplayBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0B0A09]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_34%,rgba(201,168,106,0.10),transparent_72%)]" />
      {/* Central light bloom behind title */}
      <div className="absolute left-1/2 top-1/2 h-[40vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass/10 blur-[120px] motion-safe:animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -right-[18%] -top-[28%] h-[68%] w-[58%] rounded-full bg-[#8B6530]/15 blur-[150px] motion-safe:animate-pulse" />
      <div className="absolute -bottom-[34%] -left-[15%] h-[65%] w-[58%] rounded-full bg-[#33271B]/50 blur-[160px]" />

      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-brass-light shadow-[0_0_10px_rgba(216,181,108,0.45)] motion-safe:animate-particle-drift"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      
      {/* Heavy vignette with slow pulsing animation to draw focus to center */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(11,10,9,0.85)_80%,rgba(0,0,0,0.95)_100%)] motion-safe:animate-pulse" 
        style={{ animationDuration: '8s' }} 
      />
    </div>
  );
}
