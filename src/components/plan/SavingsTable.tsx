import type { Plan } from "@/lib/schema";

type Props = {
  rows: Plan["savings_table"];
  targetKey: Plan["target"]["key"];
};

const COLUMN_LABEL: Record<Plan["target"]["key"], string> = {
  csu: "What you save going CSU",
  uc: "What you save going UC",
  private: "What you save going private",
  undecided: "What you save",
  transfer: "What you save before transfer",
};

export function SavingsTable({ rows, targetKey }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        {COLUMN_LABEL[targetKey] ?? "What you save"}
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        The math, by destination
      </h2>

      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        Family tuition + fees you avoid by completing community-college units
        before you arrive. 2025–26 figures.
      </p>

      <div className="mt-6 -mx-2 sm:mx-0 overflow-x-auto">
        <table className="w-full text-sm tabular-nums border-separate border-spacing-0">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-[#6B7280]">
              <th scope="col" className="text-left font-medium px-2 py-2">
                Units
              </th>
              <th scope="col" className="text-left font-medium px-2 py-2">
                Time
              </th>
              <th scope="col" className="text-right font-medium px-2 py-2">
                CSU
              </th>
              <th scope="col" className="text-right font-medium px-2 py-2">
                UC
              </th>
              <th scope="col" className="text-right font-medium px-2 py-2">
                Private
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.units}
                className={
                  i === rows.length - 1
                    ? "font-semibold text-[#1B4332]"
                    : "text-[#4A5568]"
                }
              >
                <td className="px-2 py-3 border-t border-[#E8E4DC]">
                  {r.units}
                </td>
                <td className="px-2 py-3 border-t border-[#E8E4DC]">
                  {r.time}
                </td>
                <Cell value={r.csu} highlight={targetKey === "csu"} />
                <Cell value={r.uc} highlight={targetKey === "uc"} />
                <Cell value={r.private} highlight={targetKey === "private"} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ value, highlight }: { value: string; highlight: boolean }) {
  return (
    <td
      className={[
        "px-2 py-3 border-t border-[#E8E4DC] text-right",
        highlight ? "text-[#1B4332] font-semibold" : "",
      ].join(" ")}
    >
      {value}
    </td>
  );
}
