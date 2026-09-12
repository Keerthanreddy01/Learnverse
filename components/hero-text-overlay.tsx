export default function HeroTextOverlay() {
  return (
    <div className="absolute top-28 md:top-40 left-6 md:left-8 z-10 pointer-events-none">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono mb-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        AI Microlearning Platform
      </div>
      <h1
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider mb-2 opacity-100 uppercase"
        style={{
          fontFamily: "var(--font-montserrat)",
          color: "rgb(0, 0, 0)",
          WebkitTextStroke: "4px white",
          paintOrder: "stroke fill",
        }}
      >
        LEARN
        <br />
        VERSE
      </h1>
      <p className="text-foreground font-mono text-xs md:text-sm max-w-sm tracking-wide text-muted-foreground mt-2 leading-relaxed">
        Transform dense textbooks, PDFs & lecture slides into bite-sized notes, 3D flashcards, quizzes & narrated reels.
      </p>
    </div>
  )
}
