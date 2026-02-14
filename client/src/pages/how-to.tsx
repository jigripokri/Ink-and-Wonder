import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import {
  PenLine,
  Sparkles,
  Search,
  Edit,
  Keyboard,
  Save,
  Lightbulb,
  Type,
  Wand2
} from "lucide-react";

export default function HowTo() {
  const features = [
    {
      icon: PenLine,
      title: "Writing Your Story",
      steps: [
        "Click the 'Write' button at the top of any page",
        "Start typing your thoughts, memories, or wisdom",
        "Don't worry about making it perfect—just write naturally",
        "Your work saves automatically every few seconds",
      ]
    },
    {
      icon: Sparkles,
      title: "AI Writing Assistant",
      steps: [
        "Look for two icon buttons on the right side of the writing area",
        "Use 'Fix Grammar' to fix spelling and grammar errors",
        "Use 'Weave' to turn your thoughts into a flowing, polished story",
        "Both tools work on your entire text—no selection needed. After enhancement, an Undo button appears if you want to revert",
      ]
    },
    {
      icon: Save,
      title: "Publishing Your Story",
      steps: [
        "When you're ready, click the 'Publish' button",
        "The AI will create a title and summary automatically if you haven't added one",
        "You'll see a confirmation that your story is saved",
        "Choose to view your published story or write another",
      ]
    },
    {
      icon: Search,
      title: "Finding Your Stories",
      steps: [
        "Use the search box on the home page to find stories by keywords",
        "Click on category badges to filter by topic (Family, Travel, etc.)",
        "Click 'All Stories' to see everything again",
        "The count shows how many stories match your search",
      ]
    },
    {
      icon: Edit,
      title: "Editing Published Stories",
      steps: [
        "Open any story by clicking on its card",
        "Click the 'Edit' button at the top",
        "Make your changes",
        "Click 'Publish' again to save—your story will show 'Last edited'",
      ]
    },
  ];

  const keyboardShortcuts = [
    { keys: "Ctrl + S", description: "Save your draft" },
    { keys: "Esc", description: "Close pop-ups" },
    { keys: "Tab", description: "Navigate between buttons and cards" },
    { keys: "Enter", description: "Click the selected button or card" },
  ];

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="text-4xl text-muted-foreground/40 mb-6 font-serif">❦</div>
          <h1 className="text-5xl md:text-6xl mb-6">How to Use This Site</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A simple guide to sharing your memories and stories
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex-1 h-px bg-border max-w-32"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
            <div className="flex-1 h-px bg-border max-w-32"></div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-12 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card className="p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-medium mb-4">{feature.title}</h2>
                    <ol className="space-y-3">
                      {feature.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {stepIndex + 1}
                          </span>
                          <span className="text-muted-foreground leading-relaxed pt-0.5">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Keyboard Shortcuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Keyboard className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-medium mb-4">Keyboard Shortcuts</h2>
                <p className="text-muted-foreground mb-6">
                  Optional shortcuts to make things faster (but everything works with your mouse too!)
                </p>
                <div className="space-y-3">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`shortcut-${shortcut.keys.replace(/\s+/g, '-').toLowerCase()}`}>
                      <span className="text-muted-foreground">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-muted rounded text-sm font-mono font-medium">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border border-border rounded-lg p-8 bg-muted/30"
        >
          <h2 className="text-2xl font-medium mb-6 text-center">Quick Tips</h2>
          <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div className="space-y-2" data-testid="tip-dont-overthink">
              <p className="font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Don't overthink it
              </p>
              <p className="text-sm leading-relaxed">
                Write like you're talking to a friend or family member. Your natural voice is what makes your stories special.
              </p>
            </div>
            <div className="space-y-2" data-testid="tip-start-anywhere">
              <p className="font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Start anywhere
              </p>
              <p className="text-sm leading-relaxed">
                You don't need a title or perfect beginning. Just start with what's on your mind—you can always edit later.
              </p>
            </div>
            <div className="space-y-2" data-testid="tip-let-ai-help">
              <p className="font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Let AI help
              </p>
              <p className="text-sm leading-relaxed">
                Use "Fix Grammar" to polish your spelling and grammar, or "Weave" to turn your thoughts into a flowing story. The AI keeps your voice while making your writing clearer.
              </p>
            </div>
            <div className="space-y-2" data-testid="tip-work-is-safe">
              <p className="font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Your work is safe
              </p>
              <p className="text-sm leading-relaxed">
                Everything saves automatically while you write, and you can always edit or delete stories after publishing.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer decoration */}
        <div className="flex items-center justify-center gap-4 mt-16">
          <div className="flex-1 h-px bg-border max-w-24"></div>
          <div className="text-2xl font-serif text-muted-foreground/60">❦</div>
          <div className="flex-1 h-px bg-border max-w-24"></div>
        </div>
      </div>
    </>
  );
}
