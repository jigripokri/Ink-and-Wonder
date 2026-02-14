import { motion } from "framer-motion";
import { siteName } from "@/lib/siteName";

export default function Hero() {
  return (
    <section className="py-6 sm:py-16 overflow-visible">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        <div className="flex flex-col items-center gap-4 sm:gap-8">
          <motion.img
            src="/hero-illustration.png"
            alt="A hand writing in a notebook"
            className="w-full max-w-[10rem] sm:max-w-sm h-auto"
            loading="eager"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />

          <div className="space-y-3">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {siteName}
            </motion.h1>

            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <span className="w-8 h-px bg-muted-foreground/30" />
              <span className="text-muted-foreground/40 text-sm select-none" aria-hidden="true">&#10087;</span>
              <span className="w-8 h-px bg-muted-foreground/30" />
            </motion.div>

            <motion.p
              className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Reflections, memories, and little wisdoms for the grandchildren
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
