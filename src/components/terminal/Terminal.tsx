"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTerminalStore } from '@/store/terminalStore';
import { HistoryThreadBlock } from './HistoryThreadBlock';
import { Omnibox } from './Omnibox';
import { parseCommand } from '@/lib/parser';
import { mrcpEndpoints } from '@/services/mrcpEndpoints';
import { useAuthStore, type LlmProvider } from '@/store/authStore';

export const Terminal = () => {
  const { history, isProcessing, addCommand, updateCommandOutput, clearHistory, abortCurrent } = useTerminalStore();
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: history.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  useEffect(() => {
    if (history.length > 0) {
      virtualizer.scrollToIndex(history.length - 1, { align: 'end' });
    }
  }, [history.length, virtualizer]);

  const handleCommandSubmit = useCallback(async (rawCommand: string) => {
    const controller = new AbortController();
    const id = addCommand(rawCommand, controller);
    
    try {
      const isCommand = rawCommand.startsWith('/');

      if (!isCommand) {
        // Native Chat Mode
        const { apiKeys, activeProvider, activeModel } = useAuthStore.getState();
        if (!activeProvider || !apiKeys[activeProvider]) {
          updateCommandOutput(id, `⚠️ Nenhum provedor configurado. Digite /provedores para configurar.`, 'error', undefined, 'text');
          return;
        }

        const terminalStore = useTerminalStore.getState();
        const payloadContext = terminalStore.activePayloadContext;
        if (payloadContext) {
          terminalStore.setActivePayloadContext(null); // Clear it
        }

        let streamedContent = '';
        const { llmOrchestrator } = await import('@/services/llmOrchestrator');
        
        await llmOrchestrator({
          repoUrl: 'chat', // Placeholder or active repo
          question: rawCommand,
          payloadContext,
          apiKey: apiKeys[activeProvider]!,
          model: activeModel || 'default',
          provider: activeProvider,
          controller,
          onChunk: (chunk) => {
            streamedContent += chunk;
            updateCommandOutput(id, '', 'running', streamedContent, 'markdown-stream');
          }
        });
        
        updateCommandOutput(id, '', 'success', streamedContent, 'markdown-stream');
        return;
      }

      // Command Mode (starts with /)
      const cmdString = rawCommand.slice(1).trim();
      const parsed = parseCommand(cmdString);
      
      if (parsed.base === 'clear') {
        clearHistory();
        return;
      }

      if (parsed.base.toLowerCase() === 'provedores') {
        updateCommandOutput(id, '', 'success', { type: 'provider' }, 'wizard');
        return;
      }

      if (parsed.base.toLowerCase() === 'model') {
        const { activeProvider } = useAuthStore.getState();
        if (!activeProvider) {
          updateCommandOutput(id, 'Nenhum provedor conectado. Use /provedores primeiro.', 'error', undefined, 'text');
          return;
        }
        updateCommandOutput(id, '', 'success', { type: 'model' }, 'model-wizard');
        return;
      }

      if (parsed.base !== 'mrcp') {
        throw new Error(`Command not found: /${parsed.base}. Try /mrcp help`);
      }

      if (!parsed.action || parsed.action === 'help') {
        const helpText = `MRCP WEB TERMINAL // v1.0.0
Available commands:
  /mrcp analyze <url>    Run AST analysis on repository
  /mrcp audit <url>      Run security compliance audit
  /mrcp health <url>     Check repository health metrics
  /provedores            Configurar Provedores de IA
  /clear                 Clear terminal history`;
        updateCommandOutput(id, helpText, 'success', undefined, 'text');
        return;
      }

      const targetUrl = parsed.args[0];

      if (parsed.action === 'analyze') {
        if (!targetUrl) throw new Error('Missing URL for analyze');
        const data = await mrcpEndpoints.analyzeRepository(targetUrl, controller);
        updateCommandOutput(id, 'Analysis complete', 'success', data, 'json');
        
      } else if (parsed.action === 'audit') {
        if (!targetUrl) throw new Error('Missing URL for audit');
        const data = await mrcpEndpoints.securityAudit(targetUrl, controller);
        const tableData = Array.isArray(data) ? data : [data];
        updateCommandOutput(id, 'Audit complete', 'success', tableData, 'table');
        
      } else if (parsed.action === 'health') {
        if (!targetUrl) throw new Error('Missing URL for health');
        const data = await mrcpEndpoints.health(targetUrl, controller);
        updateCommandOutput(id, 'Health status', 'success', data, 'json');
        
      } else if (parsed.action === 'echo') {
         updateCommandOutput(id, parsed.args.join(' '), 'success', undefined, 'text');
      } else {
        throw new Error(`Unknown MRCP action: ${parsed.action}. Type 'mrcp help' to see available commands.`);
      }
    } catch (error: unknown) {
      const isAbort = error instanceof Error && (error.message.includes('Aborted') || error.name === 'AbortError');
      if (isAbort) {
         return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateCommandOutput(id, `[ERR] ${errorMessage}`, 'error', undefined, 'text');
    }
  }, [addCommand, updateCommandOutput, clearHistory]);

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-[#050505] text-gray-300 font-mono text-sm overflow-hidden selection:bg-term-accent/30">
      
      {/* HISTORY FEED */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
      >
        {history.length === 0 && (
          <div className="text-gray-500 italic mt-8 text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <span className="text-term-accent font-bold">MRCP</span>
            </div>
            O ambiente está pronto. Digite '/' no prompt abaixo.
          </div>
        )}
        
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = history[virtualItem.index];
            return (
              <div
                key={item.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <HistoryThreadBlock item={item} />
              </div>
            );
          })}
        </div>
      </div>

      {/* OMNIBOX (BOTTOM) */}
      <div className="flex-shrink-0 w-full px-2 md:px-4 pb-2 md:pb-4 pb-[env(safe-area-inset-bottom,0.5rem)] pt-2 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <Omnibox 
          onCommand={handleCommandSubmit}
          isProcessing={isProcessing}
          onAbort={abortCurrent}
        />
      </div>
      
    </div>
  );
};
