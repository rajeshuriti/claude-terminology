import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Zap, Eye, Lock, Activity,
  ChevronRight, Play, Square, RotateCcw, ChevronDown, Check, X
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type {
  SecuritySectionId, SecuritySeverity, RiskLevel,
  AttackFlow, GoodBad, IncidentStep,
} from '@/data/aiSecurityData';
import {
  securitySections, mcpRiskEntries, threatEntries,
  redBlueScenarios, incidentTimeline, chaosScenarios,
} from '@/data/aiSecurityData';

// ─── Utilities ───────────────────────────────────────────────────────────────

function severityColor(s: SecuritySeverity | RiskLevel) {
  if (s === 'critical') return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', badge: 'bg-red-500/15 text-red-400 border-red-500/30' };
  if (s === 'high')     return { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (s === 'medium')   return { bg: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500', badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
  return { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
}

function SeverityBadge({ s, label }: { s: SecuritySeverity | RiskLevel; label?: string }) {
  const c = severityColor(s);
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${c.badge}`}>
      {label ?? s}
    </span>
  );
}

// ─── Attack Flow Visualizer ───────────────────────────────────────────────────

function AttackFlowViz({ flows, dm }: { flows: AttackFlow[]; dm: boolean }) {
  const [activeFlow, setActiveFlow] = useState(0);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flow = flows[activeFlow];

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaying(false);
  };

  const reset = () => { stop(); setStep(-1); };

  const play = () => {
    stop();
    setStep(0);
    setPlaying(true);
    timerRef.current = setInterval(() => {
      setStep(prev => {
        if (prev >= flow.steps.length - 1) {
          stop();
          return prev;
        }
        return prev + 1;
      });
    }, 1600);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => { reset(); }, [activeFlow]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {flows.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {flows.map((f, i) => (
            <button key={i} onClick={() => setActiveFlow(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeFlow === i ? 'bg-red-500 text-white' : dm ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      <p className={`text-sm mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{flow.description}</p>

      {/* Node chain */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {flow.steps.map((s, i) => {
          const active = i <= step;
          const current = i === step;
          const c = severityColor(s.risk);
          return (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                animate={current ? { scale: 1.08 } : { scale: 1 }}
                className={`px-3 py-2 rounded-lg border text-xs font-mono transition-all duration-300 ${
                  current  ? `${c.bg} text-white border-transparent shadow-lg shadow-${c.bg}/25` :
                  active   ? `${dm ? 'bg-slate-700' : 'bg-slate-100'} ${c.text} ${c.border}` :
                  dm       ? 'bg-slate-800/60 text-slate-500 border-slate-700' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                {s.node}
              </motion.div>
              {i < flow.steps.length - 1 && (
                <span className={`text-lg font-bold transition-colors duration-300 ${i < step ? 'text-red-400' : dm ? 'text-slate-600' : 'text-slate-300'}`}>→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Step detail */}
      <AnimatePresence mode="wait">
        {step >= 0 && (
          <motion.div key={step}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border mb-4 ${dm ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-xs font-bold mb-1 ${severityColor(flow.steps[step].risk).text}`}>
              Step {step + 1} / {flow.steps.length} — {flow.steps[step].action}
            </div>
            <div className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              {flow.steps[step].detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!playing && step < flow.steps.length - 1 ? (
          <button onClick={play}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-colors">
            <Play size={14} /> {step < 0 ? 'Run Attack Simulation' : 'Resume'}
          </button>
        ) : playing ? (
          <button onClick={stop}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-colors">
            <Square size={14} /> Stop
          </button>
        ) : null}
        {step >= 0 && (
          <button onClick={reset}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dm ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            <RotateCcw size={14} /> Reset
          </button>
        )}
        {step === flow.steps.length - 1 && !playing && (
          <span className="text-xs text-red-400 font-medium flex items-center gap-1">
            <AlertTriangle size={12} /> Attack complete
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Good / Bad Comparison ────────────────────────────────────────────────────

function GoodBadGrid({ items, dm }: { items: GoodBad[]; dm: boolean }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{item.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${dm ? 'bg-red-950/30 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <X size={14} className="text-red-400 shrink-0" />
                <span className="text-sm font-semibold text-red-400">{item.bad}</span>
              </div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{item.badDetail}</p>
            </div>
            <div className={`p-4 rounded-xl border ${dm ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-emerald-400">{item.good}</span>
              </div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{item.goodDetail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MCP Permission Heatmap ───────────────────────────────────────────────────

function McpHeatmap({ dm }: { dm: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const entry = selected !== null ? mcpRiskEntries[selected] : null;

  return (
    <div>
      <p className={`text-sm mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
        Click any MCP server to see capabilities, blast radius, and required mitigations.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {mcpRiskEntries.map((mcp, i) => {
          const c = severityColor(mcp.risk);
          const isSelected = selected === i;
          return (
            <button key={i} onClick={() => setSelected(isSelected ? null : i)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? `${c.bg} text-white border-transparent`
                  : dm
                    ? `bg-slate-800 border-slate-700 hover:border-slate-500 ${c.text}`
                    : `bg-white border-slate-200 hover:border-slate-300 ${c.text}`
              }`}>
              <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-white' : ''}`}>{mcp.risk.toUpperCase()}</div>
              <div className={`text-xs leading-snug ${isSelected ? 'text-white/90' : dm ? 'text-slate-300' : 'text-slate-700'}`}>{mcp.name}</div>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {entry && (
          <motion.div key={selected}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`font-semibold text-sm ${dm ? 'text-white' : 'text-slate-900'}`}>{entry.name}</span>
              <SeverityBadge s={entry.risk} />
            </div>
            <p className={`text-xs mb-3 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{entry.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-red-400 mb-1 uppercase tracking-wider">Capabilities</div>
                <ul className="space-y-1">
                  {entry.capabilities.map((c, i) => (
                    <li key={i} className={`text-xs flex items-start gap-1.5 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-red-400 mt-0.5 shrink-0">•</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">Required Mitigations</div>
                <ul className="space-y-1">
                  {entry.mitigations.map((m, i) => (
                    <li key={i} className={`text-xs flex items-start gap-1.5 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SOC Dashboard ────────────────────────────────────────────────────────────

const SOC_EVENTS = [
  { time: '14:32:07', type: 'injection', msg: 'Injection pattern detected in retrieved document chunk', severity: 'critical' as SecuritySeverity },
  { time: '14:31:44', type: 'tool', msg: 'Anomalous tool call sequence: filesystem → http → filesystem (3x)', severity: 'high' as SecuritySeverity },
  { time: '14:29:12', type: 'agent', msg: 'Agent requested capability expansion outside task scope', severity: 'high' as SecuritySeverity },
  { time: '14:27:55', type: 'retrieval', msg: 'Chunk retrieved for 47 distinct query types (baseline: <5)', severity: 'high' as SecuritySeverity },
  { time: '14:26:03', type: 'auth', msg: 'Possible system prompt extraction attempt detected', severity: 'high' as SecuritySeverity },
  { time: '14:24:31', type: 'tool', msg: 'Shell MCP invocation with user-interpolated parameter', severity: 'critical' as SecuritySeverity },
  { time: '14:22:18', type: 'memory', msg: 'Memory write attempt with instruction-shaped content', severity: 'high' as SecuritySeverity },
  { time: '14:19:44', type: 'normal', msg: 'Policy classifier confidence below threshold — flagged for review', severity: 'medium' as SecuritySeverity },
];

function SOCDashboard({ dm }: { dm: boolean }) {
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, [paused]);

  const injections = 3 + (tick % 4);
  const toolAnomalies = 1 + (tick % 3);
  const agentEscalations = tick % 5 === 0 ? 1 : 0;
  const activeAgents = 4 + (tick % 2);

  const metrics = [
    { label: 'Injection Attempts', value: injections, color: 'text-red-400', icon: <AlertTriangle size={14} /> },
    { label: 'Tool Anomalies', value: toolAnomalies, color: 'text-amber-400', icon: <Zap size={14} /> },
    { label: 'Escalation Signals', value: agentEscalations, color: agentEscalations > 0 ? 'text-red-400' : 'text-emerald-400', icon: <Activity size={14} /> },
    { label: 'Active Agents', value: activeAgents, color: 'text-sky-400', icon: <Eye size={14} /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>AI Security Operations Center — Live Feed</span>
        <button onClick={() => setPaused(p => !p)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${paused ? 'border-emerald-500 text-emerald-400' : 'border-amber-500 text-amber-400'}`}>
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {metrics.map((m, i) => (
          <div key={i} className={`p-3 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center gap-1.5 text-xs mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={m.color}>{m.icon}</span>{m.label}
            </div>
            <div className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Event feed */}
      <div className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className={`px-4 py-2 border-b text-xs font-bold uppercase tracking-wider ${dm ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          Recent Security Events
        </div>
        <div className={`divide-y ${dm ? 'divide-slate-800' : 'divide-slate-100'}`}>
          {SOC_EVENTS.slice(0, 6).map((ev, i) => {
            const c = severityColor(ev.severity);
            return (
              <div key={i} className={`flex items-start gap-3 px-4 py-2.5 ${dm ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                <span className={`text-xs font-mono mt-0.5 shrink-0 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{ev.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${c.bg}`} />
                <span className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{ev.msg}</span>
                <SeverityBadge s={ev.severity} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Threat Intelligence Feed ─────────────────────────────────────────────────

function ThreatFeed({ dm }: { dm: boolean }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {threatEntries.map((t, i) => {
        const open = expanded === i;
        const c = severityColor(t.severity);
        return (
          <div key={i} className={`rounded-xl border overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
            <button onClick={() => setExpanded(open ? null : i)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${dm ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${c.bg}`} />
                <div>
                  <div className={`text-sm font-medium ${dm ? 'text-white' : 'text-slate-900'}`}>{t.name}</div>
                  <div className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{t.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <SeverityBadge s={t.severity} />
                <ChevronDown size={14} className={`transition-transform ${dm ? 'text-slate-400' : 'text-slate-400'} ${open ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  className="overflow-hidden">
                  <div className={`px-4 pb-4 pt-1 border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                    <p className={`text-sm mb-3 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{t.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-bold text-red-400 mb-1 uppercase tracking-wider">Indicators</div>
                        <ul className="space-y-1">
                          {t.indicators.map((ind, j) => (
                            <li key={j} className={`text-xs flex items-start gap-1.5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                              <span className="text-red-400 shrink-0 mt-0.5">▸</span>{ind}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider">Mitigations</div>
                        <ul className="space-y-1">
                          {t.mitigations.map((m, j) => (
                            <li key={j} className={`text-xs flex items-start gap-1.5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                              <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>{m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Red vs Blue Arena ────────────────────────────────────────────────────────

function RedBlueArena({ dm }: { dm: boolean }) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = redBlueScenarios[scenarioIdx];

  const reset = () => setSelected(null);
  const next = () => { setSelected(null); setScenarioIdx(i => (i + 1) % redBlueScenarios.length); };

  const choice = scenario.defenseOptions.find(o => o.id === selected);

  return (
    <div>
      {/* Scenario selector */}
      <div className="flex gap-2 mb-4">
        {redBlueScenarios.map((_, i) => (
          <button key={i} onClick={() => { setScenarioIdx(i); setSelected(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${scenarioIdx === i ? 'bg-red-500 text-white' : dm ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Attack brief */}
      <div className={`p-4 rounded-xl border mb-4 ${dm ? 'bg-red-950/30 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={14} className="text-red-400" />
          <span className="text-sm font-bold text-red-400">Red Team — {scenario.name}</span>
        </div>
        <div className={`text-xs font-mono mb-1 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{scenario.attackVector}</div>
        <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{scenario.attackDetail}</div>
      </div>

      {/* Defense options */}
      <div className="mb-4">
        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Blue Team — Choose your defense:</div>
        <div className="space-y-2">
          {scenario.defenseOptions.map(opt => {
            const isSelected = selected === opt.id;
            const revealed = selected !== null;
            return (
              <button key={opt.id} onClick={() => !selected && setSelected(opt.id)} disabled={!!selected}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  !revealed ? (dm ? 'bg-slate-800 border-slate-700 hover:border-sky-500 text-slate-200' : 'bg-white border-slate-200 hover:border-sky-400 text-slate-800') :
                  isSelected && opt.effective ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' :
                  isSelected && !opt.effective ? 'bg-red-500/20 border-red-500 text-red-300' :
                  opt.effective ? (dm ? 'bg-emerald-950/30 border-emerald-800/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700') :
                  dm ? 'bg-slate-800/50 border-slate-700/50 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                <div className="flex items-start gap-2">
                  {revealed && <span className="shrink-0 mt-0.5">{opt.effective ? '✓' : '✗'}</span>}
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    {revealed && <div className="text-xs mt-1 opacity-80">{opt.detail}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome */}
      <AnimatePresence>
        {choice && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border mb-3 ${choice.effective ? (dm ? 'bg-emerald-950/30 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200') : (dm ? 'bg-red-950/30 border-red-700/40' : 'bg-red-50 border-red-200')}`}>
            <div className={`text-sm font-bold mb-1 ${choice.effective ? 'text-emerald-400' : 'text-red-400'}`}>
              {choice.effective ? '✓ Effective Defense' : '✗ Insufficient Defense'}
            </div>
            <div className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{choice.detail}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {selected && (
        <div className="flex gap-2">
          <button onClick={reset} className={`px-4 py-2 rounded-lg text-sm font-medium ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Try Again</button>
          <button onClick={next} className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-500 text-white">Next Scenario →</button>
        </div>
      )}
    </div>
  );
}

// ─── Incident Timeline ────────────────────────────────────────────────────────

function IncidentTimelineView({ dm }: { dm: boolean }) {
  const typeColor = (t: IncidentStep['type']) => {
    if (t === 'attack')    return { dot: 'bg-red-500', line: 'border-red-800', label: 'text-red-400', bg: dm ? 'bg-red-950/30 border-red-800/30' : 'bg-red-50 border-red-200' };
    if (t === 'detection') return { dot: 'bg-amber-500', line: 'border-amber-800', label: 'text-amber-400', bg: dm ? 'bg-amber-950/30 border-amber-800/30' : 'bg-amber-50 border-amber-200' };
    if (t === 'response')  return { dot: 'bg-sky-500', line: 'border-sky-800', label: 'text-sky-400', bg: dm ? 'bg-sky-950/30 border-sky-800/30' : 'bg-sky-50 border-sky-200' };
    return { dot: 'bg-emerald-500', line: 'border-emerald-800', label: 'text-emerald-400', bg: dm ? 'bg-emerald-950/30 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200' };
  };

  const legend = [
    { type: 'attack', label: 'Attack' },
    { type: 'detection', label: 'Detection' },
    { type: 'response', label: 'Response' },
    { type: 'recovery', label: 'Recovery' },
  ] as const;

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap">
        {legend.map(l => {
          const c = typeColor(l.type);
          return (
            <div key={l.type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{l.label}</span>
            </div>
          );
        })}
      </div>
      <div className="relative">
        <div className={`absolute left-[52px] top-0 bottom-0 w-px ${dm ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <div className="space-y-3">
          {incidentTimeline.map((step, i) => {
            const c = typeColor(step.type);
            return (
              <div key={i} className="flex gap-4 items-start">
                <div className={`text-xs font-mono shrink-0 w-12 text-right mt-2 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{step.time}</div>
                <div className="relative z-10 mt-2">
                  <div className={`w-3 h-3 rounded-full border-2 ${c.dot} border-white`} />
                </div>
                <div className={`flex-1 p-3 rounded-xl border text-sm ${c.bg}`}>
                  <div className={`font-semibold mb-0.5 ${c.label}`}>{step.event}</div>
                  <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-600'}`}>{step.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Chaos Scenarios ──────────────────────────────────────────────────────────

function ChaosSim({ dm }: { dm: boolean }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <p className={`text-sm mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
        Select a chaos scenario to analyze its failure cascade and required mitigations.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {chaosScenarios.map((s, i) => (
          <button key={i} onClick={() => setActive(active === i ? null : i)}
            className={`p-4 rounded-xl border text-left transition-all ${
              active === i
                ? dm ? 'bg-amber-500/20 border-amber-500/50' : 'bg-amber-50 border-amber-300'
                : dm ? 'bg-slate-800 border-slate-700 hover:border-amber-600' : 'bg-white border-slate-200 hover:border-amber-400'
            }`}>
            <div className={`font-semibold text-sm mb-1 ${active === i ? 'text-amber-400' : dm ? 'text-white' : 'text-slate-900'}`}>
              {s.name}
            </div>
            <div className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Trigger: {s.trigger.slice(0, 60)}…
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-5 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="text-sm font-bold text-amber-400 mb-1">{chaosScenarios[active].name}</div>
            <div className={`text-xs mb-4 ${dm ? 'text-slate-400' : 'text-slate-600'}`}><strong>Trigger:</strong> {chaosScenarios[active].trigger}</div>

            <div className="mb-4">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Failure Cascade</div>
              <div className="space-y-1">
                {chaosScenarios[active].cascade.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-xs font-mono shrink-0 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}.</span>
                    <span className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-lg mb-3 ${dm ? 'bg-red-950/30 border border-red-800/30' : 'bg-red-50 border border-red-200'}`}>
              <div className="text-xs font-bold text-red-400 mb-1">Impact</div>
              <div className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{chaosScenarios[active].impact}</div>
            </div>

            <div className={`p-3 rounded-lg ${dm ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <div className="text-xs font-bold text-emerald-400 mb-1">Required Mitigation</div>
              <div className={`text-xs ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{chaosScenarios[active].mitigation}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Detail ───────────────────────────────────────────────────────────

type DetailTab = 'overview' | 'attack' | 'defense' | 'special';

const SPECIAL_LABELS: Partial<Record<SecuritySectionId, string>> = {
  'mcp-attack': 'Permission Heatmap',
  'observability': 'SOC Dashboard',
  'threat-intel': 'Threat Feed',
  'red-blue-team': 'Red vs Blue Arena',
  'incident-response': 'Incident Timeline',
  'chaos-simulations': 'Chaos Simulator',
};

function SectionDetail({ id, dm }: { id: SecuritySectionId; dm: boolean }) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const section = securitySections.find(s => s.id === id)!;
  const specialLabel = SPECIAL_LABELS[id];

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    ...(section.attackFlows.length > 0 ? [{ id: 'attack' as DetailTab, label: 'Attack Sim' }] : []),
    { id: 'defense', label: 'Defense' },
    ...(specialLabel ? [{ id: 'special' as DetailTab, label: specialLabel }] : []),
  ];

  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{section.emoji}</span>
          <div>
            <h2 className={`text-xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{section.title}</h2>
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{section.tagline}</p>
          </div>
          <div className="ml-auto">
            <SeverityBadge s={section.severity} label={`${section.severity} risk`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 p-1 rounded-xl mb-6 w-fit ${dm ? 'bg-slate-800' : 'bg-slate-100'}`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? dm ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm'
                : dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {tab === 'overview' && (
            <div>
              <p className={`text-sm leading-relaxed mb-6 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{section.overview}</p>
              <div className="mb-2">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Key Risk Vectors</div>
                <div className="space-y-2">
                  {section.keyRisks.map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${dm ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                      <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                      <span className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'attack' && section.attackFlows.length > 0 && (
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                Interactive Attack Chain Simulation — Educational / Defensive Use
              </div>
              <AttackFlowViz flows={section.attackFlows} dm={dm} />
            </div>
          )}

          {tab === 'defense' && (
            <div>
              <div className="mb-6">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Defense Strategies</div>
                <div className="space-y-2">
                  {section.defenseStrategies.map((d, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${dm ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-100'}`}>
                      <Shield size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              {section.goodBad.length > 0 && (
                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Architecture Comparisons</div>
                  <GoodBadGrid items={section.goodBad} dm={dm} />
                </div>
              )}
            </div>
          )}

          {tab === 'special' && id === 'mcp-attack' && <McpHeatmap dm={dm} />}
          {tab === 'special' && id === 'observability' && <SOCDashboard dm={dm} />}
          {tab === 'special' && id === 'threat-intel' && <ThreatFeed dm={dm} />}
          {tab === 'special' && id === 'red-blue-team' && <RedBlueArena dm={dm} />}
          {tab === 'special' && id === 'incident-response' && <IncidentTimelineView dm={dm} />}
          {tab === 'special' && id === 'chaos-simulations' && <ChaosSim dm={dm} />}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ['Attack Surface', 'Governance', 'Operations', 'Intelligence'];

export function AISecurityPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;

  const [selected, setSelected] = useState<SecuritySectionId>('prompt-injection');
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(CATEGORY_ORDER));

  const toggleCat = (cat: string) =>
    setOpenCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });

  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    sections: securitySections.filter(s => s.category === cat),
  }));

  const catIcons: Record<string, React.ReactNode> = {
    'Attack Surface': <AlertTriangle size={12} />,
    'Governance':     <Lock size={12} />,
    'Operations':     <Activity size={12} />,
    'Intelligence':   <Eye size={12} />,
  };

  return (
    <div className={`flex h-full ${dm ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* Left section list */}
      <div className={`w-64 shrink-0 border-r flex flex-col ${dm ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} overflow-y-auto`}>
        {/* Header */}
        <div className={`p-4 border-b ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>AI Security Lab</span>
          </div>
          <div className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>20 attack surfaces · interactive simulations</div>
        </div>

        {/* Grouped nav */}
        <div className="flex-1 p-2 space-y-1">
          {grouped.map(({ cat, sections }) => {
            const open = openCats.has(cat);
            return (
              <div key={cat}>
                <button onClick={() => toggleCat(cat)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${dm ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                  <span className="flex items-center gap-1.5">{catIcons[cat]}{cat}</span>
                  <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15 }}>
                    <ChevronDown size={12} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden">
                      <div className="py-0.5 space-y-px">
                        {sections.map(s => {
                          const isActive = selected === s.id;
                          const c = severityColor(s.severity);
                          return (
                            <button key={s.id} onClick={() => setSelected(s.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                                isActive
                                  ? dm ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                                  : dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.bg}`} />
                              <span className="text-base leading-none">{s.emoji}</span>
                              <span className="text-xs leading-snug">{s.title}</span>
                              {isActive && <ChevronRight size={12} className="ml-auto shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer legend */}
        <div className={`p-3 border-t ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? 'text-slate-600' : 'text-slate-300'}`}>Risk Legend</div>
          {(['critical', 'high', 'medium'] as SecuritySeverity[]).map(s => (
            <div key={s} className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${severityColor(s).bg}`} />
              <span className={`text-xs capitalize ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Page hero */}
          <div className={`p-5 rounded-2xl border mb-6 bg-gradient-to-r ${dm ? 'from-red-950/40 to-slate-900 border-red-900/40' : 'from-red-50 to-slate-50 border-red-200/60'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={20} className="text-red-400" />
              <h1 className={`text-lg font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>AI Security War Room</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-bold bg-red-500/15 text-red-400 border-red-500/30`}>OPERATIONAL</span>
            </div>
            <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
              20 attack surfaces · interactive simulations · real-world defenses · enterprise security patterns.
              AI security is an infrastructure, orchestration, memory, and operational systems problem — not just jailbreak prompts.
            </p>
          </div>

          <SectionDetail id={selected} dm={dm} key={selected} />
        </div>
      </div>

    </div>
  );
}
