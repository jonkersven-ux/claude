import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-surface-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold text-surface-900">
              Host<span className="text-brand-600">IQ</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/login" className="btn-primary">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="badge-blue mb-4 inline-flex">Corporate Sports Hospitality Platform</div>
        <h1 className="text-5xl font-bold tracking-tight text-surface-900 leading-tight">
          Turn every skybox visit into
          <br />
          <span className="text-brand-600">measurable business impact</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-500 leading-relaxed">
          HostIQ is the operating system for corporate sports hospitality. Plan
          seasons, manage guests, automate invitations, and measure ROI — all in
          one premium platform built for commercial teams.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/login" className="btn-primary px-8 py-3 text-base">
            Start free trial
          </Link>
          <Link href="#modules" className="btn-secondary px-8 py-3 text-base">
            See how it works
          </Link>
        </div>
      </section>

      {/* KPIs strip */}
      <section className="border-y border-surface-200 bg-surface-50">
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-8 px-6 py-12 text-center">
          {[
            { value: "3.2x", label: "Average ROI increase" },
            { value: "94%", label: "Guest attendance rate" },
            { value: "67%", label: "More pipeline influenced" },
            { value: "40hrs", label: "Saved per season" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-brand-600">{stat.value}</p>
              <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-surface-900">
          Everything you need to maximize hospitality ROI
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-surface-500">
          Six integrated modules designed specifically for commercial teams
          managing corporate sports hospitality investments.
        </p>
        <div className="mt-16 grid grid-cols-3 gap-8">
          {[
            {
              title: "Season Planning",
              description:
                "Import fixtures, tag matches by priority, define strategic objectives, and allocate seats across your season.",
            },
            {
              title: "Guest Intelligence CRM",
              description:
                "A purpose-built CRM with commercial value scoring, relationship tracking, and AI-powered deal probability.",
            },
            {
              title: "Invitation Flow",
              description:
                "Branded invitations, RSVP tracking, dietary preferences, QR check-in, and automated reminders.",
            },
            {
              title: "Host Companion App",
              description:
                "Mobile matchday interface with guest briefs, live note capture, voice-to-text, and instant follow-up creation.",
            },
            {
              title: "ROI Dashboard",
              description:
                "Cost per guest, deals influenced, revenue per match, attendance rates, and pipeline impact — all filterable.",
            },
            {
              title: "AI Engine",
              description:
                "Automated follow-up emails, guest prioritization, conversation summaries, and utilization alerts.",
            },
          ].map((mod) => (
            <div key={mod.title} className="card-padded">
              <h3 className="text-lg font-semibold text-surface-900">
                {mod.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-500">
                {mod.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-20 text-center">
        <h2 className="text-3xl font-bold text-white">
          Ready to transform your hospitality investment?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-brand-100">
          Join forward-thinking commercial teams that treat hospitality as a
          strategic business tool, not just a cost center.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-base font-medium text-brand-700 transition-colors hover:bg-brand-50"
        >
          Start your free trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-surface-400">
          &copy; {new Date().getFullYear()} HostIQ. The operating system for corporate sports hospitality.
        </div>
      </footer>
    </div>
  );
}
