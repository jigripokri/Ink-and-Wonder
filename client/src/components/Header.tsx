import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div
          onClick={() => window.location.href = "/"}
          className="cursor-pointer group shrink-0"
          data-testid="link-home"
        >
          <div className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <h2 className="text-xl sm:text-2xl tracking-tight font-medium text-foreground">
              Ink & Wonder
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              A Personal Journal
            </p>
          </div>
        </div>

        <nav className="flex gap-4 sm:gap-8 items-center">
          <Link href="/">
            <span
              className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
              data-testid="link-nav-home"
            >
              Home
              {location === "/" && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-px bg-primary"
                />
              )}
            </span>
          </Link>
          <Link href="/about">
            <span
              className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200"
              data-testid="link-nav-about"
            >
              About
              {location === "/about" && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-px bg-primary"
                />
              )}
            </span>
          </Link>
          <Link href="/create">
            <Button
              variant={location === "/create" ? "outline" : "default"}
              size="sm"
              data-testid="link-nav-create"
            >
              <PenLine className="w-4 h-4" />
              Write
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
