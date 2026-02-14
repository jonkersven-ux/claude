"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageHeader title="Settings" description="Manage your company account and preferences" />

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <nav className="space-y-1">
          {[
            { label: "Company", active: true },
            { label: "Team Members", active: false },
            { label: "Venues", active: false },
            { label: "Invitation Templates", active: false },
            { label: "AI Prompts", active: false },
            { label: "Integrations", active: false },
            { label: "Billing", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                item.active
                  ? "bg-brand-50 text-brand-700"
                  : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="col-span-3 space-y-6">
          {/* Company details */}
          <div className="card-padded">
            <h2 className="text-lg font-semibold text-surface-900">Company Details</h2>
            <p className="mt-1 text-sm text-surface-500">Manage your organization information.</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="label">Company name</label>
                <input className="input" defaultValue="TechVentures BV" />
              </div>
              <div>
                <label className="label">Company slug</label>
                <input className="input" defaultValue="techventures" disabled />
              </div>
              <div>
                <label className="label">Domain</label>
                <input className="input" defaultValue="techventures.nl" />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="input">
                  <option>Europe/Amsterdam</option>
                  <option>Europe/London</option>
                  <option>Europe/Berlin</option>
                </select>
              </div>
              <div>
                <label className="label">Default currency</label>
                <select className="input">
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>USD</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select className="input">
                  <option>English</option>
                  <option>Dutch</option>
                  <option>German</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-primary">Save changes</button>
            </div>
          </div>

          {/* Plan */}
          <div className="card-padded">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-surface-900">Current Plan</h2>
                <p className="mt-1 text-sm text-surface-500">You are on the Professional plan.</p>
              </div>
              <span className="badge-blue text-sm">Professional</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { plan: "Starter", price: "€299/mo", features: ["5 users", "1 venue", "100 guests", "Basic reporting"], current: false },
                { plan: "Professional", price: "€799/mo", features: ["15 users", "3 venues", "Unlimited guests", "AI features", "ROI dashboard"], current: true },
                { plan: "Enterprise", price: "Custom", features: ["Unlimited", "SSO/SAML", "CRM integrations", "API access", "Dedicated CSM"], current: false },
              ].map((tier) => (
                <div
                  key={tier.plan}
                  className={`rounded-xl border-2 p-5 ${
                    tier.current ? "border-brand-500 bg-brand-50/50" : "border-surface-200"
                  }`}
                >
                  <p className="text-lg font-bold text-surface-900">{tier.plan}</p>
                  <p className="mt-1 text-2xl font-bold text-brand-600">{tier.price}</p>
                  <ul className="mt-4 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
                        <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-4 w-full rounded-lg py-2 text-sm font-medium ${
                      tier.current
                        ? "bg-brand-100 text-brand-700 cursor-default"
                        : "border border-surface-300 text-surface-700 hover:bg-surface-50"
                    }`}
                  >
                    {tier.current ? "Current plan" : "Upgrade"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* API Keys */}
          <div className="card-padded">
            <h2 className="text-lg font-semibold text-surface-900">AI Configuration</h2>
            <p className="mt-1 text-sm text-surface-500">
              Configure your AI provider for automated insights and email generation.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="label">AI Provider</label>
                <select className="input">
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              <div>
                <label className="label">Model</label>
                <input className="input" defaultValue="claude-sonnet-4-20250514" />
              </div>
              <div className="col-span-2">
                <label className="label">API Key</label>
                <input type="password" className="input" placeholder="sk-..." />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-primary">Save AI settings</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
