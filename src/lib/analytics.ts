import { track as vercelTrack } from "@vercel/analytics";

/**
 * Allowed primitive values mirror what @vercel/analytics accepts.
 * Keep prop values primitives — no arrays, no objects, no PII.
 */
export type AnalyticsProps = Record<string, string | number | boolean | null>;

/**
 * Funnel + outcome events fired across the planner. Keep this list tight —
 * Vercel Analytics' free tier caps custom-event names, and a sprawling
 * vocabulary makes it harder to read the dashboard.
 *
 * Conventions:
 *  - `intake_*` — IntakeForm interactions (pre-submit)
 *  - `plan_*` — outcomes from /api/plan and the rendered plan page
 *  - Future: `narrative_*`, `newsletter_*` once C2 / C3 ship
 */
export type AnalyticsEvent =
  | "intake_step_advanced"
  | "intake_step_reverted"
  | "plan_submit_started"
  | "plan_created"
  | "plan_submit_failed"
  | "plan_shared"
  | "narrative_loaded"
  | "narrative_failed";

/**
 * Thin wrapper around `track` from @vercel/analytics that never throws.
 * Tracking should never break the user flow — if Analytics is blocked
 * (ad blocker, network failure, missing script tag in preview), we
 * silently swallow the error.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    if (props) {
      vercelTrack(event, props);
    } else {
      vercelTrack(event);
    }
  } catch {
    // Intentional no-op
  }
}
