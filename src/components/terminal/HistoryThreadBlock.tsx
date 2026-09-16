import React, { useState } from 'react';
import { CommandHistory } from '@/store/terminalStore';
import { JsonTreeViewer } from '../formatters/JsonTreeViewer';
import { AsciiTable } from '../formatters/AsciiTable';
import { LlmStreamViewer } from '../formatters/LlmStreamViewer';
import { ProviderWizard } from './wizards/ProviderWizard';
import { ModelWizard } from './wizards/ModelWizard';
import { ChevronRight, Cpu } from 'lucide-react';

export const HistoryThreadBlock = ({ item }: { item: CommandHistory }) => {
  const [showFullJson, setShowFullJson] = useState(false);
  const isAgentResponse = item.status !== 'error';

  const renderPayload = () => {
    if (!item.payload) return null;

    switch (item.format) {
      case 'json':
        // Handle massive AST payload UX
        const isMassive = typeof item.payload === 'object' && item.payload !== null && Object.keys(item.payload).length > 5;
        
        if (isMassive && !showFullJson) {
          return (
            <div className="mt-2">
              <div className="text-gray-400 text-sm italic mb-2">Payload massivo detectado. Pré-visualização truncada.</div>
              <button 
                onClick={() => setShowFullJson(true)}
                className="bg-gray-800 hover:bg-gray-700 text-term-accent px-4 py-2 rounded text-xs font-mono transition-colors"
              >
                [ Expandir AST Completa ]
              </button>
            </div>
          );
        }

        return (
          <div className="mt-2 overflow-x-auto bg-black/30 rounded p-2">
            <JsonTreeViewer data={item.payload} initiallyExpanded={!isMassive} />
          </div>
        );
      case 'markdown-stream':
        return (
          <div className="mt-2">
            <LlmStreamViewer content={item.payload as string} />
          </div>
        );
      case 'table':
        return (
          <div className="mt-2 overflow-x-auto bg-black/30 rounded p-2">
            <AsciiTable data={item.payload as Record<string, unknown>[]} />
          </div>
        );
      case 'wizard':
        return <ProviderWizard />;
      case 'model-wizard':
        return <ModelWizard />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-gray-900/50">
      {/* User Prompt Block */}
      <div className="flex flex-col pl-4 border-l-2 border-cyan-500">
        <div className="font-mono text-gray-200">{item.command}</div>
      </div>

      {/* AI / Output Block */}
      <div className="flex flex-col pl-4">
        {/* Reasoning Block (Collapsible details) */}
        {item.format === 'markdown-stream' && (
          <details className="group mb-2">
            <summary className="flex items-center gap-2 cursor-pointer list-none focus:outline-none focus:ring-0 text-xs text-gray-500 hover:text-gray-400 font-mono transition-colors">
              <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
              <span>Thought process</span>
            </summary>
            <div className="pl-5 pt-2 text-gray-500 text-xs font-mono max-h-0 group-open:max-h-96 overflow-hidden transition-all duration-300 ease-in-out opacity-0 group-open:opacity-100">
              Analysing context...
              <br />Generating response based on parsed AST...
            </div>
          </details>
        )}

        {/* Status / Output string */}
        <div className={`font-mono text-sm ${item.status === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
          {item.output}
        </div>

        {/* The Payload */}
        {renderPayload()}

        {/* Action Bar (Opt-In AI Trigger) */}
        {!!item.payload && (item.format === 'json' || item.format === 'table') && (
          <div className="flex items-center gap-2 mt-2">
            <button 
              onClick={() => {
                const TerminalStore = require('@/store/terminalStore').useTerminalStore;
                TerminalStore.getState().setActivePayloadContext(item.payload);
                document.querySelector('textarea')?.focus();
              }}
              className="px-3 py-1.5 bg-[#111] hover:bg-gray-800 text-cyan-400 border border-gray-800 hover:border-cyan-900 rounded text-xs font-mono transition-colors flex items-center gap-1 shadow-sm"
            >
              🧠 Enviar para a IA
            </button>
            <button 
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item.payload, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `mrcp-analysis-${Date.now()}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
              className="px-3 py-1.5 bg-[#111] hover:bg-gray-800 text-gray-400 border border-gray-800 hover:border-gray-700 rounded text-xs font-mono transition-colors flex items-center gap-1 shadow-sm"
            >
              📥 Baixar Análise
            </button>
          </div>
        )}

        {/* Footer Metadata */}
        <div className="flex items-center gap-2 mt-4 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
          <Cpu className="w-3 h-3" />
          <span>MRCP Engine</span>
          <span>·</span>
          <span>{item.status === 'running' ? 'Processing...' : 'Completed'}</span>
        </div>
      </div>
    </div>
  );
};
