export interface SavingsRow {
  units: number;
  time: string;
  csu: string;
  uc: string;
  private: string;
}

/**
 * Ported verbatim from CLI's SAVINGS_TABLE constant.
 * Source: tools/generate_student_plan.py
 *
 * Money values are 2025-26 figures: CSU $6,450/yr, UC $14,436/yr,
 * Private avg COA $65k-$95k/yr.
 */
export const SAVINGS_TABLE: ReadonlyArray<SavingsRow> = [
  {
    units: 15,
    time: "~1 semester",
    csu: "$3,200",
    uc: "$7,200",
    private: "$32,500–$47,500",
  },
  {
    units: 30,
    time: "~1 year",
    csu: "$6,450",
    uc: "$14,436",
    private: "$65,000–$95,000",
  },
  {
    units: 45,
    time: "~1.5 years",
    csu: "$9,675",
    uc: "$21,654",
    private: "$97,500–$142,500",
  },
  {
    units: 60,
    time: "~2 years",
    csu: "$12,900",
    uc: "$28,872",
    private: "$130,000–$190,000",
  },
];
