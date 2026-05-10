/**
 * sync-colleges.ts — reads the CLI's data/colleges.yaml and writes a typed
 * JSON snapshot to src/data/colleges.json.
 *
 * Run: npm run sync-colleges
 *
 * The CLI project (Python WAT framework at ~/COMMUNITY COLLEGE CREDIT) is the
 * source of truth for SoCal community college data. This script extracts that
 * data, validates it, and commits a JSON snapshot the web app builds against.
 *
 * Cadence: run whenever the CLI's colleges.yaml changes (typically 2× per year
 * after the annual refresh workflow). Commit the resulting JSON.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";
import { z } from "zod";

const CollegeEntrySchema = z.object({
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

const CollegesFileSchema = z.object({
  last_updated: z.string(),
  source: z.string(),
  schema_version: z.number().int(),
  notes: z.string().optional(),
  colleges: z.array(CollegeEntrySchema).min(1),
});

function resolveSourcePath(): string {
  // Allow override for CI / alternate dev setups; default to standard location.
  const envOverride = process.env.CC_PLANNER_YAML_PATH;
  if (envOverride) return envOverride;
  return path.join(os.homedir(), "COMMUNITY COLLEGE CREDIT", "data", "colleges.yaml");
}

function main() {
  const source = resolveSourcePath();

  if (!fs.existsSync(source)) {
    console.error(`✗ Source file not found: ${source}`);
    console.error(
      "  Set CC_PLANNER_YAML_PATH to override, or ensure the CLI project is checked out."
    );
    process.exit(2);
  }

  const raw = fs.readFileSync(source, "utf-8");
  let parsedYaml: unknown;
  try {
    // JSON_SCHEMA keeps strings as strings (no Date auto-parsing). The YAML
    // file stores `last_updated: 2026-05-09` which we want as a string.
    parsedYaml = yaml.load(raw, { schema: yaml.JSON_SCHEMA });
  } catch (err) {
    console.error(`✗ Failed to parse YAML: ${(err as Error).message}`);
    process.exit(3);
  }

  const result = CollegesFileSchema.safeParse(parsedYaml);
  if (!result.success) {
    console.error("✗ Schema validation failed:");
    console.error(JSON.stringify(result.error.issues, null, 2));
    process.exit(4);
  }

  const outDir = path.join(__dirname, "..", "src", "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "colleges.json");
  fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2) + "\n");

  console.log(`✓ Synced ${result.data.colleges.length} colleges`);
  console.log(`  Source: ${source}`);
  console.log(`  Output: ${path.relative(process.cwd(), outPath)}`);
  console.log(`  CLI data last_updated: ${result.data.last_updated}`);
}

main();
