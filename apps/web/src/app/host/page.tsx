"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

const matchGuests = [
  {
    id: "1",
    name: "Peter van den Berg",
    company: "ACME Corp",
    role: "CEO",
    value: "VERY_HIGH",
    dealStage: "Qualification",
    dealValue: "€450K",
    talkingPoints: [
      "Interested in digital transformation platform",
      "Expanding into DACH region — potential pilot partner",
      "Avid Ajax fan, season ticket holder privately",
    ],
    dietary: "No restrictions",
    checkedIn: true,
  },
  {
    id: "2",
    name: "Maria Hendriks",
    company: "GlobalTech",
    role: "VP Procurement",
    value: "HIGH",
    dealStage: "Negotiation",
    dealValue: "€180K",
    talkingPoints: [
      "Annual renewal due January — discuss terms early",
      "Concerned about support SLA — address proactively",
      "Recently promoted — congratulate",
    ],
    dietary: "Vegetarian",
    checkedIn: true,
  },
  {
    id: "3",
    name: "Thomas Smit",
    company: "InnovaTech",
    role: "CTO",
    value: "HIGH",
    dealStage: "No active deal",
    dealValue: "—",
    talkingPoints: [
      "Series B funded — expanding engineering team",
      "Looking for enterprise SaaS tooling",
      "Background in AI/ML — connect over tech vision",
    ],
    dietary: "No restrictions",
    checkedIn: false,
  },
  {
    id: "4",
    name: "Emma de Groot",
    company: "Dutch Finance Group",
    role: "Managing Director",
    value: "VERY_HIGH",
    dealStage: "Proposal",
    dealValue: "€320K",
    talkingPoints: [
      "Long-standing strategic partner — deepen relationship",
      "Interested in our new analytics module",
      "Ask about Q1 budget planning timeline",
    ],
    dietary: "Gluten-free",
    checkedIn: true,
  },
];

export default function HostAppPage() {
  const [activeGuest, setActiveGuest] = useState(matchGuests[0]);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Array<{ guest: string; text: string; time: string }>>([]);

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes([
      { guest: activeGuest.name, text: noteText, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) },
      ...notes,
    ]);
    setNoteText("");
  };

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Mobile-style header */}
      <header className="sticky top-0 z-10 border-b border-surface-700 bg-surface-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
                <span className="text-xs font-bold text-white">H</span>
              </div>
              <span className="text-sm font-bold text-white">
                Host<span className="text-brand-400">IQ</span>
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white">Ajax vs Feyenoord</p>
            <p className="text-xs text-surface-400">Sun 25 Oct, 18:45</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg">
        {/* Guest selector tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {matchGuests.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGuest(g)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                activeGuest.id === g.id
                  ? "bg-brand-600 text-white"
                  : "bg-surface-800 text-surface-300 hover:bg-surface-700"
              }`}
            >
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${g.checkedIn ? "bg-emerald-400" : "bg-surface-500"}`} />
              {g.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Active guest card */}
        <div className="px-4">
          <div className="rounded-xl bg-surface-800 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/20 text-sm font-bold text-brand-400">
                  {activeGuest.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-white">{activeGuest.name}</p>
                  <p className="text-xs text-surface-400">{activeGuest.role} at {activeGuest.company}</p>
                </div>
              </div>
              <StatusBadge status={activeGuest.value} />
            </div>

            {/* Deal info */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-700 p-3">
                <p className="text-xs text-surface-400">Deal Stage</p>
                <p className="mt-0.5 text-sm font-medium text-white">{activeGuest.dealStage}</p>
              </div>
              <div className="rounded-lg bg-surface-700 p-3">
                <p className="text-xs text-surface-400">Deal Value</p>
                <p className="mt-0.5 text-sm font-medium text-white">{activeGuest.dealValue}</p>
              </div>
            </div>

            {/* Talking points */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400">Talking Points</p>
              <ul className="mt-2 space-y-2">
                {activeGuest.talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-200">
                    <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-[10px] font-bold text-brand-400">
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dietary */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-700 p-2.5">
              <svg className="h-4 w-4 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
              </svg>
              <span className="text-xs text-surface-300">{activeGuest.dietary}</span>
            </div>
          </div>

          {/* Note capture */}
          <div className="mt-4 rounded-xl bg-surface-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Quick Note</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-surface-600 bg-surface-700 px-3 py-2.5 text-sm text-white placeholder:text-surface-500 focus:border-brand-500 focus:outline-none"
                placeholder="Capture a conversation note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
              />
              <button
                onClick={addNote}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save
              </button>
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-lg border border-surface-600 py-2 text-xs font-medium text-surface-300 hover:bg-surface-700">
                Voice Note
              </button>
              <button className="flex-1 rounded-lg border border-surface-600 py-2 text-xs font-medium text-surface-300 hover:bg-surface-700">
                Create Task
              </button>
              <button className="flex-1 rounded-lg border border-surface-600 py-2 text-xs font-medium text-surface-300 hover:bg-surface-700">
                AI Summary
              </button>
            </div>
          </div>

          {/* Recent notes */}
          {notes.length > 0 && (
            <div className="mt-4 rounded-xl bg-surface-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Notes Captured</p>
              <div className="space-y-2">
                {notes.map((note, i) => (
                  <div key={i} className="rounded-lg bg-surface-700 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-400">{note.guest}</span>
                      <span className="text-xs text-surface-500">{note.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-surface-200">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-in status */}
          <div className="mt-4 mb-8 rounded-xl bg-surface-800 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">Guest Status</p>
            <div className="space-y-2">
              {matchGuests.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg bg-surface-700 px-3 py-2">
                  <span className="text-sm text-surface-200">{g.name}</span>
                  <span className={`text-xs font-medium ${g.checkedIn ? "text-emerald-400" : "text-surface-500"}`}>
                    {g.checkedIn ? "Checked in" : "Not arrived"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
