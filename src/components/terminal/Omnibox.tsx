import React, { useRef, useState, KeyboardEvent, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useAuthStore } from '@/store/authStore';
import { useTerminalStore } from '@/store/terminalStore';
import { CommandPalette, COMMANDS } from './CommandPalette';
import { MobileToolbar } from './MobileToolbar';

interface OmniboxProps {
  onCommand: (command: string) => void;
  isProcessing: boolean;
  onAbort: () => void;
}

export const Omnibox = ({ onCommand, isProcessing, onAbort }: OmniboxProps) => {
  const [value, setValue] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeProvider: provider, activeModel: model, hasHydrated } = useAuthStore();
  const { activePayloadContext, setActivePayloadContext } = useTerminalStore();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+C to abort
    if (e.key === 'c' && e.ctrlKey && isProcessing) {
      e.preventDefault();
      onAbort();
      return;
    }

    if (showPalette) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => prev + 1);
        return;
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const query = value.slice(1).toLowerCase();
      const filtered = COMMANDS.filter(c => c.text.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));

      if (showPalette && filtered.length > 0 && selectedIndex >= 0 && selectedIndex < filtered.length) {
        // Autocomplete
        handlePaletteSelect(filtered[selectedIndex].text);
      } else if (value.trim()) {
        // Submit command/chat
        onCommand(value.trim());
        setValue('');
        setShowPalette(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    
    // Only show palette if it starts with slash AND it's not a full command with arguments yet
    if (val.startsWith('/')) {
      const parts = val.split(' ');
      // If we are typing the first word (the command)
      if (parts.length <= 2) {
        setShowPalette(true);
      } else {
        setShowPalette(false);
      }
    } else {
      setShowPalette(false);
    }
  };

  const handlePaletteSelect = (cmd: string) => {
    setValue(cmd);
    setShowPalette(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-2 p-2">
      {showPalette && (
        <CommandPalette 
          inputValue={value} 
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          onSelect={handlePaletteSelect}
        />
      )}

      <div className="flex flex-col bg-[#111111] border border-gray-800 rounded-lg overflow-hidden focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600 transition-all shadow-lg relative">
        
        {/* Context Badge */}
        {!!activePayloadContext && (
          <div className="flex items-center justify-between px-3 py-1 bg-cyan-900/30 border-b border-cyan-900/50 text-cyan-400 text-xs font-mono">
            <span>🧠 Contexto JSON Carregado</span>
            <button 
              onClick={() => setActivePayloadContext(null)}
              className="hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando (ex: mrcp analyze) ou / para atalhos..."
          className="w-full bg-transparent text-gray-200 p-4 outline-none resize-none font-mono text-sm leading-relaxed"
          minRows={1}
          maxRows={8}
          disabled={isProcessing}
          autoFocus
        />
        
        <div className="flex justify-between items-center px-4 py-2 bg-[#0a0a0a] border-t border-gray-800/50 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {hasHydrated ? (
              <>
                <span className="text-term-accent font-semibold uppercase">{provider || 'Desconectado'}</span>
                <span>·</span>
                <span>{model || 'N/A'}</span>
              </>
            ) : (
              <span className="text-gray-600">Carregando...</span>
            )}
          </div>
          <div className="hidden sm:flex gap-4">
            <span><kbd className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">Shift</kbd> + <kbd className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">Enter</kbd> multi-line</span>
            <span><kbd className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">/</kbd> menu</span>
          </div>
        </div>
      </div>
      
      <MobileToolbar 
        onAction={(action) => {
          // Fake dispatching keys to textarea
          if (textareaRef.current) {
            // Simplified handling for the toolbar
            if (action === 'ESC') setShowPalette(false);
            textareaRef.current.focus();
          }
        }} 
      />
    </div>
  );
};
