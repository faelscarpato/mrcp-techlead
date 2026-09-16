import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { targetUrl, method = 'GET', headers = {}, body } = await req.json();

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing targetUrl' }), { status: 400 });
    }

    const options: RequestInit = {
      method,
      headers: {
        ...headers,
      },
    };

    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(targetUrl, options);

    // If it's a stream, we pipe it back directly
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Otherwise return JSON or Text
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
