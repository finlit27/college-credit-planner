export interface CalGetcArea {
  code: string;
  title: string;
  example: string;
}

/**
 * Cal-GETC (California General Education Transfer Curriculum) areas.
 * Replaced IGETC for new CCC students starting fall 2025.
 *
 * Source: CLI's `areas` list in generate_student_plan.py
 */
export const CAL_GETC_AREAS: ReadonlyArray<CalGetcArea> = [
  { code: "Area 1", title: "English Communication", example: "English 1A" },
  {
    code: "Area 2",
    title: "Mathematical Concepts & Quantitative Reasoning",
    example: "Statistics or Calculus",
  },
  {
    code: "Area 3A",
    title: "Arts & Humanities — Arts",
    example: "Art History, Music, Film, or Theater",
  },
  {
    code: "Area 3B",
    title: "Arts & Humanities — Humanities",
    example: "Literature, Philosophy, or History",
  },
  {
    code: "Area 4",
    title: "Social & Behavioral Sciences",
    example: "Psychology, Sociology, or Economics",
  },
  {
    code: "Area 5A",
    title: "Physical & Biological Sciences — Physical",
    example: "Chemistry, Physics, or Astronomy",
  },
  {
    code: "Area 5B",
    title: "Physical & Biological Sciences — Biological",
    example: "Biology or Earth Science (w/ lab)",
  },
];
