import { Leaf } from "lucide-react";

export function BrandHeader() {
  return (
    <header className="bg-white border-b border-[#E8E4DC]">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a
          href="https://finlitgarden.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-[#1B4332] flex items-center justify-center">
            <Leaf className="w-6 h-6 text-[#B68D40]" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-xl font-bold text-[#1B4332] font-serif leading-none">
              FinLit
            </span>
            <span className="block text-xs text-[#1B4332] font-semibold tracking-wider uppercase mt-0.5">
              Garden
            </span>
          </div>
        </a>
        <nav>
          <a
            href="https://finlitgarden.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1B4332] hover:bg-[#143526] text-white rounded-full px-5 py-2 text-sm font-medium transition-colors"
          >
            Visit FinLit Garden
          </a>
        </nav>
      </div>
    </header>
  );
}
