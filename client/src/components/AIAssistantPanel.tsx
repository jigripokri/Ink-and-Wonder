import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Scissors, FileText, Check, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIAssistantPanelProps {
  onAction: (action: string) => void;
  onMagicWeave: () => void;
  isProcessing: boolean;
  isMagicWeaving: boolean;
  selectedText?: string;
  hasContent: boolean;
}

export default function AIAssistantPanel({
  onAction,
  onMagicWeave,
  isProcessing,
  isMagicWeaving,
  selectedText,
  hasContent,
}: AIAssistantPanelProps) {
  const actions = [
    {
      id: "shorten",
      label: "Make It Shorter",
      description: "Condense without losing meaning",
      icon: Scissors,
    },
    {
      id: "elaborate",
      label: "Tell Me More",
      description: "Add depth with natural examples",
      icon: FileText,
    },
    {
      id: "grammar",
      label: "Fix My Grammar",
      description: "Polish mechanics, keep your voice",
      icon: Check,
    },
  ];

  const selectionWordCount = selectedText?.trim()
    ? selectedText.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const selectionActive = selectionWordCount > 0;

  return (
    <Card className="border border-emerald-100/60 rounded-3xl p-6 bg-white/80 shadow-[0_20px_45px_rgba(16,185,129,0.15)] backdrop-blur">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-emerald-500/80">
              AI Guide
            </p>
            <h3 className="text-lg font-medium text-emerald-900">Verdant Assistant</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Transform your raw thoughts into polished prose
        </p>
      </div>

      {/* Primary Action - Transform Button */}
      <div className="mb-6">
        <Button
          onClick={onMagicWeave}
          disabled={!hasContent || isProcessing}
          className="w-full h-12 gap-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/70 hover:shadow-emerald-300 transition-all disabled:opacity-60"
          data-testid="button-magic"
        >
          <Sparkles className={`w-4 h-4 ${isMagicWeaving ? "animate-pulse" : ""}`} />
          <span className="text-base">
            {isMagicWeaving ? "Transforming..." : "Transform My Words"}
          </span>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-transparent px-2 text-muted-foreground">
            Or Refine Specific Parts
          </span>
        </div>
      </div>

      {/* Specific Tools */}
      <div className="space-y-3 mb-6">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={isProcessing}
            className="w-full text-left p-4 border border-emerald-100/60 rounded-2xl hover:bg-emerald-50/70 hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm bg-white/70"
            data-testid={`button-ai-${action.id}`}
          >
            <div className="flex items-start gap-3">
              <action.icon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-0.5">{action.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {action.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-emerald-50/90 to-white/70 border border-emerald-100/70 rounded-2xl p-4 shadow-inner">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-emerald-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              <strong>Tip:</strong> Select specific text for targeted improvements, or use Transform to restructure your entire piece.
            </p>
            <div className="text-xs text-muted-foreground/60 space-y-0.5">
              <div>
                <kbd className="text-xs">Cmd+Shift+A</kbd> Toggle AI
              </div>
              <div>
                <kbd className="text-xs">Cmd+Shift+F</kbd> Focus Mode
              </div>
              <div>
                <kbd className="text-xs">Cmd+S</kbd> Save Draft
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectionActive && (
        <div className="mt-4 rounded-2xl border border-emerald-100/80 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-700 flex items-center justify-between">
          <span>Selection ready for refinement</span>
          <span className="font-medium">
            {selectionWordCount} {selectionWordCount === 1 ? "word" : "words"}
          </span>
        </div>
      )}

      {/* Processing Indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Enhancing your words...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
