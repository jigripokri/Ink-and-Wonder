import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { motion } from "framer-motion";

interface MagicButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export default function MagicButton({
  onClick,
  isProcessing,
  disabled,
}: MagicButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center mb-6"
    >
      <Button
        onClick={onClick}
        disabled={disabled || isProcessing}
        className="px-8 py-6 text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg relative overflow-hidden group"
        data-testid="button-magic"
      >
        <motion.div
          animate={isProcessing ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mr-2"
        >
          <Wand2 className="h-5 w-5" />
        </motion.div>
        <span className="relative z-10">
          {isProcessing ? "Weaving Your Thoughts..." : "Weave My Thoughts"}
        </span>
        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </Button>
    </motion.div>
  );
}
