const testimonials = [
  {
    name: "Ritika, Mumbai",
    quote: "The AI astrologer replicated the warmth of my family guru and gave me actionable remedies for my career."
  },
  {
    name: "Vikas, Bengaluru",
    quote: "Kundli matching was instant and aligned with what our pandit shared after days. Super impressed!"
  },
  {
    name: "Asha, Delhi",
    quote: "Gemstone consultation plus easy payments in INR—exactly what I needed for my son's education remedies."
  }
];

export const Testimonials = () => (
  <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-6 py-10">
    <h2 className="text-2xl font-semibold text-[color:var(--color-text)]">Loved by seekers everywhere</h2>
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      {testimonials.map((item) => (
        <blockquote key={item.name} className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 text-sm">
          <p className="text-[color:var(--color-text)]">“{item.quote}”</p>
          <footer className="text-xs text-[color:var(--color-text-soft)]">— {item.name}</footer>
        </blockquote>
      ))}
    </div>
  </section>
);



