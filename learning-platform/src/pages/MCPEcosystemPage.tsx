import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { tw } from '@/lib/dm';
import {
  ecoServers, ecoWorkflows, evalCriteria,
  ECO_CATEGORY_META, ECO_TIER_META,
} from '@/data/ecosystemDiscoveryData';
import type { EcoServer, EcoCategory, EcoTier } from '@/data/ecosystemDiscoveryData';
import {
  aiSkills, featuredRepos, enterpriseStacks, hypeAnalyses,
  SKILL_CATEGORY_META, HYPE_VERDICT_META,
} from '@/data/aiEcosystemData';
import type { AISkill, SkillCategory, FeaturedRepo, EnterpriseStack, HypeAnalysis } from '@/data/aiEcosystemData';

type EcoSection =
  | 'discover' | 'skills' | 'repos' | 'workflows'
  | 'stacks' | 'security' | 'hype';

// ── Sidebar navigation ────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: EcoSection; emoji: string; label: string; desc: string; isNew?: boolean }> = [
  { id: 'discover',   emoji: '🌐', label: 'MCP Marketplace',     desc: 'Discover & filter real MCP servers' },
  { id: 'skills',     emoji: '💡', label: 'Skills Marketplace',   desc: 'Reusable AI engineering capabilities', isNew: true },
  { id: 'repos',      emoji: '🔭', label: 'Repo Spotlights',      desc: 'Career-Ops, DESIGN.md, Firecrawl, video-use', isNew: true },
  { id: 'workflows',  emoji: '⚡', label: 'AI Workflows',          desc: 'End-to-end multi-tool simulations' },
  { id: 'stacks',     emoji: '🏗️', label: 'Enterprise Stacks',    desc: 'Reference architectures for real teams', isNew: true },
  { id: 'security',   emoji: '🛡️', label: 'Security & Eval',      desc: 'Risk analysis & server evaluation' },
  { id: 'hype',       emoji: '📊', label: 'Signal vs Hype',        desc: 'What\'s genuinely useful vs overhyped', isNew: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

const TREND_LABELS: Record<string, { label: string; color: string }> = {
  hot:      { label: '🔥 Hot',    color: '#ef4444' },
  rising:   { label: '📈 Rising', color: '#f59e0b' },
  stable:   { label: '─ Stable',  color: '#64748b' },
  declining:{ label: '↓',         color: '#94a3b8' },
};

// ── ── ── DISCOVER SECTION ── ── ──

function ServerDetail({ server, dm, onClose }: { server: EcoServer; dm: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'workflow' | 'security' | 'setup'>('overview');
  const catMeta = ECO_CATEGORY_META[server.category];
  const tierMeta = ECO_TIER_META[server.tier];
  const READINESS_COLORS: Record<string, string> = {
    experimental: '#94a3b8', stable: '#0ea5e9', 'production-grade': '#10b981', enterprise: '#8b5cf6',
  };

  const tabs = [
    { id: 'overview' as const,  label: '📖 Overview' },
    { id: 'workflow' as const,  label: '⚡ Workflow' },
    { id: 'security' as const,  label: '🛡️ Security' },
    { id: 'setup' as const,     label: '⚙️ Setup' },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
      <div className="p-5" style={{ background: server.color + '18' }}>
        <div className="flex items-start gap-3">
          <span className="text-4xl shrink-0">{server.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-xl font-bold ${tw(dm, 'heading')}`}>{server.name}</div>
            <div className={`text-sm ${tw(dm, 'muted')}`}>{server.tagline}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: tierMeta.color + '20', color: tierMeta.color }}>{tierMeta.label}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: catMeta.color + '20', color: catMeta.color }}>{catMeta.emoji} {catMeta.label}</span>
              <span className="text-xs font-mono ml-auto" style={{ color: READINESS_COLORS[server.readiness] }}>★ {fmtStars(server.stars)}</span>
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors text-sm ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>✕</button>
        </div>
        <div className={`mt-3 p-3 rounded-xl text-sm italic ${dm ? 'bg-slate-800/60' : 'bg-white/60'}`} style={{ borderLeft: `3px solid ${server.color}` }}>
          {server.analogy}
        </div>
      </div>
      <div className={`flex border-b ${tw(dm, 'border')}`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium transition-all border-b-2 ${tab === t.id ? 'font-bold' : dm ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            style={tab === t.id ? { color: server.color, borderColor: server.color } : {}}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-5 overflow-y-auto" style={{ maxHeight: 440 }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {tab === 'overview' && (
              <div className="space-y-4">
                <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: server.color }}>What It Is</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{server.whatItIs}</p></div>
                <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8b5cf6' }}>Why It Exists</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{server.whyItExists}</p></div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>Real Problems Solved</div>
                  {server.realProblems.map((p, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#10b981' }} className="shrink-0 mt-0.5">→</span><span className={tw(dm, 'body')}>{p}</span></div>)}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#0ea5e9' }}>Enterprise Use Cases</div>
                  {server.enterpriseUseCases.map((uc, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>{i + 1}</span><span className={tw(dm, 'body')}>{uc}</span></div>)}
                </div>
                <div className={`text-sm px-3 py-2.5 rounded-xl ${dm ? 'bg-amber-950/30' : 'bg-amber-50'}`} style={{ borderLeft: '3px solid #f59e0b' }}>
                  <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Architecture Role: </span>
                  <span className={tw(dm, 'body')}>{server.architectureRole}</span>
                </div>
              </div>
            )}
            {tab === 'workflow' && (
              <div className="relative">
                <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${dm ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className="space-y-3">
                  {server.claudeSteps.map((step, i) => {
                    const c = step.actor === 'Claude' ? '#d97706' : step.actor === 'MCP' ? server.color : step.actor === 'User' ? '#0ea5e9' : '#64748b';
                    return (
                      <div key={i} className="flex gap-3 relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 z-10" style={{ background: c }}>{i + 1}</div>
                        <div className={`flex-1 p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <div className="text-xs font-bold mb-0.5" style={{ color: c }}>{step.actor}</div>
                          <div className={`text-sm ${tw(dm, 'body')}`}>{step.action}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab === 'security' && (
              <div className="space-y-4">
                {server.securityRisks.map((r, i) => {
                  const c = r.severity === 'critical' ? '#ef4444' : r.severity === 'high' ? '#f97316' : '#eab308';
                  return (
                    <div key={i} className={`p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`} style={{ borderLeft: `3px solid ${c}` }}>
                      <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: c + '20', color: c }}>{r.severity}</span><span className={`text-sm font-semibold ${tw(dm, 'heading')}`}>{r.title}</span></div>
                      <p className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{r.detail}</p>
                    </div>
                  );
                })}
                <div className="text-xs font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: '#f59e0b' }}>Common Mistakes</div>
                {server.commonMistakes.map((m, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#f59e0b' }}>⚠</span><span className={tw(dm, 'body')}>{m}</span></div>)}
              </div>
            )}
            {tab === 'setup' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Setup',      value: server.setup,      color: server.setup === 'easy' ? '#10b981' : server.setup === 'moderate' ? '#f59e0b' : '#ef4444' },
                    { label: 'Complexity', value: server.complexity, color: server.complexity === 'beginner' ? '#10b981' : server.complexity === 'intermediate' ? '#0ea5e9' : '#f59e0b' },
                    { label: 'Readiness',  value: server.readiness,  color: READINESS_COLORS[server.readiness] },
                  ].map(item => (
                    <div key={item.label} className={`p-3 rounded-xl text-center ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <div className={`text-xs ${tw(dm, 'muted')} mb-1`}>{item.label}</div>
                      <div className="text-sm font-bold capitalize" style={{ color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: server.isOfficial ? '#10b981' : '#f59e0b' }}>Source</div>
                  <div className={`flex items-center gap-2 text-sm p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <span>{server.isOfficial ? '✅' : '🌐'}</span>
                    <span className={tw(dm, 'body')}>{server.isOfficial ? 'Official Anthropic modelcontextprotocol/servers collection' : 'Community-maintained — review source before production use'}</span>
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

function DiscoverSection({ dm }: { dm: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<EcoCategory | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<EcoTier | 'all'>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'trend' | 'name'>('stars');
  const TREND_ORDER: Record<string, number> = { hot: 0, rising: 1, stable: 2, declining: 3 };

  const filtered = useMemo(() => {
    let list = ecoServers.filter(s => {
      if (catFilter !== 'all' && s.category !== catFilter) return false;
      if (tierFilter !== 'all' && s.tier !== tierFilter) return false;
      if (search) { const q = search.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.tagline.toLowerCase().includes(q)) return false; }
      return true;
    });
    if (sortBy === 'stars') list = [...list].sort((a, b) => b.stars - a.stars);
    else if (sortBy === 'trend') list = [...list].sort((a, b) => (TREND_ORDER[a.trend] ?? 9) - (TREND_ORDER[b.trend] ?? 9));
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [catFilter, tierFilter, search, sortBy]);

  const selectedServer = selectedId ? ecoServers.find(s => s.id === selectedId) : null;
  const cats = Object.entries(ECO_CATEGORY_META) as Array<[EcoCategory, typeof ECO_CATEGORY_META[EcoCategory]]>;

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total Servers', value: ecoServers.length, color: '#8b5cf6' },
            { label: 'Official (Anthropic)', value: ecoServers.filter(s => s.isOfficial).length, color: '#10b981' },
            { label: 'Production-Grade', value: ecoServers.filter(s => s.readiness === 'production-grade' || s.readiness === 'enterprise').length, color: '#0ea5e9' },
            { label: '🔥 Trending', value: ecoServers.filter(s => s.trend === 'hot' || s.trend === 'rising').length, color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl p-3 text-center border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
              <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className={`text-xs mt-0.5 ${tw(dm, 'muted')}`}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search servers, use cases, analogies…" className={`flex-1 px-3 py-2 rounded-xl text-sm border ${tw(dm, 'input')}`} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={`px-3 py-2 rounded-xl text-sm border ${tw(dm, 'input')}`}>
            <option value="stars">Most Starred</option>
            <option value="trend">Trending First</option>
            <option value="name">A–Z</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button onClick={() => setCatFilter('all')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${catFilter === 'all' ? 'bg-violet-600 text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}>All</button>
          {cats.map(([id, meta]) => (
            <button key={id} onClick={() => setCatFilter(catFilter === id ? 'all' : id)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${catFilter === id ? 'text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} style={catFilter === id ? { background: meta.color } : {}}>{meta.emoji} {meta.label}</button>
          ))}
        </div>
        <div className="flex gap-1.5 mb-4">
          {(['all', 'reference', 'production', 'stable', 'emerging'] as const).map(t => {
            const meta = t === 'all' ? null : ECO_TIER_META[t];
            return <button key={t} onClick={() => setTierFilter(t)} className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${tierFilter === t ? 'text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} style={tierFilter === t ? { background: meta?.color ?? '#6366f1' } : {}}>{meta?.label ?? 'All Tiers'}</button>;
          })}
        </div>
        <div className={`text-xs mb-3 ${tw(dm, 'muted')}`}>{filtered.length} servers · curated from GitHub, MCP registry, and ecosystem reports · May 2025</div>
        <div className={`grid gap-3 ${selectedServer ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3'}`}>
          {filtered.map(server => {
            const isSelected = selectedId === server.id;
            const trendMeta = TREND_LABELS[server.trend];
            const tierMeta = ECO_TIER_META[server.tier];
            return (
              <button key={server.id} onClick={() => setSelectedId(isSelected ? null : server.id)}
                className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${isSelected ? 'border-transparent text-white' : tw(dm, 'card') + ' ' + (dm ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')}`}
                style={isSelected ? { background: server.color } : {}}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl shrink-0">{server.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${isSelected ? 'text-white' : tw(dm, 'heading')}`}>{server.name}</div>
                    <div className={`text-xs truncate ${isSelected ? 'text-white/70' : tw(dm, 'muted')}`}>{server.tagline}</div>
                  </div>
                </div>
                <div className={`text-xs italic mb-2 line-clamp-2 ${isSelected ? 'text-white/80' : tw(dm, 'body')}`}>"{server.analogy}"</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={isSelected ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: tierMeta.color + '20', color: tierMeta.color }}>{tierMeta.label}</span>
                  <span className="text-xs" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : trendMeta.color }}>{trendMeta.label}</span>
                  <span className={`text-xs ml-auto font-mono ${isSelected ? 'text-white/70' : tw(dm, 'muted')}`}>★ {fmtStars(server.stars)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {selectedServer && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }} className="w-[420px] shrink-0">
            <ServerDetail server={selectedServer} dm={dm} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ── ── SKILLS SECTION ── ── ──

function SkillDetail({ skill, dm, onClose }: { skill: AISkill; dm: boolean; onClose: () => void }) {
  const catMeta = SKILL_CATEGORY_META[skill.category];
  return (
    <div className={`rounded-2xl border overflow-hidden ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
      <div className="p-5" style={{ background: skill.color + '18' }}>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{skill.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-xl font-bold ${tw(dm, 'heading')}`}>{skill.name}</div>
            <div className={`text-sm ${tw(dm, 'muted')}`}>{skill.tagline}</div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: catMeta.color + '20', color: catMeta.color }}>{catMeta.emoji} {catMeta.label}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold" style={{ background: skill.color + '20', color: skill.color }}>{skill.complexity}</span>
              {skill.isNew && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#10b981', color: '#fff' }}>NEW</span>}
            </div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg text-sm transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>✕</button>
        </div>
        <div className={`mt-3 p-3 rounded-xl text-sm italic ${dm ? 'bg-slate-800/60' : 'bg-white/60'}`} style={{ borderLeft: `3px solid ${skill.color}` }}>
          {skill.analogy}
        </div>
      </div>
      <div className="p-5 overflow-y-auto space-y-5" style={{ maxHeight: 480 }}>
        <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: skill.color }}>What It Is</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{skill.whatItIs}</p></div>
        <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8b5cf6' }}>Why It Matters</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{skill.whyItMatters}</p></div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>Use Cases</div>
          {skill.useCases.map((u, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#10b981' }} className="shrink-0 mt-0.5">→</span><span className={tw(dm, 'body')}>{u}</span></div>)}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#0ea5e9' }}>SKILL.md — Install This Expertise</div>
          <pre className="rounded-xl p-4 text-xs font-mono overflow-x-auto bg-slate-950 text-emerald-300 leading-relaxed whitespace-pre-wrap">{skill.skillMd}</pre>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>Tags</div>
          <div className="flex flex-wrap gap-2">
            {skill.tags.map(t => <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${dm ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>#{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillsSection({ dm }: { dm: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<SkillCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const COMPLEXITY_COLORS: Record<string, string> = { beginner: '#10b981', intermediate: '#0ea5e9', advanced: '#8b5cf6' };

  const filtered = useMemo(() => {
    return aiSkills.filter(s => {
      if (catFilter !== 'all' && s.category !== catFilter) return false;
      if (search) { const q = search.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.tagline.toLowerCase().includes(q)) return false; }
      return true;
    });
  }, [catFilter, search]);

  const selectedSkill = selectedId ? aiSkills.find(s => s.id === selectedId) : null;
  const cats = Object.entries(SKILL_CATEGORY_META) as Array<[SkillCategory, typeof SKILL_CATEGORY_META[SkillCategory]]>;

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl p-4 mb-5 border ${dm ? 'border-violet-800/40 bg-violet-950/20' : 'border-violet-200 bg-violet-50'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💡</span>
            <div className="font-bold" style={{ color: '#8b5cf6' }}>AI Skills Marketplace</div>
          </div>
          <p className={`text-sm ${tw(dm, 'body')}`}>Skills are reusable SKILL.md files that install specialized expertise into Claude. Each skill defines a behavioral pattern Claude applies consistently — like installing a module of engineering knowledge.</p>
        </div>
        <div className="flex gap-2 mb-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, use cases…" className={`flex-1 px-3 py-2 rounded-xl text-sm border ${tw(dm, 'input')}`} />
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button onClick={() => setCatFilter('all')} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${catFilter === 'all' ? 'bg-violet-600 text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}>All Skills</button>
          {cats.map(([id, meta]) => (
            <button key={id} onClick={() => setCatFilter(catFilter === id ? 'all' : id)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${catFilter === id ? 'text-white' : dm ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`} style={catFilter === id ? { background: meta.color } : {}}>{meta.emoji} {meta.label}</button>
          ))}
        </div>
        <div className={`text-xs mb-3 ${tw(dm, 'muted')}`}>{filtered.length} skills · click any skill to view SKILL.md installation content</div>
        <div className={`grid gap-3 ${selectedSkill ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-3'}`}>
          {filtered.map(skill => {
            const catMeta = SKILL_CATEGORY_META[skill.category];
            const isSelected = selectedId === skill.id;
            return (
              <button key={skill.id} onClick={() => setSelectedId(isSelected ? null : skill.id)}
                className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] ${isSelected ? 'border-transparent text-white' : tw(dm, 'card') + ' ' + (dm ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')}`}
                style={isSelected ? { background: skill.color } : {}}>
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl shrink-0">{skill.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`font-bold text-sm ${isSelected ? 'text-white' : tw(dm, 'heading')}`}>{skill.name}</div>
                      {skill.isNew && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#10b981', color: '#fff', fontSize: 9 }}>NEW</span>}
                    </div>
                    <div className={`text-xs truncate ${isSelected ? 'text-white/70' : tw(dm, 'muted')}`}>{skill.tagline}</div>
                  </div>
                </div>
                <div className={`text-xs italic mb-2 line-clamp-2 ${isSelected ? 'text-white/80' : tw(dm, 'body')}`}>"{skill.analogy}"</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={isSelected ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: catMeta.color + '20', color: catMeta.color }}>{catMeta.emoji} {catMeta.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-auto" style={isSelected ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: COMPLEXITY_COLORS[skill.complexity] + '20', color: COMPLEXITY_COLORS[skill.complexity] }}>{skill.complexity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {selectedSkill && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }} className="w-[420px] shrink-0">
            <SkillDetail skill={selectedSkill} dm={dm} onClose={() => setSelectedId(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ── ── REPO SPOTLIGHTS SECTION ── ── ──

function RepoSpotlight({ repo, dm, onClose }: { repo: FeaturedRepo; dm: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'what' | 'workflow' | 'eval'>('what');
  const tabs = [{ id: 'what' as const, label: '📖 Deep Dive' }, { id: 'workflow' as const, label: '⚡ Workflow' }, { id: 'eval' as const, label: '📊 Evaluation' }];
  return (
    <div className={`rounded-2xl border overflow-hidden ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
      <div className="p-5" style={{ background: repo.color + '18' }}>
        <div className="flex items-start gap-3">
          <span className="text-4xl">{repo.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className={`text-xl font-bold ${tw(dm, 'heading')}`}>{repo.name}</div>
            <div className={`text-xs font-mono ${tw(dm, 'muted')}`}>{repo.owner}/{repo.repo} · ★ {fmtStars(repo.stars)}</div>
            <div className={`text-sm mt-1 ${tw(dm, 'muted')}`}>{repo.tagline}</div>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg text-sm transition-colors ${dm ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>✕</button>
        </div>
        <div className={`mt-3 p-3 rounded-xl text-sm italic ${dm ? 'bg-slate-800/60' : 'bg-white/60'}`} style={{ borderLeft: `3px solid ${repo.color}` }}>
          {repo.analogy}
        </div>
      </div>
      <div className={`flex border-b ${tw(dm, 'border')}`}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 text-xs font-medium transition-all border-b-2 ${tab === t.id ? 'font-bold' : dm ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-400 hover:text-slate-700'}`} style={tab === t.id ? { color: repo.color, borderColor: repo.color } : {}}>{t.label}</button>
        ))}
      </div>
      <div className="p-5 overflow-y-auto space-y-5" style={{ maxHeight: 480 }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {tab === 'what' && (
              <div className="space-y-4">
                <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: repo.color }}>What It Is</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{repo.whatItIs}</p></div>
                <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8b5cf6' }}>Why It Exists</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{repo.whyItExists}</p></div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>Key Capabilities</div>
                  {repo.keyCapabilities.map((c, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#10b981' }} className="shrink-0 mt-0.5">→</span><span className={tw(dm, 'body')}>{c}</span></div>)}
                </div>
                <div className={`p-3 rounded-xl text-sm ${dm ? 'bg-amber-950/30' : 'bg-amber-50'}`} style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>Why Developers Care</div>
                  <p className={tw(dm, 'body')}>{repo.whyDevelopersCare}</p>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#0ea5e9' }}>Enterprise Use Cases</div>
                  {repo.enterpriseUseCases.map((u, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0" style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }}>{i + 1}</span><span className={tw(dm, 'body')}>{u}</span></div>)}
                </div>
              </div>
            )}
            {tab === 'workflow' && (
              <div className="relative">
                <div className={`absolute left-4 top-4 bottom-4 w-0.5 ${dm ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div className="space-y-3">
                  {repo.claudeWorkflow.map((step, i) => {
                    const c = step.actor === 'Claude' ? '#d97706' : step.actor === 'User' ? '#0ea5e9' : repo.color;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 z-10" style={{ background: c }}>{i + 1}</div>
                        <div className={`flex-1 p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <div className="text-xs font-bold mb-0.5" style={{ color: c }}>{step.actor}</div>
                          <div className={`text-sm font-semibold ${tw(dm, 'heading')}`}>{step.step}</div>
                          <div className={`text-xs mt-0.5 ${tw(dm, 'muted')}`}>{step.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {tab === 'eval' && (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>✅ Good Signals</div>
                  {repo.goodSignals.map((g, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#10b981' }}>✓</span><span className={tw(dm, 'body')}>{g}</span></div>)}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>⚠ Watch Out For</div>
                  {repo.watchOutFor.map((w, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#f59e0b' }}>⚠</span><span className={tw(dm, 'body')}>{w}</span></div>)}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ef4444' }}>🛡️ Security Notes</div>
                  {repo.securityNotes.map((s, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#ef4444' }}>⚡</span><span className={tw(dm, 'body')}>{s}</span></div>)}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReposSection({ dm }: { dm: boolean }) {
  const [selected, setSelected] = useState<FeaturedRepo | null>(null);
  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl p-4 mb-5 border ${dm ? 'border-sky-800/40 bg-sky-950/20' : 'border-sky-200 bg-sky-50'}`}>
          <div className="flex items-center gap-2 mb-1"><span className="text-lg">🔭</span><div className="font-bold" style={{ color: '#0ea5e9' }}>Repo Spotlights</div></div>
          <p className={`text-sm ${tw(dm, 'body')}`}>Deep analysis of real repositories shaping the AI engineering ecosystem — what they are, why they exist, and how to use them in production.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {featuredRepos.map(repo => (
            <button key={repo.id} onClick={() => setSelected(selected?.id === repo.id ? null : repo)}
              className={`text-left p-5 rounded-2xl border transition-all hover:scale-[1.01] ${selected?.id === repo.id ? 'border-transparent text-white' : tw(dm, 'card') + ' ' + (dm ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300')}`}
              style={selected?.id === repo.id ? { background: repo.color } : {}}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{repo.emoji}</span>
                <div>
                  <div className={`font-bold ${selected?.id === repo.id ? 'text-white' : tw(dm, 'heading')}`}>{repo.name}</div>
                  <div className={`text-xs font-mono ${selected?.id === repo.id ? 'text-white/60' : tw(dm, 'muted')}`}>{repo.owner}/{repo.repo} · ★ {fmtStars(repo.stars)}</div>
                </div>
              </div>
              <div className={`text-sm italic mb-3 ${selected?.id === repo.id ? 'text-white/80' : tw(dm, 'body')}`}>"{repo.analogy}"</div>
              <div className={`text-xs ${selected?.id === repo.id ? 'text-white/70' : tw(dm, 'muted')}`}>{repo.tagline}</div>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }} className="w-[440px] shrink-0">
            <RepoSpotlight repo={selected} dm={dm} onClose={() => setSelected(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ── ── WORKFLOWS SECTION ── ── ──

function WorkflowsSection({ dm }: { dm: boolean }) {
  const [activeWf, setActiveWf] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const wf = ecoWorkflows[activeWf];
  const ACTOR_COLORS: Record<string, string> = { claude: '#d97706', mcp: '#8b5cf6', user: '#0ea5e9', service: '#10b981' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {ecoWorkflows.map((w, i) => (
          <button key={w.id} onClick={() => { setActiveWf(i); setActiveStep(0); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeWf === i ? 'bg-violet-600 text-white border-violet-600' : dm ? 'border-slate-700 text-slate-300 hover:border-slate-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <span>{w.emoji}</span>{w.title}
          </button>
        ))}
      </div>
      <div className={`rounded-2xl border ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <div className="p-5 border-b" style={{ borderColor: dm ? '#1e293b' : '#e2e8f0' }}>
          <div className="flex items-center gap-3 mb-1"><span className="text-3xl">{wf.emoji}</span><div><div className={`text-lg font-bold ${tw(dm, 'heading')}`}>{wf.title}</div><div className={`text-sm ${tw(dm, 'muted')}`}>{wf.problem}</div></div></div>
        </div>
        <div className="flex">
          <div className={`w-52 shrink-0 border-r p-3 space-y-1.5 ${tw(dm, 'border')}`}>
            {wf.steps.map((step, i) => {
              const server = ecoServers.find(s => s.id === step.toolId);
              const c = ACTOR_COLORS[step.actor] ?? '#64748b';
              return (
                <button key={i} onClick={() => setActiveStep(i)} className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${activeStep === i ? 'text-white' : dm ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`} style={activeStep === i ? { background: c } : {}}>
                  <div className="flex items-center gap-2"><span className="text-base">{server?.emoji ?? '👤'}</span><div className="min-w-0"><div className="text-xs font-bold truncate">{step.tool}</div><div className={`text-xs ${activeStep === i ? 'text-white/70' : tw(dm, 'muted')}`}>Step {i + 1}</div></div></div>
                </button>
              );
            })}
          </div>
          <div className="flex-1 p-5">
            <AnimatePresence mode="wait">
              <motion.div key={`${activeWf}-${activeStep}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                {(() => {
                  const step = wf.steps[activeStep];
                  const server = ecoServers.find(s => s.id === step.toolId);
                  const c = ACTOR_COLORS[step.actor] ?? '#64748b';
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: c }}>{activeStep + 1}</div><div><div className="text-xs font-bold uppercase tracking-wider" style={{ color: c }}>{step.actor === 'claude' ? 'Claude' : step.actor === 'user' ? 'User' : step.tool}</div><div className={`text-lg font-semibold ${tw(dm, 'heading')}`}>{step.action}</div></div></div>
                      <p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{step.detail}</p>
                      {server && <div className={`p-3 rounded-xl text-sm ${dm ? 'bg-slate-800' : 'bg-slate-50'}`} style={{ borderLeft: `3px solid ${server.color}` }}><div className="flex items-center gap-2 mb-1"><span>{server.emoji}</span><span className="font-semibold" style={{ color: server.color }}>{server.name}</span></div><div className={`text-xs italic ${tw(dm, 'muted')}`}>{server.analogy}</div></div>}
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
            <div className={`flex items-center justify-between mt-5 pt-4 border-t ${tw(dm, 'border')}`}>
              <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${activeStep === 0 ? dm ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed' : dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>← Previous</button>
              <span className={`text-xs ${tw(dm, 'muted')}`}>Step {activeStep + 1} / {wf.steps.length}</span>
              <button onClick={() => setActiveStep(Math.min(wf.steps.length - 1, activeStep + 1))} disabled={activeStep === wf.steps.length - 1} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${activeStep === wf.steps.length - 1 ? dm ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed' : dm ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ── ── ENTERPRISE STACKS SECTION ── ── ──

function StacksSection({ dm }: { dm: boolean }) {
  const [selected, setSelected] = useState<EnterpriseStack | null>(null);
  const TIER_COLORS: Record<string, string> = { startup: '#10b981', scale: '#0ea5e9', enterprise: '#8b5cf6' };

  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-4 border ${dm ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
        <p className={`text-sm ${tw(dm, 'body')}`}>Reference architectures showing how real teams combine MCP servers into production AI systems — from lean startup stacks to enterprise platforms.</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {enterpriseStacks.map(stack => {
          const isOpen = selected?.id === stack.id;
          return (
            <div key={stack.id} className={`rounded-2xl border overflow-hidden ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
              <button onClick={() => setSelected(isOpen ? null : stack)} className="w-full text-left p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stack.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`font-bold ${tw(dm, 'heading')}`}>{stack.name}</div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: TIER_COLORS[stack.tier] + '20', color: TIER_COLORS[stack.tier] }}>{stack.tier}</span>
                      </div>
                      <div className={`text-sm ${tw(dm, 'muted')}`}>{stack.description}</div>
                    </div>
                  </div>
                  <span className={`text-sm ${tw(dm, 'muted')}`}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className={`px-5 pb-5 space-y-4 border-t ${tw(dm, 'border')}`}>
                      <div className={`pt-4 text-sm ${tw(dm, 'muted')}`}><span className="font-bold" style={{ color: stack.color }}>Use case: </span>{stack.useCase}</div>
                      <div className="space-y-3">
                        {stack.layers.map((layer, i) => {
                          const tools = layer.toolIds.map(id => ecoServers.find(s => s.id === id)).filter(Boolean) as EcoServer[];
                          return (
                            <div key={i} className={`p-3 rounded-xl ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: stack.color }}>{layer.label}</span>
                                <span className={`text-xs ${tw(dm, 'muted')}`}>— {layer.purpose}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {tools.map(t => <span key={t.id} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: t.color + '22', color: t.color }}>{t.emoji} {t.name}</span>)}
                              </div>
                            </div>
                          );
                        })}
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
}

// ── ── ── SECURITY SECTION ── ── ──

function SecuritySection({ dm }: { dm: boolean }) {
  const [evalOpen, setEvalOpen] = useState<string | null>(null);
  const WEIGHT_META = { critical: { color: '#ef4444', label: 'Critical' }, important: { color: '#f59e0b', label: 'Important' }, nice: { color: '#64748b', label: 'Nice-to-have' } };
  return (
    <div className="space-y-8">
      <div className={`rounded-2xl p-6 border ${dm ? 'border-red-800/40 bg-red-950/20' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center gap-2 mb-3"><span className="text-2xl">⚠️</span><div className="text-lg font-bold" style={{ color: '#ef4444' }}>MCP Security Reality</div></div>
        <p className={`text-sm leading-relaxed mb-4 ${tw(dm, 'body')}`}>MCP tools have direct access to files, databases, terminals, and APIs. The most dangerous attacks don't target the server directly — they target Claude via prompt injection in tool results, turning Claude's reasoning process into an attack vector.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💉', title: 'Prompt Injection', detail: 'Malicious content in tool results overrides Claude\'s instructions mid-workflow.' },
            { icon: '🔗', title: 'Capability Chaining', detail: 'Combining safe tools creates dangerous capabilities: read_file + http_request = credential exfiltration.' },
            { icon: '🏭', title: 'Supply Chain', detail: 'Malicious MCP server published under a name similar to a legitimate one.' },
            { icon: '🔑', title: 'Credential Exposure', detail: 'Filesystem tools can read .env and kubeconfig files that Claude includes in responses.' },
          ].map(item => (
            <div key={item.title} className={`p-3 rounded-xl ${dm ? 'bg-red-950/30 border border-red-800/30' : 'bg-red-100 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-1"><span>{item.icon}</span><div className="text-sm font-bold" style={{ color: '#ef4444' }}>{item.title}</div></div>
              <div className={`text-xs leading-relaxed ${tw(dm, 'body')}`}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={`text-lg font-bold mb-1 ${tw(dm, 'heading')}`}>How to Evaluate Any MCP Server</div>
        <div className={`text-sm mb-5 ${tw(dm, 'muted')}`}>Use these criteria before adding any community server to your production system.</div>
        <div className="space-y-2">
          {evalCriteria.map(c => {
            const wMeta = WEIGHT_META[c.weight];
            const isOpen = evalOpen === c.id;
            return (
              <div key={c.id}>
                <button onClick={() => setEvalOpen(isOpen ? null : c.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${tw(dm, 'card')} ${isOpen ? dm ? 'border-slate-500 rounded-b-none' : 'border-slate-300 rounded-b-none' : tw(dm, 'border')}`}>
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: wMeta.color + '20', color: wMeta.color }}>{wMeta.label}</span><span className={`font-semibold text-sm ${tw(dm, 'heading')}`}>{c.label}</span></div><span className={`text-xs ${tw(dm, 'muted')}`}>{isOpen ? '▲' : '▼'}</span></div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={`p-4 rounded-b-xl border border-t-0 grid grid-cols-2 gap-4 ${dm ? 'bg-slate-800/80 border-slate-500' : 'bg-slate-50 border-slate-300'}`}>
                        <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>✅ Good Signal</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{c.goodSignal}</p></div>
                        <div><div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#ef4444' }}>❌ Bad Signal</div><p className={`text-sm leading-relaxed ${tw(dm, 'body')}`}>{c.badSignal}</p></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ── ── HYPE SECTION ── ── ──

function HypeSection({ dm }: { dm: boolean }) {
  const [selected, setSelected] = useState<HypeAnalysis | null>(null);
  return (
    <div className="space-y-5">
      <div className={`rounded-xl p-4 border ${dm ? 'border-amber-800/40 bg-amber-950/20' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-center gap-2 mb-1"><span className="text-lg">📊</span><div className="font-bold" style={{ color: '#f59e0b' }}>Signal vs Hype</div></div>
        <p className={`text-sm ${tw(dm, 'body')}`}>Not every trending AI repo belongs in your stack. This section evaluates real repositories against production signal indicators — maintenance quality, genuine adoption, and operational fit — separate from social media hype and GitHub star gaming.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {hypeAnalyses.map(h => {
          const vMeta = HYPE_VERDICT_META[h.verdict];
          const isSelected = selected?.id === h.id;
          return (
            <div key={h.id}>
              <button onClick={() => setSelected(isSelected ? null : h)} className={`w-full text-left p-4 rounded-xl border transition-all ${tw(dm, 'card')} ${isSelected ? dm ? 'border-slate-500 rounded-b-none' : 'border-slate-300 rounded-b-none' : tw(dm, 'border')}`} style={{ borderLeft: `3px solid ${vMeta.color}` }}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl shrink-0">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`font-bold ${tw(dm, 'heading')}`}>{h.name}</div>
                      <span className="text-xs font-mono" style={{ color: '#f59e0b' }}>★ {fmtStars(h.stars)}</span>
                    </div>
                    <div className={`text-sm ${tw(dm, 'body')}`}>{h.summary}</div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-lg font-bold" style={{ color: vMeta.color }}>{vMeta.icon}</div>
                    <div className="text-xs font-bold" style={{ color: vMeta.color }}>{vMeta.label}</div>
                  </div>
                  <div className="shrink-0 w-20">
                    <div className={`text-xs mb-1 ${tw(dm, 'muted')}`}>Signal</div>
                    <div className={`h-1.5 rounded-full ${dm ? 'bg-slate-700' : 'bg-slate-200'}`}><div className="h-1.5 rounded-full" style={{ width: `${h.signalScore}%`, background: '#10b981' }} /></div>
                    <div className={`text-xs mt-2 mb-1 ${tw(dm, 'muted')}`}>Hype</div>
                    <div className={`h-1.5 rounded-full ${dm ? 'bg-slate-700' : 'bg-slate-200'}`}><div className="h-1.5 rounded-full" style={{ width: `${h.hypeScore}%`, background: '#ef4444' }} /></div>
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className={`p-4 rounded-b-xl border border-t-0 grid grid-cols-2 gap-5 ${dm ? 'bg-slate-800/80 border-slate-500' : 'bg-slate-50 border-slate-300'}`}>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>✅ Why It\'s Solid</div>
                        {h.goodPoints.map((g, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#10b981' }}>✓</span><span className={tw(dm, 'body')}>{g}</span></div>)}
                        <div className={`mt-3 p-2.5 rounded-xl text-xs ${dm ? 'bg-emerald-950/30' : 'bg-emerald-50'}`}><span className="font-bold" style={{ color: '#10b981' }}>Best for: </span><span className={tw(dm, 'body')}>{h.bestFor}</span></div>
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>⚠ Concerns</div>
                        {h.concernPoints.map((c, i) => <div key={i} className="flex gap-2 text-sm mb-1"><span style={{ color: '#f59e0b' }}>⚠</span><span className={tw(dm, 'body')}>{c}</span></div>)}
                        <div className={`mt-3 p-2.5 rounded-xl text-xs ${dm ? 'bg-red-950/30' : 'bg-red-50'}`}><span className="font-bold" style={{ color: '#ef4444' }}>Not for: </span><span className={tw(dm, 'body')}>{h.notFor}</span></div>
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
}

// ── ── ── MAIN PAGE ── ── ──

export function MCPEcosystemPage() {
  const { darkMode } = useAppStore();
  const dm = darkMode;
  const [section, setSection] = useState<EcoSection>('discover');
  const activeMeta = NAV_ITEMS.find(n => n.id === section)!;

  return (
    <div className={`flex h-full overflow-hidden ${tw(dm, 'page')}`}>
      {/* Sidebar */}
      <div className={`w-56 shrink-0 flex flex-col border-r ${tw(dm, 'card')} ${tw(dm, 'border')}`}>
        <div className="p-3 border-b" style={{ borderColor: dm ? '#1e293b' : '#e2e8f0' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <div>
              <div className={`text-sm font-bold leading-tight ${tw(dm, 'heading')}`}>Ecosystem Hub</div>
              <div className={`text-xs ${tw(dm, 'muted')}`}>AI engineering universe</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = item.id === section;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-violet-600 to-sky-500 text-white' : dm ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                    <div className={`text-xs leading-tight truncate ${isActive ? 'text-white/70' : tw(dm, 'muted')}`}>{item.desc}</div>
                  </div>
                  {item.isNew && <span className="text-xs px-1 rounded font-bold shrink-0" style={{ background: '#10b981', color: '#fff', fontSize: 8 }}>NEW</span>}
                </div>
              </button>
            );
          })}
        </nav>
        <div className={`p-3 border-t text-center ${tw(dm, 'border')}`}>
          <div className={`text-xs ${tw(dm, 'muted')}`}><span className="text-emerald-500 font-bold">●</span> Curated · May 2025</div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{activeMeta.emoji}</span>
            <div>
              <h1 className={`text-2xl font-bold ${tw(dm, 'heading')}`}>{activeMeta.label}</h1>
              <p className={`text-sm ${tw(dm, 'muted')}`}>{activeMeta.desc}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {section === 'discover'  && <DiscoverSection  dm={dm} />}
              {section === 'skills'    && <SkillsSection    dm={dm} />}
              {section === 'repos'     && <ReposSection     dm={dm} />}
              {section === 'workflows' && <WorkflowsSection dm={dm} />}
              {section === 'stacks'    && <StacksSection    dm={dm} />}
              {section === 'security'  && <SecuritySection  dm={dm} />}
              {section === 'hype'      && <HypeSection      dm={dm} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
