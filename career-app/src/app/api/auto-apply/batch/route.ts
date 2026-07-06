import { NextRequest } from 'next/server';

const AUTO_APPLY_URL = process.env.AUTO_APPLY_SERVICE_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const upstream = await fetch(`${AUTO_APPLY_URL}/api/batch-apply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!upstream.ok || !upstream.body) {
                    const errEvent = `event: error\ndata: ${JSON.stringify({ message: 'Upstream error' })}\n\n`;
                    controller.enqueue(encoder.encode(errEvent));
                    controller.close();
                    return;
                }

                const reader = upstream.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                }
            } catch (err) {
                const errEvent = `event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`;
                controller.enqueue(encoder.encode(errEvent));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
