export const MRCP_BASE_URL = 'https://mrcp-engine.vercel.app/api';

export class MrcpApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'MrcpApiError';
    this.status = status;
  }
}

export async function fetchMrcp<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${MRCP_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Not JSON
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new MrcpApiError(errorMessage, response.status);
    }

    return await response.json() as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('^C (Request aborted by user)');
    }
    throw error;
  }
}
