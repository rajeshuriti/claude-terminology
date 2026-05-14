import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { tw } from '@/lib/dm';
import {
  mcpSections,
  lifecycleSteps,
  mcpServers,
  mcpRisks,
  mcpWorkflows,
  SECTION_GROUP_META,
  SEVERITY_COLORS,
  ACTOR_COLORS,
  VIEW_MODE_META,
} from '@/data/mcpMasteryData';
import type { MCPSectionDef, MCPViewMode, MCPServerInfo, MCPRisk } from '@/data/mcpMasteryData';

const GROUP_ORDER = ['foundation', 'technical', 'ecosystem', 'production', 'advanced'] as const;

// ── DescriptionRenderer ───────────────────────────────────────────────────────

function DescriptionRenderer({ text, dm }: { text: string; dm: boolean }) {
  const blocks = text.trim().split('\n\n');
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const first = lines[0];
        if (first.startsWith('## ')) {
          const heading = first.slice(3);
          const body = lines.slice(1).join('\n').trim();
          return (
            <div key={i}>
              <div className="text-sm font-bold mb-1.5" style={{ color: '#8b5cf6' }}>{heading}</div>
              {body && <DescriptionRenderer text={body} dm={dm} />}
            </div>
          );
        }
        if (lines.every(l => l.startsWith('- ') || l.trim() === '')) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.filter(l => l.startsWith('- ')).map((line, j) => (
                <li key={j} className="flex gap-2 text-sm">
                  <span style={{ color: '#8b5cf6' }} className="shrink-0">•</span>
                  <span className={tw(dm, 'body')}>{line.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{block}</p>
        );
      })}
    </div>
  );
}

// ── CodeBlock ─────────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="rounded-xl p-4 text-xs font-mono overflow-x-auto bg-slate-950 text-emerald-300 leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

// ── StandardSectionView ───────────────────────────────────────────────────────

function StandardSectionView({ section, dm }: { section: MCPSectionDef; dm: boolean }) {
  return (
    <div className="space-y-5">
      {section.analogy && (
        <div className={`rounded-xl p-4 ${dm ? 'bg-amber-950/30 border border-amber-800/40' : 'bg-amber-50 border border-amber-200'}`}
          style={{ borderLeft: '3px solid #d97706' }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#d97706' }}>Analogy</div>
          <p className={`text-sm italic ${tw(dm, 'body')}`}>{section.analogy}</p>
        </div>
      )}

      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#8b5cf6' }}>Overview</div>
        <DescriptionRenderer text={section.overview} dm={dm} />
      </div>

      {section.keyPoints && (
        <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#0ea5e9' }}>Key Takeaways</div>
          <div className="space-y-2.5">
            {section.keyPoints.map((point, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                  {i + 1}
                </span>
                <span className={tw(dm, 'body')}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.codeExample && (
        <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#10b981' }}>Code Example</div>
          <CodeBlock code={section.codeExample} />
        </div>
      )}
    </div>
  );
}

// ── LifecycleSectionView ──────────────────────────────────────────────────────

function LifecycleSectionView({ section, dm }: { section: MCPSectionDef; dm: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const step = lifecycleSteps[activeStep];
  const actorColor = ACTOR_COLORS[step.actorType] ?? '#8b5cf6';

  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <DescriptionRenderer text={section.overview} dm={dm} />
      </div>

      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#0ea5e9' }}>
          8-Step Lifecycle — click a step to explore
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {lifecycleSteps.map((s, i) => {
            const color = ACTOR_COLORS[s.actorType] ?? '#8b5cf6';
            const isActive = i === activeStep;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isActive
                    ? 'text-white border-transparent'
                    : dm ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
                style={isActive ? { background: color, borderColor: color } : {}}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={isActive ? { background: 'rgba(255,255,255,0.25)' } : { color }}>
                  {i + 1}
                </span>
                {s.actor}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: actorColor }}>
                {activeStep + 1}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: actorColor }}>
                  {step.actor}
                </div>
                <div className={`text-base font-semibold ${tw(dm, 'heading')}`}>{step.action}</div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{step.detail}</p>
            {step.code && <CodeBlock code={step.code} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {section.keyPoints && (
        <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#0ea5e9' }}>Key Takeaways</div>
          <div className="space-y-2.5">
            {section.keyPoints.map((point, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>
                  {i + 1}
                </span>
                <span className={tw(dm, 'body')}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ServersSectionView ────────────────────────────────────────────────────────

function ServersSectionView({ section, dm }: { section: MCPSectionDef; dm: boolean }) {
  const [selected, setSelected] = useState<MCPServerInfo | null>(null);

  if (selected) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          ← Back to all servers
        </button>

        <div className={`rounded-xl p-6 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
          <div className="flex items-start gap-4 mb-5">
            <span className="text-4xl">{selected.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-xl font-bold ${tw(dm, 'heading')}`}>{selected.name}</div>
              <div className={`text-sm ${tw(dm, 'muted')}`}>{selected.tagline}</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold shrink-0"
              style={{ background: selected.color + '22', color: selected.color }}>
              {selected.category}
            </span>
          </div>

          <div className={`text-sm italic p-3 rounded-lg mb-5 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}
            style={{ borderLeft: `3px solid ${selected.color}` }}>
            {selected.analogy}
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: selected.color }}>What It Enables</div>
              <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{selected.whatItEnables}</p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>Use Cases</div>
              <div className="space-y-1.5">
                {selected.useCases.map((uc, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span style={{ color: '#10b981' }} className="shrink-0 mt-0.5">→</span>
                    <span className={tw(dm, 'body')}>{uc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8b5cf6' }}>Tool Examples</div>
              <div className="flex flex-wrap gap-2">
                {selected.toolExamples.map((t, i) => (
                  <code key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 text-emerald-300 font-mono">{t}</code>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${dm ? 'border-red-500/30 bg-red-950/20' : 'border-red-200 bg-red-50'}`}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#ef4444' }}>Security Guidance</div>
              <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{selected.security}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <DescriptionRenderer text={section.overview} dm={dm} />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {mcpServers.map(server => (
          <button
            key={server.id}
            onClick={() => setSelected(server)}
            className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${tw(dm, 'card')} ${
              dm ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl shrink-0">{server.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${tw(dm, 'heading')}`}>{server.name}</div>
                <div className={`text-xs ${tw(dm, 'muted')} truncate`}>{server.tagline}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                style={{ background: server.color + '22', color: server.color }}>
                {server.category}
              </span>
            </div>
            <div className={`text-xs ${tw(dm, 'muted')}`}>
              {server.toolExamples.length} tools · explore →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── SecuritySectionView ───────────────────────────────────────────────────────

function SecuritySectionView({ section, dm }: { section: MCPSectionDef; dm: boolean }) {
  const [selectedRisk, setSelectedRisk] = useState<MCPRisk | null>(null);
  const severities = ['critical', 'high', 'medium', 'low'] as const;

  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <DescriptionRenderer text={section.overview} dm={dm} />
      </div>

      {severities.map(sev => {
        const risks = mcpRisks.filter(r => r.severity === sev);
        const colors = SEVERITY_COLORS[sev];
        return (
          <div key={sev}>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <div className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{ background: colors.badge, color: colors.text }}>
                {sev}
              </div>
              <div className={`text-xs ${tw(dm, 'muted')}`}>
                {risks.length} risk{risks.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="space-y-2">
              {risks.map(risk => {
                const isOpen = selectedRisk?.id === risk.id;
                return (
                  <div key={risk.id}>
                    <button
                      onClick={() => setSelectedRisk(isOpen ? null : risk)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${tw(dm, 'card')} ${
                        isOpen
                          ? dm ? 'border-slate-500 rounded-b-none' : 'border-slate-300 rounded-b-none'
                          : tw(dm, 'border')
                      }`}
                      style={{ borderLeft: `3px solid ${colors.text}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${tw(dm, 'heading')}`}>{risk.title}</div>
                          <div className={`text-xs mt-0.5 ${tw(dm, 'muted')}`}>{risk.description}</div>
                        </div>
                        <span className="text-xs shrink-0 mt-1" style={{ color: colors.text }}>
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`p-4 rounded-b-xl border border-t-0 space-y-4 ${
                            dm ? 'bg-slate-800/80 border-slate-500' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text }}>
                                Real Example
                              </div>
                              <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{risk.realExample}</p>
                            </div>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#10b981' }}>
                                Mitigation
                              </div>
                              <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{risk.mitigation}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── SimulationsView ───────────────────────────────────────────────────────────

function SimulationsView({ section, dm }: { section: MCPSectionDef; dm: boolean }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const workflow = mcpWorkflows[selectedWorkflow];
  const currentStep = workflow.steps[activeStep];
  const stepColor = ACTOR_COLORS[currentStep.actorType] ?? '#8b5cf6';

  const handleWorkflowSelect = (i: number) => {
    setSelectedWorkflow(i);
    setActiveStep(0);
  };

  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <DescriptionRenderer text={section.overview} dm={dm} />
      </div>

      <div className="flex flex-wrap gap-2">
        {mcpWorkflows.map((wf, i) => (
          <button
            key={wf.id}
            onClick={() => handleWorkflowSelect(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              selectedWorkflow === i
                ? 'bg-violet-600 text-white border-violet-600'
                : dm
                  ? 'border-slate-700 text-slate-300 hover:border-slate-500'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span>{wf.emoji}</span>
            {wf.title}
          </button>
        ))}
      </div>

      <div className={`rounded-xl p-5 border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{workflow.emoji}</span>
          <div>
            <div className={`font-bold ${tw(dm, 'heading')}`}>{workflow.title}</div>
            <div className={`text-sm ${tw(dm, 'muted')}`}>{workflow.description}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {workflow.steps.map((s, i) => {
            const color = ACTOR_COLORS[s.actorType] ?? '#8b5cf6';
            const isActive = i === activeStep;
            return (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isActive
                    ? 'text-white border-transparent'
                    : dm ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
                style={isActive ? { background: color, borderColor: color } : {}}
              >
                <span className="font-bold">{i + 1}</span>
                {s.actor}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedWorkflow}-${activeStep}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: stepColor }}>
                {activeStep + 1}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: stepColor }}>
                  {currentStep.actor}
                </div>
                <div className={`font-semibold ${tw(dm, 'heading')}`}>{currentStep.action}</div>
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{currentStep.detail}</p>
          </motion.div>
        </AnimatePresence>

        <div className={`flex items-center justify-between mt-5 pt-4 border-t ${tw(dm, 'border')}`}>
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeStep === 0
                ? dm ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                : dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ← Previous
          </button>
          <span className={`text-xs ${tw(dm, 'muted')}`}>
            Step {activeStep + 1} of {workflow.steps.length}
          </span>
          <button
            onClick={() => setActiveStep(Math.min(workflow.steps.length - 1, activeStep + 1))}
            disabled={activeStep === workflow.steps.length - 1}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeStep === workflow.steps.length - 1
                ? dm ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                : dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function MCPMasteryPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;

  const [viewMode, setViewMode] = useState<MCPViewMode>('developer');
  const [selectedSectionId, setSelectedSectionId] = useState('what-is-mcp');

  const selectedSection = mcpSections.find(s => s.id === selectedSectionId) ?? mcpSections[0];
  const groupedSections = GROUP_ORDER.map(group => ({
    group,
    meta: SECTION_GROUP_META[group],
    sections: mcpSections.filter(s => s.group === group),
  }));

  const modeMeta = VIEW_MODE_META[viewMode];

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm, 'page')}`}>
      {/* Left sidebar */}
      <div className={`w-60 shrink-0 flex flex-col border-r ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        {/* Header + mode selector */}
        <div className={`p-3 border-b ${tw(dm, 'border')}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔌</span>
            <div>
              <div className={`text-sm font-bold leading-tight ${tw(dm, 'heading')}`}>MCP Mastery</div>
              <div className={`text-xs ${tw(dm, 'muted')}`}>20 sections · 5 domains</div>
            </div>
          </div>

          <div className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${tw(dm, 'muted')}`}>
            Learning Mode
          </div>
          <div className="space-y-0.5">
            {(Object.keys(VIEW_MODE_META) as MCPViewMode[]).map(mode => {
              const meta = VIEW_MODE_META[mode];
              const isActive = mode === viewMode;
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'text-white font-medium'
                      : dm
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                  style={isActive ? { background: meta.color } : {}}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto p-2">
          {groupedSections.map(({ group, meta, sections }) => (
            <div key={group} className="mb-3">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span className="text-xs">{meta.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              {sections.map(s => {
                const isActive = s.id === selectedSectionId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectionId(s.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all mb-0.5 ${
                      isActive
                        ? 'text-white font-medium'
                        : dm
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    style={isActive ? { background: meta.color } : {}}
                  >
                    <span className="mr-1.5">{s.emoji}</span>
                    {s.title}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Section header */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl leading-none mt-0.5">{selectedSection.emoji}</span>
              <div className="flex-1 min-w-0">
                <h1 className={`text-2xl font-bold leading-tight ${tw(dm, 'heading')}`}>
                  {selectedSection.title}
                </h1>
                <p className={`text-sm mt-1 ${tw(dm, 'muted')}`}>{selectedSection.tagline}</p>
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full font-medium text-white shrink-0"
                style={{ background: modeMeta.color }}>
                {modeMeta.label}
              </div>
            </div>
            <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              <span>{SECTION_GROUP_META[selectedSection.group].emoji}</span>
              <span>{SECTION_GROUP_META[selectedSection.group].label}</span>
              <span className="opacity-50">·</span>
              <span className={`font-medium ${tw(dm, 'muted')}`}>{modeMeta.description}</span>
            </div>
          </div>

          {/* Section content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSectionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedSection.type === 'lifecycle' && (
                <LifecycleSectionView section={selectedSection} dm={dm} />
              )}
              {selectedSection.type === 'servers' && (
                <ServersSectionView section={selectedSection} dm={dm} />
              )}
              {selectedSection.type === 'security' && (
                <SecuritySectionView section={selectedSection} dm={dm} />
              )}
              {selectedSection.type === 'simulation' && (
                <SimulationsView section={selectedSection} dm={dm} />
              )}
              {selectedSection.type === 'standard' && (
                <StandardSectionView section={selectedSection} dm={dm} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
