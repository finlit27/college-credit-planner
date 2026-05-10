import { z } from "zod";

// ── Intake (form-submitted, camelCase web convention) ───────────────────────

export const GradeSchema = z.union([
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);

/**
 * GPA bucket midpoints — matches the CLI's gpa_map.
 * The CLI maps user choice 1-5 to {1.5, 2.2, 2.7, 3.2, 3.7}.
 */
export const GpaBucketSchema = z.union([
  z.literal(1.5),
  z.literal(2.2),
  z.literal(2.7),
  z.literal(3.2),
  z.literal(3.7),
]);

export const MajorKeySchema = z.enum([
  "stem",
  "health",
  "business",
  "social",
  "humanities",
  "arts",
  "undecided",
]);

export const TargetKeySchema = z.enum([
  "uc",
  "csu",
  "private",
  "undecided",
  "transfer",
]);

/** Region ID matches the YAML's `region_id` ("1"–"11"). */
export const RegionIdSchema = z.enum([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
]);

export const IntakeSchema = z
  .object({
    name: z.string().trim().min(1).max(30),
    grade: GradeSchema,
    gpa: GpaBucketSchema,
    onlineOnly: z.boolean(),
    regionId: RegionIdSchema.optional(),
    major: MajorKeySchema,
    target: TargetKeySchema,
  })
  .refine((d) => d.onlineOnly || d.regionId !== undefined, {
    message: "regionId is required unless onlineOnly is true",
    path: ["regionId"],
  });

export type Intake = z.infer<typeof IntakeSchema>;

// ── Plan (structured output, snake_case to match Python CLI JSON) ───────────

/**
 * Plan fields use snake_case so the JSON shape is byte-identical to the
 * Python CLI's `--json` output. The parity test compares these fields
 * directly against fixtures generated from the CLI.
 */

export const GpaStatusSchema = z.enum(["alert", "note", "ok"]);

export const PlanStudentSchema = z.object({
  name: z.string(),
  grade: z.number().int().min(9).max(12),
  gpa: z.number(),
  gpa_status: GpaStatusSchema,
});

export const PlanCollegeSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  summer_cap: z.number().int(),
  backup: z.string().nullable(),
  why: z.string().nullable(),
  region_label: z.string().nullable(),
});

export const PlanCourseSchema = z.object({
  priority: z.number().int(),
  course: z.string(),
  reason: z.string(),
});

export const PlanMajorTrackSchema = z.object({
  key: MajorKeySchema,
  label: z.string(),
  sequence: z.array(PlanCourseSchema),
});

export const PlanTargetSchema = z.object({
  key: TargetKeySchema,
  label: z.string(),
  note: z.string(),
});

export const PlanGradeRoadmapEntrySchema = z.object({
  grade: z.number().int().min(9).max(12),
  is_current: z.boolean(),
  unit_target: z.string(),
  summer_action: z.string(),
  school_year_action: z.string(),
  milestone: z.string(),
  warning: z.string(),
});

export const PlanCalGetcAreaSchema = z.object({
  code: z.string(),
  title: z.string(),
  example: z.string(),
});

export const PlanSavingsRowSchema = z.object({
  units: z.number().int(),
  time: z.string(),
  csu: z.string(),
  uc: z.string(),
  private: z.string(),
});

export const PlanMistakeSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  detail: z.string(),
});

export const PlanSchema = z.object({
  schema_version: z.literal(1),
  generated_at: z.string(), // ISO date (YYYY-MM-DD)
  student: PlanStudentSchema,
  online_only: z.boolean(),
  college: PlanCollegeSchema,
  major_track: PlanMajorTrackSchema,
  target: PlanTargetSchema,
  grade_roadmap: z.array(PlanGradeRoadmapEntrySchema),
  cal_getc_areas: z.array(PlanCalGetcAreaSchema),
  savings_table: z.array(PlanSavingsRowSchema),
  common_mistakes: z.array(PlanMistakeSchema),
  unit_target_at_graduation: z.string(),
});

export type Plan = z.infer<typeof PlanSchema>;
export type PlanCollege = z.infer<typeof PlanCollegeSchema>;
export type PlanCourse = z.infer<typeof PlanCourseSchema>;
export type PlanGradeRoadmapEntry = z.infer<typeof PlanGradeRoadmapEntrySchema>;

// ── ShareRecord (what we persist to Upstash) ────────────────────────────────

export const ShareRecordSchema = z.object({
  shareId: z.string().length(10),
  plan: PlanSchema,
  createdAt: z.string().datetime(),
});

export type ShareRecord = z.infer<typeof ShareRecordSchema>;
