import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

// Ranked fallback chain based on active Gemini API models to guarantee 100% uptime
const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.1-pro-preview',
  'gemini-pro-latest',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

/**
 * Resolve effective model name:
 * If 'auto', pick the top active model.
 */
function resolveModelName(requestedModel?: string): string {
  if (!requestedModel || requestedModel === 'auto') {
    return 'gemini-3.6-flash';
  }
  return requestedModel;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      apiKey: clientApiKey,
      model: requestedModel = 'auto',
      temperature = 0.7,
      stream = false,
      systemInstruction,
      prompt
    } = body;

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Gemini API Key belum disetel. Masukkan API Key di menu Pengaturan (ikon gerigi) atau di file .env.local.'
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetModel = resolveModelName(requestedModel);

    // Sequence of models to try
    const modelCandidates = [
      targetModel,
      ...FALLBACK_MODELS.filter((m) => m !== targetModel)
    ];

    // Handle Streaming for drafting & lengthy tasks
    if (stream) {
      let activeStream = null;
      let lastErr: Error | null = null;

      for (const m of modelCandidates) {
        try {
          activeStream = await ai.models.generateContentStream({
            model: m,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction || 'Kamu adalah asisten editor dan penulis novel profesional berpengalaman.',
              temperature: typeof temperature === 'number' ? temperature : 0.7
            }
          });
          break; // successfully connected to stream
        } catch (err: unknown) {
          lastErr = err instanceof Error ? err : new Error(String(err));
          console.warn(`Streaming with model ${m} failed, attempting next candidate...`, err);
        }
      }

      if (!activeStream) {
        return NextResponse.json(
          { error: `Semua model gagal dihubungi: ${lastErr?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      const encoder = new TextEncoder();
      const streamToRead = activeStream;

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamToRead) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (err: unknown) {
            console.error('Stream reading error:', err);
            const message = err instanceof Error ? err.message : 'Stream processing failed';
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
            );
            controller.close();
          }
        }
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive'
        }
      });
    }

    // Non-streaming standard response with automatic fallback
    let responseText = '';
    let lastErr: Error | null = null;

    for (const m of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: prompt,
          config: {
            systemInstruction: systemInstruction || 'Kamu adalah asisten editor dan penulis novel profesional berpengalaman.',
            temperature: typeof temperature === 'number' ? temperature : 0.7
          }
        });
        responseText = response.text || '';
        break; // Success!
      } catch (err: unknown) {
        lastErr = err instanceof Error ? err : new Error(String(err));
        console.warn(`Generate with model ${m} failed, attempting fallback...`, err);
      }
    }

    if (!responseText && lastErr) {
      throw lastErr;
    }

    return NextResponse.json({ text: responseText });
  } catch (error: unknown) {
    console.error('Gemini API Route Error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses permintaan AI ke Gemini.';
    return NextResponse.json(
      {
        error: message
      },
      { status: 500 }
    );
  }
}
