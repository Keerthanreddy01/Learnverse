import SplineScene from "@/components/spline-scene"
import Header from "@/components/header"
import RotatingTextAccent from "@/components/rotating-text-accent"
import Footer from "@/components/footer"
import HeroTextOverlay from "@/components/hero-text-overlay"

export default function Home() {
  return (
    <div className="w-full min-h-screen py-0 bg-background">
      <div className="max-w-[1200px] mx-auto">
        <main className="w-full relative h-[600px]">
          <Header />
          <SplineScene />
          <HeroTextOverlay />
          <RotatingTextAccent />
        </main>

        <section
          className="relative rounded-4xl py-7 mx-4 md:mx-0 w-[calc(100%-2rem)] md:w-full bg-card border border-solid border-border pb-20"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        >
          {/* Decorative plus signs in corners */}
          <div className="absolute top-8 left-8 text-foreground opacity-50 text-5xl font-extralight font-sans leading-[0rem]">
            +
          </div>
          <div className="absolute top-8 right-8 text-foreground opacity-50 text-5xl font-sans leading-[0] font-extralight">
            +
          </div>
          <div className="absolute bottom-8 left-8 text-foreground opacity-50 text-5xl font-sans font-extralight">
            +
          </div>
          <div className="absolute bottom-8 right-8 text-foreground opacity-50 text-5xl font-sans font-extralight">
            +
          </div>

          <div className="px-6 md:px-40">
            <div className="flex items-center justify-center mb-3.5 md:gap-11">
              {/* Front view */}
              <div className="flex flex-col items-center">
                <img src="/jack-front.png" alt="Jack front view" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
              </div>

              {/* Side view */}
              <div className="flex flex-col items-center">
                <img src="/jack-side.png" alt="Jack side view" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
              </div>

              {/* Back view */}
              <div className="flex flex-col items-center">
                <img src="/jack-back.png" alt="Jack back view" className="w-48 h-48 md:w-56 md:h-56 object-contain" />
              </div>
            </div>

            <div className="flex flex-col gap-2 max-w-5xl">
              <div className="flex items-center gap-4">
                <span className="text-accent font-mono text-sm">Name</span>
                <span className="text-foreground font-mono text-sm">Jack</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-accent font-mono text-sm">Species</span>
                <span className="text-foreground font-mono text-sm">Alien from Planet Flapjack </span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-accent font-mono text-sm">Personality</span>
                <span className="text-foreground font-mono text-sm">
                  Curious, flexible, a bit laid-back — but sharp when it comes to databases and organizing information.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
