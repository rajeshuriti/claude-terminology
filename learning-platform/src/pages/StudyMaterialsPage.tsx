import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, BookOpen, ChevronDown, ChevronRight,
  FileText, Trophy, AlertCircle, CheckCircle2, Info,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { examDomains, examInfo, examScenarios, outOfScope } from '@/data/examGuideData';

// ─── PDF Download Card ────────────────────────────────────────────────────────

const pdfs = [
  {
    id: 'glossary',
    title: 'Master Terminology & Concepts Reference',
    subtitle: 'Claude Solution Architect Foundation',
    description: '85+ concepts across 13 domains — prompt engineering, tool use, MCP, agents, RAG, safety, and production infrastructure.',
    pages: 15,
    filename: 'claude-sa-foundation-master-glossary.pdf',
    color: '#0ea5e9',
    icon: '📖',
  },
  {
    id: 'examguide',
    title: 'Certification Exam Guide',
    subtitle: 'Claude Certified Architect – Foundations',
    description: 'Official exam guide with 5 domains, 27 task statements, 12 sample questions with explanations, and preparation exercises.',
    pages: 40,
    filename: 'claude-certified-architect-foundations-exam-guide.pdf',
    color: '#8b5cf6',
    icon: '🏆',
  },
];

function PdfCard({ pdf, dm }: { pdf: typeof pdfs[0]; dm: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${pdf.color}20` }}>
          {pdf.icon}
        </div>
        <div className="min-w-0">
          <div className={`text-sm font-bold leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{pdf.title}</div>
          <div className="text-xs font-medium mt-0.5" style={{ color: pdf.color }}>{pdf.subtitle}</div>
          <div className={`text-xs mt-2 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{pdf.description}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{pdf.pages} pages · PDF</span>
        <a
          href={`/pdfs/${pdf.filename}`}
          download={pdf.filename}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: pdf.color }}
        >
          <Download size={14} />
          Download PDF
        </a>
      </div>
      <div className={`text-xs rounded-lg px-3 py-2 ${dm ? 'bg-amber-900/20 text-amber-300 border border-amber-700/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
        ⚠ Place the PDF file at <code className="font-mono">/public/pdfs/{pdf.filename}</code> for the download link to work.
      </div>
    </div>
  );
}

// ─── Domain Weight Bar ────────────────────────────────────────────────────────

function DomainWeightBar({ dm }: { dm: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
        Exam Domain Weights
      </div>
      <div className="flex h-6 rounded-full overflow-hidden mb-4">
        {examDomains.map(d => (
          <div key={d.id} className="h-full transition-all" title={`${d.title}: ${d.weight}%`}
            style={{ width: `${d.weight}%`, backgroundColor: d.color }} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {examDomains.map(d => (
          <div key={d.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <div className="min-w-0">
              <div className={`text-xs font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{d.weight}%</div>
              <div className={`text-xs truncate ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Domain {d.number}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subdomain Card ───────────────────────────────────────────────────────────

function SubdomainCard({ subdomain, domainColor, dm }: {
  subdomain: typeof examDomains[0]['subdomains'][0];
  domainColor: string;
  dm: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'knowledge' | 'skills'>('knowledge');

  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${dm ? 'hover:bg-slate-700/60' : 'hover:bg-slate-50'}`}>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg shrink-0"
          style={{ backgroundColor: `${domainColor}20`, color: domainColor }}>
          {subdomain.id}
        </span>
        <span className={`text-sm font-medium flex-1 ${dm ? 'text-white' : 'text-slate-900'}`}>
          {subdomain.title}
        </span>
        <div className={`flex items-center gap-3 shrink-0 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="text-xs">{subdomain.knowledge.length}K · {subdomain.skills.length}S</span>
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
      </button>

      {open && (
        <div className={`border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          {/* Tab selector */}
          <div className={`flex gap-1 px-4 py-2 border-b ${dm ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
            <button onClick={() => setTab('knowledge')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                tab === 'knowledge'
                  ? 'text-white'
                  : dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              style={tab === 'knowledge' ? { backgroundColor: domainColor } : {}}>
              📚 Knowledge ({subdomain.knowledge.length})
            </button>
            <button onClick={() => setTab('skills')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                tab === 'skills'
                  ? 'text-white'
                  : dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              style={tab === 'skills' ? { backgroundColor: domainColor } : {}}>
              ⚡ Skills ({subdomain.skills.length})
            </button>
          </div>

          <div className="p-4">
            {tab === 'knowledge' && (
              <ul className="space-y-2">
                {subdomain.knowledge.map((k, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="text-sky-400 mt-0.5 shrink-0">○</span>
                    {k}
                  </li>
                ))}
              </ul>
            )}
            {tab === 'skills' && (
              <ul className="space-y-2">
                {subdomain.skills.map((s, i) => (
                  <li key={i} className={`text-xs flex items-start gap-2 leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Domain Section ───────────────────────────────────────────────────────────

function DomainSection({ domain, defaultOpen, dm }: {
  domain: typeof examDomains[0];
  defaultOpen: boolean;
  dm: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
        <span className="text-2xl">{domain.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>
              Domain {domain.number}: {domain.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ backgroundColor: domain.color }}>
              {domain.weight}%
            </span>
          </div>
          <div className={`text-xs mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            {domain.subdomains.length} task statements · {domain.subdomains.reduce((a, s) => a + s.knowledge.length + s.skills.length, 0)} knowledge & skill points
          </div>
        </div>
        {open ? <ChevronDown size={18} className={dm ? 'text-slate-400' : 'text-slate-500'} /> : <ChevronRight size={18} className={dm ? 'text-slate-400' : 'text-slate-500'} />}
      </button>

      {open && (
        <div className={`border-t px-4 py-4 space-y-3 ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
          {domain.subdomains.map(sub => (
            <SubdomainCard key={sub.id} subdomain={sub} domainColor={domain.color} dm={dm} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function StudyMaterialsPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [activeSection, setActiveSection] = useState<'overview' | 'domains' | 'scenarios' | 'outofscope'>('overview');

  const textPrimary = dm ? 'text-white' : 'text-slate-900';
  const textMuted = dm ? 'text-slate-400' : 'text-slate-500';
  const cardBg = dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'domains', label: 'Exam Topics', icon: '📚' },
    { id: 'scenarios', label: 'Scenarios', icon: '🎭' },
    { id: 'outofscope', label: 'Out of Scope', icon: '🚫' },
  ] as const;

  return (
    <div className={`min-h-full ${dm ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={20} className="text-sky-500" />
            <h1 className={`text-xl font-bold ${textPrimary}`}>Exam Study Materials</h1>
          </div>
          <p className={`text-sm ${textMuted}`}>
            Official exam guide, study PDFs, and complete domain breakdown for the Claude Certified Architect – Foundations certification.
          </p>
        </div>

        {/* Exam info banner */}
        <div className={`rounded-2xl border p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 ${dm ? 'bg-gradient-to-r from-violet-900/20 to-sky-900/20 border-violet-700/30' : 'bg-gradient-to-r from-violet-50 to-sky-50 border-violet-200'}`}>
          {[
            { label: 'Passing Score', value: `${examInfo.passingScore}/1,000`, color: 'text-emerald-500' },
            { label: 'Score Range', value: examInfo.scoreRange, color: 'text-sky-500' },
            { label: 'Format', value: 'Multiple Choice', color: 'text-violet-500' },
            { label: 'Scenarios / Exam', value: `${examInfo.scenariosPerExam} of ${examInfo.totalScenarios}`, color: 'text-amber-500' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
              <div className={`text-xs ${textMuted}`}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* PDF Downloads */}
        <div className="mb-6">
          <div className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textMuted}`}>
            <Download size={12} className="inline mr-1" />
            Study PDFs
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdfs.map(pdf => <PdfCard key={pdf.id} pdf={pdf} dm={dm} />)}
          </div>
        </div>

        {/* Tab navigation */}
        <div className={`flex gap-1 mb-5 p-1 rounded-2xl overflow-x-auto ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveSection(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === t.id
                  ? 'bg-sky-500 text-white'
                  : dm ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              }`}>
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {/* ── Overview ── */}
            {activeSection === 'overview' && (
              <div className="space-y-5">
                <DomainWeightBar dm={dm} />

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Domains', value: '5', sub: 'Content areas' },
                    { label: 'Task Statements', value: '27', sub: 'Subdomains' },
                    { label: 'Scenarios', value: '6 total / 4 per exam', sub: 'Scenario-based' },
                    { label: 'Updated', value: 'Feb 2025', sub: 'Version 0.1' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-2xl border p-4 text-center ${cardBg}`}>
                      <div className={`text-xl font-bold text-sky-500`}>{s.value}</div>
                      <div className={`text-xs font-semibold ${textPrimary}`}>{s.label}</div>
                      <div className={`text-xs ${textMuted}`}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Domain summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {examDomains.map(d => (
                    <button key={d.id} onClick={() => setActiveSection('domains')}
                      className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${cardBg}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{d.emoji}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: d.color }}>
                          {d.weight}%
                        </span>
                      </div>
                      <div className={`text-sm font-semibold mb-1 ${textPrimary}`}>Domain {d.number}</div>
                      <div className={`text-xs leading-snug ${textMuted}`}>{d.title}</div>
                      <div className={`text-xs mt-2 ${textMuted}`}>{d.subdomains.length} task statements</div>
                    </button>
                  ))}
                </div>

                {/* Key tips */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className={`text-sm font-semibold mb-3 ${textPrimary}`}>
                    <Info size={15} className="inline mr-1.5 text-sky-500" />
                    Exam Preparation Tips
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { tip: 'Build an agent with the Claude Agent SDK — implement a complete agentic loop with tool calling, error handling, and session management.', icon: '🤖' },
                      { tip: 'Configure Claude Code for a real project — set up CLAUDE.md hierarchy, path-specific rules, custom skills with context: fork.', icon: '⚙️' },
                      { tip: 'Design and test MCP tools — write descriptions that differentiate similar tools, implement structured error responses.', icon: '🔧' },
                      { tip: 'Build a structured data extraction pipeline — use tool_use with JSON schemas, implement validation-retry loops.', icon: '📊' },
                      { tip: 'Practice prompt engineering — write few-shot examples for ambiguous scenarios, define explicit review criteria.', icon: '✍️' },
                      { tip: 'Study context management — extract structured facts from verbose outputs, implement scratchpad files for long sessions.', icon: '🛡️' },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs rounded-xl p-3 ${dm ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <span className="shrink-0">{item.icon}</span>
                        <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{item.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Domains ── */}
            {activeSection === 'domains' && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 text-xs rounded-xl p-3 ${dm ? 'bg-sky-900/20 text-sky-300 border border-sky-700/30' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
                  <Info size={14} className="shrink-0" />
                  Each task statement lists Knowledge (what you must understand) and Skills (what you must be able to do). Click a subdomain to expand it.
                </div>
                {examDomains.map((d, i) => (
                  <DomainSection key={d.id} domain={d} defaultOpen={i === 0} dm={dm} />
                ))}
              </div>
            )}

            {/* ── Scenarios ── */}
            {activeSection === 'scenarios' && (
              <div className="space-y-4">
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className={`text-sm font-semibold mb-1 ${textPrimary}`}>How Scenarios Work</div>
                  <p className={`text-xs leading-relaxed ${textMuted}`}>
                    The exam presents 4 randomly selected scenarios from the 6 below. Each scenario frames a set of multiple-choice questions within a realistic production context. Questions test practical judgment about architecture, configuration, and tradeoffs — not just conceptual knowledge.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examScenarios.map((s, i) => {
                    const domains = s.domains.map(did => examDomains.find(d => d.id === did)!).filter(Boolean);
                    return (
                      <div key={s.id} className={`rounded-2xl border p-5 ${cardBg}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {s.id}
                          </span>
                          <span className={`text-xs ${textMuted}`}>Scenario {i + 1} of 6</span>
                        </div>
                        <div className={`text-sm font-semibold mb-3 ${textPrimary}`}>{s.title}</div>
                        <div className={`text-xs mb-2 ${textMuted}`}>Primary domains:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {domains.map(d => (
                            <span key={d.id} className="text-xs px-2 py-1 rounded-lg font-medium text-white"
                              style={{ backgroundColor: d.color }}>
                              {d.emoji} D{d.number}: {d.title.split(' ').slice(0, 2).join(' ')}…
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sample questions callout */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className={`text-sm font-semibold mb-3 ${textPrimary}`}>
                    <Trophy size={15} className="inline mr-1.5 text-amber-500" />
                    Practice Exam on This Platform
                  </div>
                  <p className={`text-xs leading-relaxed mb-3 ${textMuted}`}>
                    The Cert Practice Exam section contains 30 scenario-based questions covering all 5 domains. Use it to test your readiness.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Customer Support Resolution Agent (D1, D2, D5)',
                      'Multi-Agent Research System (D1, D2, D5)',
                      'Claude Code for CI/CD (D3, D4)',
                      'Structured Data Extraction (D4, D5)',
                    ].map((q, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs rounded-lg p-2 ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                        {q}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Out of Scope ── */}
            {activeSection === 'outofscope' && (
              <div className="space-y-4">
                <div className={`rounded-2xl border p-5 ${dm ? 'bg-rose-900/20 border-rose-700/30' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-rose-500" />
                    <span className={`text-sm font-semibold ${dm ? 'text-rose-300' : 'text-rose-800'}`}>Topics NOT on the Exam</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${dm ? 'text-rose-200' : 'text-rose-700'}`}>
                    The following topics are explicitly excluded from the Claude Certified Architect – Foundations exam. Do not spend study time on these areas.
                  </p>
                </div>

                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {outOfScope.map((item, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs rounded-lg p-3 ${dm ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <span className="text-rose-400 shrink-0 mt-0.5">✗</span>
                        <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className={`text-sm font-semibold mb-3 ${textPrimary}`}>
                    <FileText size={15} className="inline mr-1.5 text-sky-500" />
                    What IS in scope
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Agentic loop implementation (stop_reason, tool result handling)',
                      'Multi-agent orchestration (coordinator-subagent, task decomposition)',
                      'Tool interface design (descriptions, error responses, tool_choice)',
                      'MCP server configuration (.mcp.json, scoping, env vars)',
                      'CLAUDE.md hierarchy (@import, .claude/rules/, path scoping)',
                      'Custom commands & skills (context: fork, allowed-tools)',
                      'Plan mode vs direct execution decision criteria',
                      'Structured output via tool_use (JSON schemas, nullable fields)',
                      'Few-shot prompting (ambiguous scenarios, format consistency)',
                      'Message Batches API (latency tolerance, custom_id, cost savings)',
                      'Context window optimization (trimming, fact extraction, position effects)',
                      'Human review workflows (confidence calibration, stratified sampling)',
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs rounded-lg p-2.5 ${dm ? 'bg-slate-700' : 'bg-slate-50'}`}>
                        <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                        <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
