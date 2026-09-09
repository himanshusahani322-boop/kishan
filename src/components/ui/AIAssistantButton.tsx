import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export interface AIAssistantButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
  id?: string;
}

export const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({
  onClick,
  isOpen = false,
  className = '',
  id = 'ai-assistant-floating-btn'
}) => {
  return (
    <div className={`fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 ${className}`}>
      <button
        type="button"
        id={id}
        onClick={onClick}
        className="group relative flex items-center gap-2 pl-3 pr-4 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full shadow-xl hover:shadow-2xl ring-2 ring-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Open Krishi AI Advisor"
      >
        {/* Glow halo */}
        <span className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-amber-400 rounded-full blur-xs opacity-40 group-hover:opacity-75 animate-pulse transition duration-500 pointer-events-none" />

        <div className="relative w-8 h-8 rounded-full bg-emerald-950 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-950 flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-emerald-950" />
          </span>
        </div>

        <div className="relative text-left leading-tight hidden xs:block sm:block">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            कृषि AI Saathi
          </div>
          <div className="text-xs font-extrabold text-white">
            Crop Advisory
          </div>
        </div>
      </button>
    </div>
  );
};
