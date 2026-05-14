import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  chatChips, chatSidebarItems, coworkSidebarItems, codeSidebarItems,
  connectors, architectureItems,
} from '@/data/studioData';
import type { StudioItem, ConnectorItem } from '@/data/studioData';

type Mode = 'chat' | 'cowork' | 'code';
type DetailTab = 'overview' | 'workflow' | 'usecases' | 'enterprise';
type DetailItem = StudioItem | ConnectorItem;
type AppView =
  | { type: 'workspace' }
  | { type: 'connectors' }
  | { type: 'architecture' }
  | { type: 'detail'; item: DetailItem; from: 'workspace' | 'connectors' | 'architecture' };

// ── Color palette (always-dark, Claude Desktop-inspired) ──────────────────────
const BG = '#111113';
const SIDEBAR = '#0d0d0f';
const BORDER = '#232323';
const TEXT = '#e5e5e5';
const MUTED = '#8b8b8b';
const DIM = '#4a4a4a';
const HOVER = 'rgba(255,255,255,0.04)';
const ACTIVE_BG = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#1c1c1e';
const ORANGE = '#d97706';

const ACTOR_COLORS: Record<string, string> = {
  User: '#0ea5e9',
  Claude: '#d97706',
  System: '#64748b',
  Tool: '#ec4899',
  MCP: '#8b5cf6',
};

// ── Sidebar row ───────────────────────────────────────────────────────────────

function SidebarRow({ emoji, label, active, badge, onClick }: {
  emoji: string;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px', cursor: 'pointer', borderRadius: 5,
        background: active ? ACTIVE_BG : hovered ? HOVER : 'transparent',
        color: active ? TEXT : MUTED,
        fontSize: 13, transition: 'background 0.1s',
        margin: '1px 4px',
      }}
    >
      <span style={{ width: 18, textAlign: 'center', fontSize: 14, flexShrink: 0 }}>{emoji}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {badge && (
        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#2a2a2a', color: DIM }}>{badge}</span>
      )}
    </div>
  );
}

function SidebarLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: DIM, padding: '10px 14px 4px' }}>
      {children}
    </div>
  );
}

function SidebarActionBtn({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', cursor: 'pointer', borderRadius: 5,
        background: hovered ? HOVER : 'transparent',
        color: TEXT, fontSize: 13, transition: 'background 0.1s',
        margin: '2px 4px',
      }}
    >
      <span style={{ fontSize: 15, color: DIM }}>{emoji}</span>
      {label}
    </div>
  );
}

// ── Mode selector tab ─────────────────────────────────────────────────────────

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 12px', borderRadius: 6, fontSize: 13,
        background: active ? 'rgba(255,255,255,0.1)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active ? TEXT : MUTED,
        border: 'none', cursor: 'pointer', transition: 'background 0.12s',
        fontWeight: active ? 500 : 400,
      }}
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </button>
  );
}

// ── Sidebar column ─────────────────────────────────────────────────────────────

function SidebarColumn({ mode, view, onChangeMode, onSelectItem, onOpenSection }: {
  mode: Mode;
  view: AppView;
  onChangeMode: (m: Mode) => void;
  onSelectItem: (item: DetailItem) => void;
  onOpenSection: (s: 'connectors' | 'architecture') => void;
}) {
  const activeId = view.type === 'detail' ? view.item.id
    : view.type === 'connectors' ? 'connectors'
    : view.type === 'architecture' ? 'architecture'
    : null;

  return (
    <div style={{ width: 232, flexShrink: 0, background: SIDEBAR, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo + mode selector */}
      <div style={{ padding: '12px 10px 8px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingLeft: 4 }}>
          <span style={{ color: ORANGE, fontSize: 18, lineHeight: 1 }}>✺</span>
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>Claude Studio</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {(['chat', 'cowork', 'code'] as Mode[]).map(m => (
            <ModeTab key={m} label={m} active={mode === m} onClick={() => onChangeMode(m)} />
          ))}
        </div>
      </div>

      {/* Scrollable items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {mode === 'chat' && (
          <>
            <SidebarActionBtn emoji="+" label="New chat" onClick={() => {}} />
            <SidebarLabel>Library</SidebarLabel>
            {chatSidebarItems.map(item => (
              <SidebarRow key={item.id} emoji={item.emoji} label={item.label} active={activeId === item.id} onClick={() => onSelectItem(item)} />
            ))}
            <SidebarLabel>Explore</SidebarLabel>
            <SidebarRow emoji="🔌" label="Connectors & MCP" active={activeId === 'connectors'} onClick={() => onOpenSection('connectors')} />
            <SidebarRow emoji="🏗️" label="Architecture" active={activeId === 'architecture'} onClick={() => onOpenSection('architecture')} />
            <SidebarLabel>Recents</SidebarLabel>
            {['How MCP tool_use works', 'Explain context windows', 'Build an AI eval pipeline'].map(t => (
              <SidebarRow key={t} emoji="💬" label={t} onClick={() => {}} />
            ))}
          </>
        )}

        {mode === 'cowork' && (
          <>
            <SidebarActionBtn emoji="+" label="New task" onClick={() => {}} />
            {coworkSidebarItems.map(item => (
              <SidebarRow key={item.id} emoji={item.emoji} label={item.label}
                badge={item.id === 'dispatch' ? 'Beta' : undefined}
                active={activeId === item.id}
                onClick={() => onSelectItem(item)}
              />
            ))}
            <SidebarLabel>Explore</SidebarLabel>
            <SidebarRow emoji="🔌" label="Connectors & MCP" active={activeId === 'connectors'} onClick={() => onOpenSection('connectors')} />
            <SidebarLabel>Dispatch</SidebarLabel>
            {['Analyze Q4 engineering metrics', 'Weekly security scan', 'Nightly AI evals'].map(t => (
              <SidebarRow key={t} emoji="📋" label={t} onClick={() => {}} />
            ))}
          </>
        )}

        {mode === 'code' && (
          <>
            <SidebarActionBtn emoji="+" label="New session" onClick={() => {}} />
            {codeSidebarItems.map(item => (
              <SidebarRow key={item.id} emoji={item.emoji} label={item.label} active={activeId === item.id} onClick={() => onSelectItem(item)} />
            ))}
            <SidebarRow emoji="⋯" label="More" onClick={() => {}} />
            <SidebarLabel>Explore</SidebarLabel>
            <SidebarRow emoji="🏗️" label="Architecture" active={activeId === 'architecture'} onClick={() => onOpenSection('architecture')} />
            <SidebarRow emoji="🔌" label="Connectors & MCP" active={activeId === 'connectors'} onClick={() => onOpenSection('connectors')} />
            <SidebarLabel>Recents</SidebarLabel>
            {['Add real Labrador images to website', 'Slack session for birthday-invitation', 'Fix TypeScript strict mode errors'].map(t => (
              <SidebarRow key={t} emoji="💻" label={t} onClick={() => {}} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Chat workspace ────────────────────────────────────────────────────────────

function ChatWorkspace({ onSelectItem }: { onSelectItem: (item: DetailItem) => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 80px' }}>
      <div style={{ color: ORANGE, fontSize: 36, marginBottom: 18, lineHeight: 1 }}>✺</div>
      <h1 style={{ fontSize: 28, fontWeight: 500, color: TEXT, marginBottom: 28, textAlign: 'center' }}>
        Good afternoon, Rajesh.
      </h1>
      {/* Input box */}
      <div style={{ width: '100%', maxWidth: 700, background: INPUT_BG, borderRadius: 14, border: `1px solid ${BORDER}`, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ color: MUTED, fontSize: 15 }}>Type <span style={{ color: DIM }}>/</span> for skills...</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 18, color: DIM, cursor: 'pointer' }}>+</span>
          <span style={{ fontSize: 12, color: DIM }}>Sonnet 4.6  🎤</span>
        </div>
      </div>
      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {chatChips.map(chip => (
          <ChipButton key={chip.id} emoji={chip.emoji} label={chip.label} onClick={() => onSelectItem(chip)} />
        ))}
      </div>
    </div>
  );
}

function ChipButton({ emoji, label, onClick }: { emoji: string; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 999,
        border: `1px solid ${hovered ? '#3a3a3a' : BORDER}`,
        background: hovered ? '#1e1e1e' : 'transparent',
        color: hovered ? TEXT : MUTED, fontSize: 13,
        cursor: 'pointer', transition: 'all 0.12s',
      }}
    >
      <span style={{ fontSize: 14 }}>{emoji}</span>
      {label}
    </button>
  );
}

// ── Cowork workspace ──────────────────────────────────────────────────────────

function CoworkWorkspace({ onSelectItem }: { onSelectItem: (item: DetailItem) => void }) {
  const liveItem = coworkSidebarItems.find(i => i.id === 'live-artifacts') ?? coworkSidebarItems[0];
  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Live artifacts</h1>
          <p style={{ color: MUTED, fontSize: 13, maxWidth: 480, lineHeight: 1.6 }}>
            Create dynamic artifacts that stay up-to-date using live data from your{' '}
            <span style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onSelectItem(liveItem)}>
              connectors
            </span>.
          </p>
        </div>
        <button onClick={() => onSelectItem(liveItem)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#1e1e1e', border: `1px solid ${BORDER}`, color: TEXT, fontSize: 13, cursor: 'pointer' }}>
          + New artifact ▾
        </button>
      </div>
      {/* Empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 72, height: 72, borderRadius: 12, background: '#1a1a1a', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
          📁
        </div>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 20 }}>Create your first artifact</p>
        <button onClick={() => onSelectItem(liveItem)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#1a1a1a', border: `1px solid ${BORDER}`, color: MUTED, fontSize: 13, cursor: 'pointer' }}>
          <span>⚙️</span> What needs my attention
        </button>
      </div>
    </div>
  );
}

// ── Code workspace ────────────────────────────────────────────────────────────

function CodeWorkspace({ onSelectItem }: { onSelectItem: (item: DetailItem) => void }) {
  const sessionsItem = codeSidebarItems.find(i => i.id === 'sessions') ?? codeSidebarItems[0];
  const mockSessions = [
    { title: 'Build MCP server for PostgreSQL with read-only tool schemas', status: 'Needs input' },
    { title: 'Add CLAUDE.md rules for TypeScript strict mode enforcement', status: 'Needs input' },
    { title: 'Implement multi-agent orchestration with planner + executor pattern', status: 'In progress' },
    { title: 'Write AI evals golden dataset for Claude tool_use accuracy', status: 'Completed' },
    { title: 'Refactor .claude/commands to include /run-evals and /deploy-staging', status: 'Completed' },
  ];
  return (
    <div style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
        <span style={{ color: ORANGE, fontSize: 20 }}>✺</span>
        <h1 style={{ fontSize: 19, fontWeight: 400, color: TEXT }}>Welcome back, Rajesh</h1>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: DIM, marginBottom: 10 }}>
          Sessions
        </div>
        {mockSessions.map((s, i) => (
          <SessionRow key={i} session={s} onClick={() => onSelectItem(sessionsItem)} />
        ))}
      </div>
    </div>
  );
}

function SessionRow({ session, onClick }: { session: { title: string; status: string }; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isNeedsInput = session.status === 'Needs input';
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
        background: hovered ? HOVER : 'transparent',
        marginBottom: 2, transition: 'background 0.1s',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: isNeedsInput ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: isNeedsInput ? '#f59e0b' : '#22c55e', flexShrink: 0 }}>{session.status}</span>
      <span style={{ fontSize: 14, color: TEXT }}>{session.title}</span>
    </div>
  );
}

// ── Connectors section ────────────────────────────────────────────────────────

function ConnectorsSection({ onSelectConnector, onBack }: {
  onSelectConnector: (item: ConnectorItem) => void;
  onBack: () => void;
}) {
  return (
    <div style={{ flex: 1, padding: '24px 36px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <BackButton onClick={onBack} />
        <h1 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>Connectors & MCP</h1>
      </div>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        Tools that give Claude hands — safe, structured access to real systems, databases, and services.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {connectors.map(c => (
          <ConnectorCard key={c.id} connector={c} onClick={() => onSelectConnector(c)} />
        ))}
      </div>
    </div>
  );
}

function ConnectorCard({ connector, onClick }: { connector: ConnectorItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 18px', borderRadius: 10, cursor: 'pointer',
        background: hovered ? '#1a1a1a' : '#161618',
        border: `1px solid ${hovered ? '#323232' : BORDER}`,
        transition: 'all 0.12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{connector.emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{connector.label}</span>
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: 0 }}>{connector.tagline}</p>
    </div>
  );
}

// ── Architecture section ──────────────────────────────────────────────────────

function ArchitectureSection({ onSelectItem, onBack }: {
  onSelectItem: (item: StudioItem) => void;
  onBack: () => void;
}) {
  return (
    <div style={{ flex: 1, padding: '24px 36px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <BackButton onClick={onBack} />
        <h1 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0 }}>Claude Architecture</h1>
      </div>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
        How Claude actually works internally — context loading, tool use, and multi-agent orchestration.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {architectureItems.map(item => (
          <ArchCard key={item.id} item={item} onClick={() => onSelectItem(item)} />
        ))}
      </div>
    </div>
  );
}

function ArchCard({ item, onClick }: { item: StudioItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '18px 20px', borderRadius: 10, cursor: 'pointer',
        background: hovered ? '#1a1a1a' : '#161618',
        border: `1px solid ${hovered ? '#323232' : BORDER}`,
        borderLeft: `3px solid ${item.color}`,
        transition: 'all 0.12s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{item.emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{item.label}</span>
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: 0 }}>{item.tagline}</p>
    </div>
  );
}

// ── Back button ───────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px', borderRadius: 5,
        background: hovered ? HOVER : 'transparent',
        border: 'none', color: MUTED, fontSize: 13, cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      ← Back
    </button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ item, tab, onTabChange, onBack }: {
  item: DetailItem;
  tab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onBack: () => void;
}) {
  const isStudio = 'bestPractices' in item;
  const bestPractices = isStudio ? (item as StudioItem).bestPractices : [];
  const mistakes = isStudio ? (item as StudioItem).mistakes : undefined;

  const tabs: Array<{ id: DetailTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'usecases', label: 'Use Cases' },
    { id: 'enterprise', label: 'Enterprise' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 36px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <BackButton onClick={onBack} />
        <div style={{ width: 1, height: 20, background: BORDER }} />
        <span style={{ fontSize: 26, lineHeight: 1 }}>{item.emoji}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{item.label}</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{item.tagline}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, padding: '0 36px', flexShrink: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: '10px 14px', fontSize: 13,
              color: tab === t.id ? TEXT : MUTED,
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              borderBottom: `2px solid ${tab === t.id ? ORANGE : 'transparent'}`,
              background: 'transparent',
              cursor: 'pointer', transition: 'color 0.1s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
          >
            {tab === 'overview' && <OverviewTab item={item} />}
            {tab === 'workflow' && <WorkflowTab item={item} />}
            {tab === 'usecases' && <UseCasesTab item={item} />}
            {tab === 'enterprise' && <EnterpriseTab item={item} bestPractices={bestPractices} mistakes={mistakes} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Detail tabs ───────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function OverviewTab({ item }: { item: DetailItem }) {
  const analogyDetail = 'analogyDetail' in item ? item.analogyDetail : null;
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <SectionHeading>What it is</SectionHeading>
        <p style={{ color: TEXT, lineHeight: 1.75, fontSize: 14, margin: 0 }}>{item.what}</p>
      </div>
      <div style={{ marginBottom: 28 }}>
        <SectionHeading>Why it exists</SectionHeading>
        <p style={{ color: TEXT, lineHeight: 1.75, fontSize: 14, margin: 0 }}>{item.why}</p>
      </div>
      <div style={{ background: '#161618', borderRadius: 10, padding: '16px 20px', borderLeft: `3px solid ${ORANGE}` }}>
        <SectionHeading>Analogy</SectionHeading>
        <p style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: analogyDetail ? 8 : 0, marginTop: 0 }}>{item.analogy}</p>
        {analogyDetail && <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{analogyDetail}</p>}
      </div>
    </div>
  );
}

function WorkflowTab({ item }: { item: DetailItem }) {
  return (
    <div style={{ maxWidth: 700 }}>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Step-by-step walkthrough of how this feature works in a real-world scenario.
      </p>
      {item.workflow.map((step, i) => {
        const color = ACTOR_COLORS[step.actor] ?? '#64748b';
        return (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1a1a1a', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: DIM, flexShrink: 0 }}>
                {i + 1}
              </div>
              {i < item.workflow.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />}
            </div>
            <div style={{ paddingBottom: 16 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${color}20`, color }}>
                {step.actor}
              </span>
              <div style={{ fontSize: 14, fontWeight: 500, color: TEXT, marginTop: 6, marginBottom: 4 }}>{step.action}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, fontFamily: step.detail.startsWith('"') || step.detail.startsWith('{') ? 'monospace' : 'inherit' }}>
                {step.detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UseCasesTab({ item }: { item: DetailItem }) {
  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
        Real scenarios where this capability delivers concrete value.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {item.useCases.map((uc, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: '#161618', borderRadius: 8, border: `1px solid ${BORDER}` }}>
            <span style={{ color: ORANGE, flexShrink: 0, marginTop: 1 }}>→</span>
            <span style={{ fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{uc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnterpriseTab({ item, bestPractices, mistakes }: {
  item: DetailItem;
  bestPractices: string[];
  mistakes: string[] | undefined;
}) {
  return (
    <div style={{ maxWidth: 680 }}>
      {item.enterprise.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeading>Enterprise Scenarios</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.enterprise.map((e, i) => (
              <div key={i} style={{ fontSize: 13, color: TEXT, lineHeight: 1.65, padding: '10px 14px', background: '#161618', borderRadius: 7, border: `1px solid ${BORDER}` }}>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {bestPractices.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeading>Best Practices</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bestPractices.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {mistakes && mistakes.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <SectionHeading>Common Mistakes</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {mistakes.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>✗</span>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {item.security && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: 8 }}>
            🔒 Security Note
          </div>
          <p style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.65, margin: 0 }}>{item.security}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ClaudeDesktopStudioPage() {
  const [mode, setMode] = useState<Mode>('code');
  const [view, setView] = useState<AppView>({ type: 'workspace' });
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  const changeMode = (m: Mode) => {
    setMode(m);
    setView({ type: 'workspace' });
    setDetailTab('overview');
  };

  const selectItem = (item: DetailItem, from: 'workspace' | 'connectors' | 'architecture' = 'workspace') => {
    setView({ type: 'detail', item, from });
    setDetailTab('overview');
  };

  const openSection = (s: 'connectors' | 'architecture') => {
    setView({ type: s });
  };

  const goBack = () => {
    if (view.type === 'detail') {
      if (view.from === 'workspace') setView({ type: 'workspace' });
      else setView({ type: view.from });
    } else {
      setView({ type: 'workspace' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, color: TEXT, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: SIDEBAR }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: MUTED, fontSize: 12, textDecoration: 'none' }}>
          ← Learning App
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <span style={{ color: ORANGE, fontSize: 16 }}>✺</span>
          <span style={{ color: MUTED, fontSize: 13 }}>Claude Desktop Explorer</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#1a1a1a', border: `1px solid ${BORDER}`, color: DIM }}>
            Educational simulator
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <SidebarColumn
          mode={mode}
          view={view}
          onChangeMode={changeMode}
          onSelectItem={item => selectItem(item)}
          onOpenSection={openSection}
        />

        {/* Main workspace */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={view.type === 'detail' ? `detail-${view.item.id}` : view.type}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.15 }}
              style={{ flex: 1, display: 'flex', overflow: 'hidden', width: '100%' }}
            >
              {view.type === 'workspace' && mode === 'chat' && (
                <ChatWorkspace onSelectItem={item => selectItem(item)} />
              )}
              {view.type === 'workspace' && mode === 'cowork' && (
                <CoworkWorkspace onSelectItem={item => selectItem(item)} />
              )}
              {view.type === 'workspace' && mode === 'code' && (
                <CodeWorkspace onSelectItem={item => selectItem(item)} />
              )}
              {view.type === 'connectors' && (
                <ConnectorsSection onSelectConnector={c => selectItem(c, 'connectors')} onBack={goBack} />
              )}
              {view.type === 'architecture' && (
                <ArchitectureSection onSelectItem={item => selectItem(item, 'architecture')} onBack={goBack} />
              )}
              {view.type === 'detail' && (
                <DetailPanel item={view.item} tab={detailTab} onTabChange={setDetailTab} onBack={goBack} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
