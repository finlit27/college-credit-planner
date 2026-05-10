import type { Intake, Plan } from "@/lib/schema";
import { getCollege } from "@/lib/colleges";
import { MAJOR_TRACKS } from "@/lib/major-tracks";
import { GRADE_PLANS } from "@/lib/grade-plans";
import { TARGETS } from "@/lib/targets";
import { CAL_GETC_AREAS } from "@/lib/cal-getc";
import { SAVINGS_TABLE } from "@/lib/savings-table";
import { COMMON_MISTAKES } from "@/lib/common-mistakes";

/**
 * Pure plan composition. No I/O, no fetch, no current-time dependency
 * beyond the explicit `generatedAt` injection (allows deterministic tests).
 *
 * Mirrors the Python CLI's `compute_plan_data()` in
 * tools/generate_student_plan.py. Field shape is snake_case to match the
 * CLI's JSON output byte-for-byte (used by the parity test fixtures).
 */
export function generatePlan(
  intake: Intake,
  generatedAt: string = new Date().toISOString().slice(0, 10)
): Plan {
  const college = getCollege(intake.regionId, intake.onlineOnly);
  const track = MAJOR_TRACKS[intake.major];
  const target = TARGETS[intake.target];
  const grade = intake.grade;
  const gpa = intake.gpa;

  let gpaStatus: "alert" | "note" | "ok";
  if (gpa < 2.0) {
    gpaStatus = "alert";
  } else if (gpa < 2.5) {
    gpaStatus = "note";
  } else {
    gpaStatus = "ok";
  }

  // OCC override for online-only: name/url/summer_cap come from the college
  // record itself (orange_coast), but the CLI emits null for backup/why/region_label.
  const onlineOnly = intake.onlineOnly;

  const grade_roadmap = [];
  for (let g = grade; g <= 12; g++) {
    const gp = GRADE_PLANS[g as 9 | 10 | 11 | 12];
    grade_roadmap.push({
      grade: g,
      is_current: g === grade,
      unit_target: gp.unit_target,
      summer_action: gp.summer_action,
      school_year_action: gp.school_year_action,
      milestone: gp.milestone,
      warning: gp.warning,
    });
  }

  const course_sequence = track.sequence.map(([course, reason], i) => ({
    priority: i + 1,
    course,
    reason,
  }));

  return {
    schema_version: 1,
    generated_at: generatedAt,
    student: {
      name: intake.name,
      grade,
      gpa,
      gpa_status: gpaStatus,
    },
    online_only: onlineOnly,
    college: {
      name: college.college,
      url: college.url,
      summer_cap: college.summer_cap,
      backup: onlineOnly ? null : college.backup,
      why: onlineOnly ? null : college.why,
      region_label: onlineOnly ? null : college.region_label,
    },
    major_track: {
      key: track.key,
      label: track.label,
      sequence: course_sequence,
    },
    target: {
      key: target.key,
      label: target.label,
      note: target.note,
    },
    grade_roadmap,
    cal_getc_areas: CAL_GETC_AREAS.map((a) => ({ ...a })),
    savings_table: SAVINGS_TABLE.map((r) => ({ ...r })),
    common_mistakes: COMMON_MISTAKES.map((m, i) => ({
      number: i + 1,
      title: m.title,
      detail: m.detail,
    })),
    unit_target_at_graduation: grade >= 11 ? "30–45 units" : "30–60 units",
  };
}
