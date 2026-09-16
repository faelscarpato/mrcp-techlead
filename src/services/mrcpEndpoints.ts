import { fetchMrcp } from './mrcpClient';

export const mrcpEndpoints = {
  /**
   * Health check / Code Metrics
   * GET /api/code-health?repo=<url>
   */
  health: async (url: string, controller?: AbortController) => {
    return fetchMrcp<unknown>(`/code-health?repo=${encodeURIComponent(url)}`, {
      method: 'GET',
      signal: controller?.signal,
    });
  },

  /**
   * Complex AST analyze
   * GET /api/analyze?repo=<url>
   */
  analyzeRepository: async (url: string, controller?: AbortController) => {
    return fetchMrcp<unknown>(`/analyze?repo=${encodeURIComponent(url)}`, {
      method: 'GET',
      signal: controller?.signal,
    });
  },
  
  /**
   * Security Audit
   * GET /api/security-audit?repo=<url>
   */
  securityAudit: async (url: string, controller?: AbortController) => {
    return fetchMrcp<unknown>(`/security-audit?repo=${encodeURIComponent(url)}`, {
      method: 'GET',
      signal: controller?.signal,
    });
  },

  /**
   * Document Analyzer
   * GET /api/document-analyzer?repo=<url>
   */
  documentAnalyzer: async (url: string, controller?: AbortController) => {
    return fetchMrcp<unknown>(`/document-analyzer?repo=${encodeURIComponent(url)}`, {
      method: 'GET',
      signal: controller?.signal,
    });
  },
  
  /**
   * Context Pruning Pack (Phase 3 helper)
   * GET /api/context-pack?repo=<url>&task=<desc>
   */
  contextPack: async (url: string, task: string, controller?: AbortController) => {
    return fetchMrcp<unknown>(`/context-pack?repo=${encodeURIComponent(url)}&task=${encodeURIComponent(task)}`, {
      method: 'GET',
      signal: controller?.signal,
    });
  }
};
