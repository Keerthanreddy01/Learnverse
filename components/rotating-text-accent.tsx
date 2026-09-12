"use client"

export default function RotatingTextAccent() {
  const text = " • LEARNVERSE AI • ADAPTIVE STUDY • "

  return (
    <div className="absolute bottom-16 right-6 md:right-8 w-24 h-24 md:w-32 md:h-32 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Central visual indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-mono text-xs font-bold shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            LV
          </div>
        </div>

        {/* Rotating text */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <defs>
              <path id="circle" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
            </defs>
            <text className="text-[9px] fill-primary/80 font-mono tracking-wider font-semibold">
              <textPath href="#circle" startOffset="0%">
                {text}
              </textPath>
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
