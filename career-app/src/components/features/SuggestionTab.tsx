/**
 * components/features/SuggestionTab.tsx — Phase 7
 * AI Suggestions tab for the ATS Checker page.
 * Renders the RAG pipeline output: score improvement, missing keywords,
 * bullet rewrites, structural issues, and strengths.
 *
 * Drop-in — does NOT modify any existing scoring logic.
 */

"use client";

import { useState } from "react";
import { useSuggestions } from "@/hooks/useSuggestions";
import type { MissingKeyword, WeakBullet, StructuralIssue } from "@/hooks/useSuggestions";
import styles from "./SuggestionTab.module.css";

interface SuggestionTabProps {
  resumeText: string;
  jobDescription: string;
  jobRole?: string;
}

export default function SuggestionTab({
  resumeText,
  jobDescription,
  jobRole,
}: SuggestionTabProps) {
  const { data, loading, error, getSuggestions, reset } = useSuggestions();
  const [hasRun, setHasRun] = useState(false);

  const handleAnalyse = async () => {
    if (!resumeText || resumeText.length < 100) {
      alert("Please paste your resume text first (min 100 characters).");
      return;
    }
    if (!jobDescription || jobDescription.length < 50) {
      alert("Please enter a job description first (min 50 characters).");
      return;
    }
    setHasRun(true);
    await getSuggestions(resumeText, jobDescription, jobRole);
  };

  const handleReset = () => {
    reset();
    setHasRun(false);
  };

  // ── Score delta badge ────────────────────────────────────────────────────
  const ScoreDelta = () => {
    if (!data) return null;
    const delta = data.score_projected - data.score_current;
    return (
      <div className={styles.scoreBanner}>
        <div className={styles.scoreBlock}>
          <span className={styles.scoreLabel}>Current Score</span>
          <span className={`${styles.scoreValue} ${styles.current}`}>
            {data.score_current}
          </span>
        </div>
        <div className={styles.arrow}>→</div>
        <div className={styles.scoreBlock}>
          <span className={styles.scoreLabel}>After Suggestions</span>
          <span className={`${styles.scoreValue} ${styles.projected}`}>
            {data.score_projected}
          </span>
        </div>
        <div className={styles.deltaBadge}>
          +{delta} pts
        </div>
      </div>
    );
  };

  // ── Missing keywords ──────────────────────────────────────────────────────
  const KeywordsSection = ({ keywords }: { keywords: MissingKeyword[] }) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>🔑</span> Missing Keywords
        <span className={styles.badge}>{keywords.length}</span>
      </h3>
      <div className={styles.kwGrid}>
        {keywords.map((kw, i) => (
          <div key={i} className={styles.kwCard}>
            <div className={styles.kwTop}>
              <strong>{kw.keyword}</strong>
              <span className={styles.kwFreq}>
                {kw.frequency}/5 benchmarks
              </span>
            </div>
            <div className={styles.kwWhere}>
              Add to: <span className={styles.kwTag}>{kw.where_to_add}</span>
            </div>
            <div className={styles.kwExample}>
              &ldquo;{kw.example_usage}&rdquo;
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Bullet rewrites ───────────────────────────────────────────────────────
  const BulletsSection = ({ bullets }: { bullets: WeakBullet[] }) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>✏️</span> Bullet Rewrites
        <span className={styles.badge}>{bullets.length}</span>
      </h3>
      {bullets.map((b, i) => (
        <div key={i} className={styles.bulletCard}>
          <div className={styles.bulletBefore}>
            <span className={styles.bulletLabel}>Before</span>
            <p>{b.original}</p>
          </div>
          <div className={styles.bulletArrow}>→</div>
          <div className={styles.bulletAfter}>
            <span className={styles.bulletLabel}>After</span>
            <p>{b.rewrite}</p>
          </div>
          <div className={styles.bulletMeta}>
            <span className={styles.bulletReason}>{b.reason}</span>
            <span className={styles.bulletImpact}>+{b.score_impact} pts</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Structural issues ─────────────────────────────────────────────────────
  const IssuesSection = ({ issues }: { issues: StructuralIssue[] }) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>⚠️</span> Structural Issues
        <span className={styles.badge}>{issues.length}</span>
      </h3>
      {issues.map((iss, i) => (
        <div key={i} className={styles.issueCard}>
          <div className={styles.issueTop}>
            <strong>{iss.issue}</strong>
            <span className={styles.bulletImpact}>+{iss.score_impact} pts</span>
          </div>
          <p className={styles.issueFix}>→ {iss.fix}</p>
        </div>
      ))}
    </div>
  );

  // ── Strengths ─────────────────────────────────────────────────────────────
  const StrengthsSection = ({ strengths }: { strengths: string[] }) => (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>💪</span> Strengths
      </h3>
      <ul className={styles.strengthsList}>
        {strengths.map((s, i) => (
          <li key={i} className={styles.strengthItem}>
            <span className={styles.strengthCheck}>✓</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2>AI Suggestions</h2>
          <p>
            Compares your resume against{" "}
            <strong>480+ benchmark resumes</strong> that got interviews.
          </p>
        </div>
        <div className={styles.headerActions}>
          {hasRun && (
            <button className={styles.resetBtn} onClick={handleReset}>
              Reset
            </button>
          )}
          <button
            className={styles.analyseBtn}
            onClick={handleAnalyse}
            disabled={loading}
            id="rag-analyse-btn"
          >
            {loading ? (
              <>
                <span className={styles.spinner} /> Analysing…
              </>
            ) : (
              "Get AI Suggestions"
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {error}
          <p className={styles.errorHint}>
            Make sure the RAG service is running:{" "}
            <code>uvicorn api.main:app --reload --port 8001</code>
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.loadingStep}>
            <span className={styles.spinnerLg} />
            <span>Finding similar benchmark resumes…</span>
          </div>
          <div className={styles.loadingStep}>
            <span className={styles.spinnerLg} />
            <span>Generating Claude suggestions…</span>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className={styles.results}>
          {/* Top insight card */}
          <div className={styles.insightCard}>
            <span className={styles.insightIcon}>💡</span>
            <div>
              <div className={styles.insightLabel}>Top Insight</div>
              <p className={styles.insightText}>{data.top_insight}</p>
            </div>
          </div>

          {/* Benchmark insight */}
          <div className={styles.benchmarkCard}>
            <span className={styles.benchmarkIcon}>📊</span>
            <div>
              <div className={styles.insightLabel}>What Top Candidates Do Differently</div>
              <p className={styles.insightText}>{data.benchmark_insight}</p>
            </div>
          </div>

          {/* Score delta */}
          <ScoreDelta />

          {/* Sections */}
          {data.missing_keywords?.length > 0 && (
            <KeywordsSection keywords={data.missing_keywords} />
          )}
          {data.weak_bullets?.length > 0 && (
            <BulletsSection bullets={data.weak_bullets} />
          )}
          {data.structural_issues?.length > 0 && (
            <IssuesSection issues={data.structural_issues} />
          )}
          {data.strengths?.length > 0 && (
            <StrengthsSection strengths={data.strengths} />
          )}

          {/* Pipeline metadata */}
          <div className={styles.metaFooter}>
            Analysed against <strong>{data.benchmarks_used}</strong> benchmark resumes ·{" "}
            avg similarity <strong>{Math.round(data.avg_similarity * 100)}%</strong>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && !error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🤖</div>
          <p>
            Click <strong>Get AI Suggestions</strong> to compare your resume
            against 480+ winning benchmark resumes and receive personalised
            improvement suggestions powered by Claude.
          </p>
          <p className={styles.emptyHint}>
            Make sure you&apos;ve pasted your resume text and job description above.
          </p>
        </div>
      )}
    </div>
  );
}
