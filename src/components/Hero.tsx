export function Hero() {
  return (
    <section className="container mx-auto px-4 pt-10 pb-6 sm:pt-16 sm:pb-10">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block bg-[#1B4332]/5 text-[#1B4332] text-xs font-medium tracking-wider uppercase rounded-full px-4 py-1.5 mb-6 border border-[#1B4332]/10">
          {/* TODO: Christopher — final pill copy */}
          CFO Strategy for High-School Families
        </span>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#1B4332] font-semibold leading-tight tracking-tight">
          {/* TODO: Christopher — final hero headline */}
          Graduate high school with{" "}
          <span className="text-[#B68D40]">two years of college</span> already
          paid for.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#4A5568] leading-relaxed max-w-2xl mx-auto">
          {/* TODO: Christopher — final hero lead paragraph */}
          California pays for dual enrollment at every community college.
          Answer a few questions and we&apos;ll build your free, personalized
          plan — the same one a financial executive would draw up for their
          own kid.
        </p>
      </div>
    </section>
  );
}
