import { mrcpEndpoints } from './mrcpEndpoints';
import type { LlmProvider } from '@/store/authStore';

export interface LlmOrchestratorOptions {
  repoUrl: string;
  question: string;
  apiKey: string;
  model: string;
  provider: LlmProvider;
  payloadContext?: unknown;
  controller: AbortController;
  onChunk: (chunk: string) => void;
}

export const llmOrchestrator = async ({
  repoUrl,
  question,
  apiKey,
  model,
  provider,
  payloadContext,
  controller,
  onChunk
}: LlmOrchestratorOptions) => {
  
  if (!apiKey) {
    throw new Error('API Key missing. Use "mrcp auth set openai <YOUR_KEY>" first.');
  }

  // 1. Get the context pruning pack from MRCP Engine
  let contextData: unknown;
  if (repoUrl && repoUrl !== 'chat') {
    onChunk('Fetching context-pack from MRCP Engine...\n\n');
    try {
      contextData = await mrcpEndpoints.contextPack(repoUrl, question, controller);
    } catch (err: unknown) {
      throw new Error(`Failed to fetch context: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  let systemPrompt = `You are an expert Principal Software Engineer interacting via the MRCP Web Terminal.
Use the provided context to answer the user's question accurately. Be concise, write code blocks when suggesting refactors.`;

  if (contextData) {
    systemPrompt += `\n\nContext Pack:\n${JSON.stringify(contextData, null, 2)}`;
  }

  if (payloadContext) {
    systemPrompt += `\n\nThe user has explicitly attached the following MRCP AST payload for you to analyze:\n${JSON.stringify(payloadContext, null, 2)}`;
  }

  // 2. Prepare LLM Request (Assuming OpenAI format for simplicity, as many providers are OpenAI compatible)
  const targetUrl = provider === 'nvidia' 
    ? 'https://integrate.api.nvidia.com/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
    
  onChunk('> Context loaded. Connecting to LLM stream...\n\n');

  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true
      }
    }),
    signal: controller.signal
  });

  if (!res.ok) {
    throw new Error(`LLM API Error: ${res.status} ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (reader && !done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunkValue = decoder.decode(value);
      const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.includes('[DONE]')) return;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
  }
};
