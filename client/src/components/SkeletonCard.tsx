import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  index: number;
}

export default function SkeletonCard({ index }: SkeletonCardProps) {
  const variant = index % 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {variant === 0 && <LargeNumberSkeleton />}
      {variant === 1 && <CenteredElegantSkeleton />}
      {variant === 2 && <QuoteStyleSkeleton />}
      {variant === 3 && <SidebarAccentSkeleton />}
    </motion.div>
  );
}

function LargeNumberSkeleton() {
  return (
    <Card className="relative p-8 overflow-hidden">
      <div className="absolute top-4 right-4 text-[8rem] font-light opacity-5 leading-none select-none">
        ?
      </div>
      <div className="relative z-10">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}

function CenteredElegantSkeleton() {
  return (
    <Card className="p-12 text-center">
      <div className="text-4xl text-muted-foreground/20 mb-6 font-serif">❦</div>
      <Skeleton className="h-3 w-24 mx-auto mb-4" />
      <Skeleton className="h-7 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-7 w-1/2 mx-auto mb-8" />
      <div className="space-y-2 mb-8 flex flex-col items-center">
        <Skeleton className="h-3 w-full max-w-md" />
        <Skeleton className="h-3 w-full max-w-md" />
        <Skeleton className="h-3 w-2/3 max-w-md" />
      </div>
      <Skeleton className="h-3 w-40 mx-auto" />
    </Card>
  );
}

function QuoteStyleSkeleton() {
  return (
    <Card className="relative p-10">
      <div className="text-6xl font-serif opacity-10 leading-none mb-4">"</div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-4" />
      <div className="space-y-2 mb-6">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
}

function SidebarAccentSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted"></div>
      <div className="pl-10 p-8">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-6" />
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
}
