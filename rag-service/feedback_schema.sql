-- ─────────────────────────────────────────────────────────────────────────
-- Phase 8: Feedback Loop Schema
-- Add these two tables to your existing PostgreSQL or Firebase database.
-- Every user interaction is a training signal. Collect from day one.
-- ─────────────────────────────────────────────────────────────────────────

-- Table 1: Every suggestion shown to a user
CREATE TABLE suggestion_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    session_id       UUID NOT NULL,
    suggestion_type  VARCHAR(50),   -- 'keyword', 'bullet', 'structure'
    suggestion_text  TEXT,
    score_before     INT,
    score_after      INT,
    was_applied      BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Table 2: Did the user get an interview?
-- This becomes your most valuable dataset after 1,000 confirmations.
CREATE TABLE interview_outcomes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL,
    job_role         VARCHAR(100),
    resume_version   TEXT,          -- the improved resume text
    got_interview    BOOLEAN,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- Indices for common query patterns
CREATE INDEX idx_suggestion_user    ON suggestion_events(user_id);
CREATE INDEX idx_suggestion_session ON suggestion_events(session_id);
CREATE INDEX idx_outcome_role       ON interview_outcomes(job_role);
CREATE INDEX idx_outcome_result     ON interview_outcomes(got_interview);
