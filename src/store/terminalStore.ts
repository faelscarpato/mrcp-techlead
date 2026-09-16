import { create } from 'zustand';

export type OutputFormat = 'text' | 'json' | 'table' | 'markdown-stream' | 'wizard' | 'model-wizard';

export interface CommandHistory {
  id: string;
  command: string;
  output: string | null;
  payload?: unknown;
  format: OutputFormat;
  status: 'running' | 'success' | 'error' | 'aborted';
  timestamp: number;
}

interface TerminalState {
  history: CommandHistory[];
  isProcessing: boolean;
  activeController: AbortController | null;
  activePayloadContext: unknown | null;
  addCommand: (command: string, controller?: AbortController) => string;
  updateCommandOutput: (
    id: string, 
    output: string, 
    status: 'running' | 'success' | 'error' | 'aborted', 
    payload?: unknown, 
    format?: OutputFormat
  ) => void;
  abortCurrent: () => void;
  clearHistory: () => void;
  setActivePayloadContext: (payload: unknown) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  history: [],
  isProcessing: false,
  activeController: null,
  activePayloadContext: null,
  
  addCommand: (command: string, controller?: AbortController) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      history: [...state.history, { 
        id, 
        command, 
        output: null, 
        format: 'text', 
        status: 'running', 
        timestamp: Date.now() 
      }],
      isProcessing: true,
      activeController: controller || null,
    }));
    return id;
  },
  
  updateCommandOutput: (id, output, status, payload, format = 'text') => {
    set((state) => ({
      history: state.history.map((cmd) => 
        cmd.id === id ? { ...cmd, output, status, payload, format } : cmd
      ),
      isProcessing: false,
      activeController: null,
    }));
  },

  abortCurrent: () => {
    const { activeController, history } = get();
    if (activeController) {
      activeController.abort();
    }
    
    // Find the running command and mark it aborted
    const runningCmd = history.find(c => c.status === 'running');
    if (runningCmd) {
      set((state) => ({
        history: state.history.map((cmd) =>
          cmd.id === runningCmd.id ? { ...cmd, status: 'aborted', output: '^C (Aborted by user)' } : cmd
        ),
        isProcessing: false,
        activeController: null
      }));
    }
  },
  
  clearHistory: () => set({ history: [], isProcessing: false, activeController: null, activePayloadContext: null }),

  setActivePayloadContext: (payload) => set({ activePayloadContext: payload }),
}));
