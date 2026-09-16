import React, { useEffect } from 'react';

interface CommandPaletteProps {
  inputValue: string;
  selectedIndex: number;
  setSelectedIndex: (idx: number) => void;
  onSelect: (cmd: string) => void;
}

export const COMMANDS = [
  { id: 'provedores', text: '/provedores', desc: 'Configurar Provedores de IA (OpenAI, Gemini, etc)' },
  { id: 'model', text: '/model', desc: 'Trocar modelo de IA do provedor conectado' },
  { id: 'analyze', text: '/mrcp analyze ', desc: 'Analisar repositório (Structural AST)' },
  { id: 'audit', text: '/mrcp audit ', desc: 'Auditoria de conformidade de segurança' },
  { id: 'health', text: '/mrcp health ', desc: 'Métricas de integridade do código' },
  { id: 'clear', text: '/clear', desc: 'Limpar o feed de histórico' }
];

export const CommandPalette = ({ inputValue, selectedIndex, setSelectedIndex, onSelect }: CommandPaletteProps) => {
  // Filter based on input, ignoring the leading '/'
  const query = inputValue.slice(1).toLowerCase();
  const filtered = COMMANDS.filter(c => c.text.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));

  useEffect(() => {
    // Keep selected index within bounds
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [selectedIndex, filtered.length, setSelectedIndex]);

  // The parent intercepts Enter and manages selection via its own state.
  // We no longer need the global event listener here.

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 w-full mb-2 z-50">
      <div className="bg-[#111111] border border-gray-800 rounded-lg shadow-2xl overflow-hidden p-1 flex flex-col gap-0.5">
        <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-500 border-b border-gray-800 mb-1">
          Sugestões de Comandos
        </div>
        {filtered.map((cmd, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={cmd.id}
              onMouseEnter={() => setSelectedIndex(idx)}
              onPointerDown={(e) => {
                e.preventDefault(); // Prevents focus loss
                onSelect(cmd.text);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded text-sm text-left transition-colors ${
                isSelected ? 'bg-term-accent/20 text-term-accent' : 'text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span className="font-mono">{cmd.text}</span>
              <span className={`text-xs ${isSelected ? 'text-term-accent/70' : 'text-gray-500'}`}>{cmd.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
