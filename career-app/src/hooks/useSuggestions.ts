/**
 * hooks/useSuggestions.ts — Phase 7
 * React hook to call the RAG suggestion engine (port 8001).
 *
 * Usage:
 *   const { data, loading, error, getSuggestions } = useSuggestions();
 *   await getSuggestions(resumeText, jobDescription, jobRole);
 */

"use client";

import { useState, useCallback } from "react";

// Falls back to localhost:8001 in development
const RAG_API_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8001";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MissingKeyword {
  keyword: string;
  frequency: number;
  where_to_add: "skills" | "experience" | "summary";
  example_usage: string;
}

export interface WeakBullet {
  original: string;
  rewrite: string;
  reason: string;
  score_impact: number;
}

export interface StructuralIssue {
  issue: string;
  fix: string;
  score_impact: number;
}

export interface SuggestionData {
  score_current: number;
  score_projected: number;
  top_insight: string;
  missing_keywords: MissingKeyword[];
  weak_bullets: WeakBullet[];
  structural_issues: StructuralIssue[];
  strengths: string[];
  benchmark_insight: string;
  benchmark_keywords: string[];
  benchmarks_used: number;
  avg_similarity: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API call
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSuggestions(
  resumeText: string,
  jobDescription: string,
  jobRole?: string
): Promise<SuggestionData> {
  const res = await fetch(`${RAG_API_URL}/api/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resumeText,
      job_description: jobDescription,
      job_role: jobRole || null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.detail || `RAG API error ${res.status}: ${res.statusText}`
    );
  }

  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSuggestions() {
  const [data, setData] = useState<SuggestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(
    async (
      resumeText: string,
      jobDescription: string,
      jobRole?: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSuggestions(resumeText, jobDescription, jobRole);
        setData(result);
        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, getSuggestions, reset };
}
