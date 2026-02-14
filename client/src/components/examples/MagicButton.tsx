import { useState } from "react";
import MagicButton from "../MagicButton";

export default function MagicButtonExample() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    console.log("Magic button clicked!");
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div className="p-8 flex items-center justify-center">
      <MagicButton onClick={handleClick} isProcessing={isProcessing} />
    </div>
  );
}
