import React from 'react';
import { TerminalSquare, ArrowUp, ArrowDown, MoveLeft, CornerDownLeft } from 'lucide-react';

interface MobileToolbarProps {
  onAction: (action: string) => void;
}

export const MobileToolbar = ({ onAction }: MobileToolbarProps) => {
  const buttons = [
    { id: 'ESC', label: 'ESC', icon: null },
    { id: 'TAB', label: 'TAB', icon: <MoveLeft className="w-4 h-4" /> },
    { id: 'UP', label: '', icon: <ArrowUp className="w-4 h-4" /> },
    { id: 'DOWN', label: '', icon: <ArrowDown className="w-4 h-4" /> },
    { id: 'CTRL', label: 'CTRL', icon: null },
    { id: 'ENTER', label: '', icon: <CornerDownLeft className="w-4 h-4" /> }
  ];

  return (
    <div className="md:hidden flex items-center justify-between gap-1 p-1 bg-[#1a1a1a] rounded border border-gray-800">
      <div className="flex items-center text-gray-500 px-2">
        <TerminalSquare className="w-4 h-4" />
      </div>
      <div className="flex flex-1 items-center justify-around">
        {buttons.map(btn => (
          <button
            key={btn.id}
            onPointerDown={(e) => {
              e.preventDefault();
              onAction(btn.id);
            }}
            className="flex items-center justify-center h-8 px-3 rounded bg-gray-800/40 text-gray-400 font-mono text-xs active:bg-gray-700 active:text-gray-200 transition-colors"
          >
            {btn.icon || btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
