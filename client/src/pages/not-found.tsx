import { motion } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-4 px-6 py-12 text-center"
        >
          <div className="text-4xl text-muted-foreground/40 mb-6 font-serif">❦</div>
          
          <h1 className="text-4xl md:text-5xl font-medium mb-4 text-foreground">
            Page Not Found
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed mb-8">
            This page doesn't exist. Would you like to return home and explore our collection of thoughts and reflections?
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border max-w-16"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
            <div className="flex-1 h-px bg-border max-w-16"></div>
          </div>

          <Link href="/">
            <Button data-testid="link-go-home" variant="default" size="lg">
              Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </>
  );
}
