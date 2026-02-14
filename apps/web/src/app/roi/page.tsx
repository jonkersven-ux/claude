"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { InsightCard } from "@/components/ui/insight-card";

const roiData = {
  totalSpend: 111400,
  totalRevenue: 450000,
  roi: 304,
  costPerGuest: 876,
  dealsInfluenced: 8,
  pipelineValue: 1475000,
  attendanceRate: 87,
  guestsHosted: 127,
};

const costBreakdown = [
  { category: "Season Pass", amount: 109000, pct: 78 },
  { category: "Catering", amount: 14400, pct: 10 },
  { category: "Transport", amount: 6800, pct: 5 },
  { category: "Gifts", amount: 4200, pct: 3 },
  { category: "Host Fees", amount: 3500, pct: 3 },
  { category: "Other", amount: 1500, pct: 1 },
];

const matchPerformance = [
  { label: "Ajax vs Feyenoord", date: "Oct 25", attended: 16, capacity: 20, utilization: 80, revenue: 180000 },
  { label: "Ajax vs PSV", date: "Nov 22", attended: 14, capacity: 20, utilization: 70, revenue: 120000 },
  { label: "Ajax vs AZ", date: "Dec 13", attended: 12, capacity: 20, utilization: 60, revenue: 85000 },
  { label: "Ajax vs FC Utrecht", date: "Jan 17", attended: 8, capacity: 20, utilization: 40, revenue: 35000 },
  { label: "Ajax vs FC Twente", date: "Feb 14", attended: 10, capacity: 20, utilization: 50, revenue: 30000 },
];

const influencedDeals = [
  { guest: "Peter van den Berg", company: "ACME Corp", value: 450000, stage: "Qualification", probability: 35 },
  { guest: "Emma de Groot", company: "Dutch Finance Group", value: 320000, stage: "Proposal", probability: 55 },
  { guest: "Maria Hendriks", company: "GlobalTech", value: 180000, stage: "Negotiation", probability: 75 },
  { guest: "Daan Kuijpers", company: "MediaWorks", value: 95000, stage: "Qualification", probability: 30 },
  { guest: "Robert Visser", company: "BuildRight BV", value: 75000, stage: "Identified", probability: 15 },
];

const conversionBySegment = [
  { segment: "Very High Value", guestsHosted: 18, dealsInfluenced: 5, revenueAttributed: 285000, conversionRate: 28 },
  { segment: "High Value", guestsHosted: 35, dealsInfluenced: 2, revenueAttributed: 120000, conversionRate: 6 },
  { segment: "Medium Value", guestsHosted: 42, dealsInfluenced: 1, revenueAttributed: 45000, conversionRate: 2 },
  { segment: "Low Value", guestsHosted: 32, dealsInfluenced: 0, revenueAttributed: 0, conversionRate: 0 },
];

export default function RoiPage() {
  return (
    <AppLayout>
      <PageHeader
        title="ROI & Performance"
        description="Measure the commercial impact of your hospitality investment"
        actions={
          <div className="flex gap-3">
            <select className="input w-44">
              <option>Season 2026/2027</option>
              <option>Season 2025/2026</option>
            </select>
            <button className="btn-secondary">Export Report</button>
            <button className="btn-primary">AI Insights</button>
          </div>
        }
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Investment"
          value={`€${(roiData.totalSpend / 1000).toFixed(0)}K`}
          change="Season to date"
        />
        <KpiCard
          label="Attributed Revenue"
          value={`€${(roiData.totalRevenue / 1000).toFixed(0)}K`}
          change={`${roiData.dealsInfluenced} deals influenced`}
          changeType="positive"
        />
        <KpiCard
          label="ROI"
          value={`${roiData.roi}%`}
          change="+48% vs last season"
          changeType="positive"
        />
        <KpiCard
          label="Cost per Guest"
          value={`€${roiData.costPerGuest}`}
          change={`${roiData.guestsHosted} guests hosted`}
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Match performance */}
        <div className="col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Revenue per Match</h2>
          <div className="card-padded">
            <div className="space-y-4">
              {matchPerformance.map((match) => (
                <div key={match.label} className="flex items-center gap-4">
                  <div className="w-40 flex-shrink-0">
                    <p className="text-sm font-medium text-surface-900">{match.label}</p>
                    <p className="text-xs text-surface-500">{match.date}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-6 w-full overflow-hidden rounded bg-surface-100">
                          <div
                            className="h-full rounded bg-brand-500 transition-all"
                            style={{ width: `${(match.revenue / 200000) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-20 text-right text-sm font-medium text-surface-900">
                        &euro;{(match.revenue / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className={`text-xs font-medium ${match.utilization >= 70 ? "text-emerald-600" : match.utilization >= 50 ? "text-orange-600" : "text-red-600"}`}>
                      {match.utilization}% util
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Influenced deals */}
          <h2 className="mb-4 mt-8 text-lg font-semibold text-surface-900">Deals Influenced by Hospitality</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Company</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Stage</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {influencedDeals.map((deal, i) => (
                  <tr key={i} className="hover:bg-surface-50">
                    <td className="px-4 py-3 text-sm font-medium text-surface-900">{deal.guest}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{deal.company}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-surface-900">
                      &euro;{(deal.value / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">{deal.stage}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-200">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-xs text-surface-500">{deal.probability}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-surface-200 bg-surface-50">
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-surface-900">Total Pipeline Influenced</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-brand-600">
                    &euro;{(roiData.pipelineValue / 1000).toFixed(0)}K
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Conversion by segment */}
          <h2 className="mb-4 mt-8 text-lg font-semibold text-surface-900">Conversion by Guest Segment</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Segment</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Guests Hosted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Deals</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {conversionBySegment.map((seg) => (
                  <tr key={seg.segment}>
                    <td className="px-4 py-3 text-sm font-medium text-surface-900">{seg.segment}</td>
                    <td className="px-4 py-3 text-right text-sm text-surface-600">{seg.guestsHosted}</td>
                    <td className="px-4 py-3 text-right text-sm text-surface-600">{seg.dealsInfluenced}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-surface-900">
                      {seg.revenueAttributed > 0 ? `€${(seg.revenueAttributed / 1000).toFixed(0)}K` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-medium ${seg.conversionRate > 10 ? "text-emerald-600" : seg.conversionRate > 0 ? "text-blue-600" : "text-surface-400"}`}>
                        {seg.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Cost breakdown */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-surface-900">Cost Breakdown</h2>
            <div className="card-padded">
              <div className="space-y-3">
                {costBreakdown.map((cost) => (
                  <div key={cost.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-600">{cost.category}</span>
                      <span className="font-medium text-surface-900">
                        &euro;{cost.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-100">
                      <div
                        className="h-full rounded-full bg-brand-400"
                        style={{ width: `${cost.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI ROI insights */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-surface-900">AI Analysis</h2>
            <div className="space-y-3">
              <InsightCard
                type="ROI_INSIGHT"
                title="High ROI from Very High Value guests"
                content="Very High Value guests generate 63% of attributed revenue but represent only 14% of total guests. Consider allocating more A-Match seats to this segment for maximum ROI."
                confidence={0.91}
              />
              <InsightCard
                type="UTILIZATION_ALERT"
                title="Underutilization in Q1 matches"
                content="January and February matches average 45% seat utilization vs 75% in Q4. Consider promoting these matches for employee engagement or partner events to reduce waste."
                confidence={0.87}
              />
              <InsightCard
                type="ROI_INSIGHT"
                title="Account manager performance gap"
                content="Lisa Bakker's guests generate 2.3x more pipeline per event than average. Analyze her approach for best practices to share across the team."
                confidence={0.82}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
