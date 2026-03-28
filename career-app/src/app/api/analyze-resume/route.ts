import { NextRequest, NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Forward the multipart form to the Python service
        const response = await fetch(`${PYTHON_SERVICE_URL}/analyze`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Service error' }));
            return NextResponse.json(
                { error: error.detail || 'Analysis failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';

        // Specific error for connection refused (Python service not running)
        if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
            return NextResponse.json(
                {
                    error: 'ATS service is unavailable. Please start the Python microservice.',
                    hint: 'Run: cd ats-service && uvicorn main:app --reload',
                },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/health`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ status: 'offline' }, { status: 503 });
    }
}
