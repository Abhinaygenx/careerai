import { NextRequest, NextResponse } from 'next/server';

const AUTO_APPLY_URL = process.env.AUTO_APPLY_SERVICE_URL || 'http://localhost:5000';

// Hard timeout so Next.js never waits more than 25s
const FETCH_TIMEOUT_MS = 25_000;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const params = new URLSearchParams({
        search_term: searchParams.get('search_term') || 'Software Engineer',
        location: searchParams.get('location') || 'India',
        results_wanted: searchParams.get('results_wanted') || '20',
        resume_text: searchParams.get('resume_text') || '',
        platforms: searchParams.get('platforms') || 'indeed,glassdoor,google',
        is_remote: searchParams.get('is_remote') || 'false',
        experience_level: searchParams.get('experience_level') || '',
        min_match_score: searchParams.get('min_match_score') || '0',
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const upstream = await fetch(`${AUTO_APPLY_URL}/api/discover?${params.toString()}`, {
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timer);

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${upstream.status}`, jobs: [] },
                { status: upstream.status }
            );
        }

        const data = await upstream.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        clearTimeout(timer);
        const isTimeout = err instanceof Error && err.name === 'AbortError';
        console.error('[auto-apply/search] Error:', err);
        return NextResponse.json(
            {
                error: isTimeout ? 'Job search timed out — showing cached results' : 'Job discovery service unavailable',
                jobs: [],
                fallback: true,
            },
            { status: 503 }
        );
    }
}

