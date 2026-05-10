import { z } from "zod";
import collegesJson from "@/data/colleges.json";

export const CollegeSchema = z.object({
  id: z.string(),
  region_id: z.string(),
  region_label: z.string(),
  college: z.string(),
  why: z.string(),
  summer_cap: z.number().int(),
  url: z.string().url(),
  backup: z.string(),
  application_deadline: z.string().nullable().optional(),
  fees_waived_under_ccap: z.boolean().nullable().optional(),
  fees_outside_ccap: z.string().nullable().optional(),
  scraper_notes: z.string().nullable().optional(),
});

export const CollegesFileSchema = z.object({
  last_updated: z.string(),
  source: z.string(),
  schema_version: z.number().int(),
  notes: z.string().optional(),
  colleges: z.array(CollegeSchema).min(1),
});

export type College = z.infer<typeof CollegeSchema>;
export type CollegesFile = z.infer<typeof CollegesFileSchema>;

const parsed = CollegesFileSchema.parse(collegesJson);

export const COLLEGES_DATA: CollegesFile = parsed;

/** Map from region_id ("1"-"11") to College. */
export const COLLEGES_BY_REGION: Record<string, College> = Object.fromEntries(
  parsed.colleges.map((c) => [c.region_id, c])
);

/** Map from id ("el_camino", etc.) to College. */
export const COLLEGES_BY_ID: Record<string, College> = Object.fromEntries(
  parsed.colleges.map((c) => [c.id, c])
);

/** Online-only students go to Orange Coast College regardless of region. */
const ONLINE_ONLY_FALLBACK_ID = "orange_coast";

/**
 * Resolves the recommended college for a given (regionId, onlineOnly) pair.
 * Mirrors the CLI's logic in compute_plan_data().
 */
export function getCollege(
  regionId: string | undefined,
  onlineOnly: boolean
): College {
  if (onlineOnly) {
    const occ = COLLEGES_BY_ID[ONLINE_ONLY_FALLBACK_ID];
    if (!occ) {
      throw new Error(
        `Online-only fallback college not found: ${ONLINE_ONLY_FALLBACK_ID}`
      );
    }
    return occ;
  }

  if (!regionId) {
    throw new Error("regionId is required when onlineOnly is false");
  }

  const college = COLLEGES_BY_REGION[regionId];
  if (!college) {
    throw new Error(`Unknown regionId: ${regionId}`);
  }
  return college;
}
