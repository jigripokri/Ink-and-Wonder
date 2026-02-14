import { useState } from "react";
import AIAssistantPanel from "../AIAssistantPanel";

export default function AIAssistantPanelExample() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMagicWeaving, setIsMagicWeaving] = useState(false);
  const [hasContent, setHasContent] = useState(true);

  const handleAction = (action: string) => {
    console.log(`AI action: ${action}`);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleMagicWeave = () => {
    console.log("Magic weaving activated");
    setIsMagicWeaving(true);
    setIsProcessing(true);
    setTimeout(() => {
      setIsMagicWeaving(false);
      setIsProcessing(false);
      setHasContent(true);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-md">
      <AIAssistantPanel
        onAction={handleAction}
        onMagicWeave={handleMagicWeave}
        isProcessing={isProcessing}
        isMagicWeaving={isMagicWeaving}
        selectedText="Sample selected text"
        hasContent={hasContent}
      />
    </div>
  );
}
