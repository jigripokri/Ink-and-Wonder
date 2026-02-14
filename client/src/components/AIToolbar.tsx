import { Button } from "@/components/ui/button";
import { Type, Wand2 } from "lucide-react";

interface AIToolbarProps {
  onAction: (action: string) => void;
  disabled?: boolean;
}

export default function AIToolbar({ onAction, disabled }: AIToolbarProps) {
  const tools = [
    { 
      id: "grammar", 
      icon: Type, 
      label: "Fix Grammar",
      description: "Fix spelling and grammar"
    },
    { 
      id: "weave", 
      icon: Wand2, 
      label: "Weave",
      description: "Turn thoughts into a story"
    },
  ];

  return (
    <div className="flex flex-row sm:flex-col gap-3 py-3 sm:py-6 px-3 border-t sm:border-t-0 sm:border-l border-border justify-center sm:justify-start">
      {/* Tool Buttons */}
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="ghost"
          size="icon"
          onClick={() => onAction(tool.id)}
          disabled={disabled}
          className="h-10 w-10 text-muted-foreground"
          title={tool.label}
          aria-label={tool.label}
          data-testid={`button-ai-${tool.id}`}
        >
          <tool.icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
}
