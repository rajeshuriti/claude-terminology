import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronLeft, Layers, Network, X } from 'lucide-react';
import { concepts, conceptMap } from '@/data/concepts';
import { categories, categoryMap } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import type { Category, Concept } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type CatKey = Parameters<typeof categoryMap.get>[0];

// ─── Layout: hub-and-spoke for filtered mode ──────────────────────────────────

function buildFilteredLayout(catId: string): { nodes: Node[]; edges: Edge[] } {
  const cat = categoryMap.get(catId as CatKey);
  const primaryConcepts = concepts.filter((c) => c.categoryId === catId);

  // Collect related concepts from other categories, capped at 14 (by cert priority)
  const relatedIdSet = new Set<string>();
  primaryConcepts.forEach((c) =>
    c.relatedConcepts.forEach((rid) => {
      const rel = conceptMap.get(rid);
      if (rel && rel.categoryId !== catId) relatedIdSet.add(rid);
    }),
  );
  const relatedConcepts = [...relatedIdSet]
    .map((id) => conceptMap.get(id)!)
    .filter(Boolean)
    .sort((a, b) => b.certificationPriority - a.certificationPriority)
    .slice(0, 14);

  // Dynamic radii — guarantee ≥ 240 px arc-length per node so labels never overlap
  const np = primaryConcepts.length;
  const nr = relatedConcepts.length;
  const PRIMARY_R = np <= 1 ? 0 : Math.max(160, Math.ceil((240 * np) / (2 * Math.PI)));
  const RELATED_R = Math.max(PRIMARY_R + 280, Math.ceil((260 * nr) / (2 * Math.PI)));

  const CX = 700;
  const CY = 440;

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const visibleIds = new Set([
    ...primaryConcepts.map((c) => c.id),
    ...relatedConcepts.map((c) => c.id),
  ]);

  // ── Primary nodes: inner ring ──
  primaryConcepts.forEach((concept, i) => {
    const angle = np === 1 ? -Math.PI / 2 : (i / np) * 2 * Math.PI - Math.PI / 2;
    nodes.push({
      id: concept.id,
      type: 'concept',
      position: {
        x: CX + Math.cos(angle) * (np === 1 ? 0 : PRIMARY_R),
        y: CY + Math.sin(angle) * (np === 1 ? 0 : PRIMARY_R),
      },
      data: makeNodeData(concept, cat?.color ?? '#64748b', cat?.icon ?? '📌', cat?.name.split(' ')[0] ?? '', true, false),
    });
  });

  // ── Related nodes: outer ring ──
  relatedConcepts.forEach((concept, i) => {
    const relCat = categoryMap.get(concept.categoryId as CatKey);
    const angle = nr === 1 ? -Math.PI / 2 : (i / nr) * 2 * Math.PI - Math.PI / 2;
    nodes.push({
      id: concept.id,
      type: 'concept',
      position: {
        x: CX + Math.cos(angle) * RELATED_R,
        y: CY + Math.sin(angle) * RELATED_R,
      },
      data: makeNodeData(
        concept,
        relCat?.color ?? '#64748b',
        relCat?.icon ?? '📌',
        relCat?.name.split(' ')[0] ?? '',
        false,
        true,
      ),
    });
  });

  // ── Edges: only between visible nodes ──
  [...primaryConcepts, ...relatedConcepts].forEach((concept) => {
    const srcCat = categoryMap.get(concept.categoryId as CatKey);
    concept.relatedConcepts.forEach((relId) => {
      if (!visibleIds.has(relId)) return;
      const key = [concept.id, relId].sort().join('~~');
      if (seen.has(key)) return;
      seen.add(key);
      const isPrim =
        concept.categoryId === catId || conceptMap.get(relId)?.categoryId === catId;
      edges.push({
        id: key,
        source: concept.id,
        target: relId,
        type: 'bezier',
        animated: isPrim,
        style: {
          stroke: srcCat?.color ?? '#94a3b8',
          strokeWidth: isPrim ? 2.2 : 1.5,
          opacity: isPrim ? 0.82 : 0.38,
        },
        markerEnd: isPrim
          ? { type: MarkerType.ArrowClosed, color: srcCat?.color ?? '#94a3b8', width: 12, height: 12 }
          : undefined,
      });
    });
  });

  return { nodes, edges };
}

function makeNodeData(
  concept: Concept,
  color: string,
  icon: string,
  catShort: string,
  isPrimary: boolean,
  isRelated: boolean,
) {
  return {
    label: concept.term,
    color,
    icon,
    catShort,
    difficulty: concept.difficulty,
    certPriority: concept.certificationPriority,
    isPrimary,
    isRelated,
    isSelected: false,
    isDimmed: false,
  };
}

// ─── Custom node ──────────────────────────────────────────────────────────────

const DIFF: Record<string, [string, string]> = {
  beginner: ['#dcfce7', '#15803d'],
  intermediate: ['#dbeafe', '#1d4ed8'],
  advanced: ['#ede9fe', '#7c3aed'],
};

function ConceptNode({ data }: NodeProps) {
  const [hov, setHov] = useState(false);
  const { darkMode } = useAppStore();
  const [bg, fg] = DIFF[data.difficulty as string] ?? DIFF.intermediate;

  const color = data.color as string;
  const isPrimary = data.isPrimary as boolean;
  const isSelected = data.isSelected as boolean;
  const isDimmed = data.isDimmed as boolean;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        transition: 'opacity 0.22s ease, box-shadow 0.18s ease, transform 0.15s ease',
        opacity: isDimmed ? 0.08 : 1,
        transform: hov && !isDimmed ? 'scale(1.06)' : 'scale(1)',
        backgroundColor: isPrimary ? color + '2a' : isSelected ? color + '18' : darkMode ? '#1e293b' : '#fff',
        border: `${isSelected ? 2.5 : isPrimary ? 2 : 1.5}px solid ${
          isSelected || isPrimary ? color : darkMode ? '#334155' : '#e2e8f0'
        }`,
        borderRadius: 14,
        padding: '11px 15px',
        minWidth: 168,
        maxWidth: 220,
        cursor: 'pointer',
        boxShadow: isSelected
          ? `0 0 0 4px ${color}3a, 0 10px 30px ${color}28`
          : isPrimary
            ? `0 4px 20px ${color}28`
            : hov
              ? '0 6px 22px rgba(0,0,0,0.13)'
              : '0 2px 7px rgba(0,0,0,0.06)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1, border: 'none' }} />

      {/* Icon row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{data.icon as string}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
          {data.catShort as string}
        </span>
        {isPrimary && (
          <span style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        )}
      </div>

      {/* Term */}
      <div style={{
        fontSize: isPrimary ? 12.5 : 11.5,
        fontWeight: isPrimary ? 700 : 600,
        lineHeight: 1.35,
        wordBreak: 'break-word',
        color: darkMode ? (isPrimary ? '#f1f5f9' : '#cbd5e1') : (isPrimary ? '#0f172a' : '#1e293b'),
      }}>
        {data.label as string}
      </div>

      {/* Difficulty badge */}
      <div style={{
        marginTop: 7,
        display: 'inline-block',
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.03em',
        padding: '2px 7px',
        borderRadius: 5,
        backgroundColor: darkMode ? color + '28' : bg,
        color: darkMode ? color : fg,
      }}>
        {data.difficulty as string}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1, border: 'none' }} />
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

// ─── ReactFlow graph (rendered only in focused mode) ─────────────────────────

interface GraphCanvasProps {
  catId: string;
  darkMode: boolean;
  onConceptSelect: (c: Concept | null) => void;
  selectedConceptId: string | null;
  rfRef: React.MutableRefObject<{ fitView: (o?: object) => void } | null>;
}

function GraphCanvas({ catId, darkMode, onConceptSelect, rfRef }: GraphCanvasProps) {
  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildFilteredLayout(catId),
    [catId],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // Re-layout when catId changes (sidebar click while graph is open)
  useEffect(() => {
    const { nodes: n, edges: e } = buildFilteredLayout(catId);
    setNodes(n);
    setEdges(e);
    setTimeout(() => rfRef.current?.fitView({ duration: 650, padding: 0.2 }), 70);
  }, [catId, setNodes, setEdges, rfRef]);

  const focusConcept = useCallback(
    (concept: Concept) => {
      onConceptSelect(concept);
      const nb = new Set([concept.id, ...concept.relatedConcepts]);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isSelected: n.id === concept.id, isDimmed: !nb.has(n.id) },
        })),
      );
      setEdges((eds) =>
        eds.map((e) => {
          const active = nb.has(e.source) && nb.has(e.target);
          return { ...e, animated: active, style: { ...e.style, opacity: active ? 0.92 : 0.05, strokeWidth: active ? 2.5 : 1 } };
        }),
      );
    },
    [onConceptSelect, setNodes, setEdges],
  );

  const resetFocus = useCallback(() => {
    onConceptSelect(null);
    const { nodes: n, edges: e } = buildFilteredLayout(catId);
    setNodes(n);
    setEdges(e);
  }, [catId, onConceptSelect, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const concept = conceptMap.get(node.id);
      if (concept) focusConcept(concept);
    },
    [focusConcept],
  );

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const border = darkMode ? '#1e293b' : '#e2e8f0';

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={resetFocus}
      nodeTypes={nodeTypes}
      onInit={(i) => {
        rfRef.current = i;
        setTimeout(() => i.fitView({ duration: 600, padding: 0.2 }), 50);
      }}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.12}
      maxZoom={2.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color={darkMode ? '#1e293b' : '#e8edf3'} />
      <Controls
        showInteractive={false}
        style={{ background: darkMode ? '#1e293b' : '#fff', border: `1px solid ${border}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      />
      <MiniMap
        nodeColor={(n) => n.data?.isDimmed ? (darkMode ? '#1e293b' : '#f1f5f9') : ((n.data?.color as string) ?? '#64748b')}
        maskColor={darkMode ? 'rgba(2,6,23,0.65)' : 'rgba(248,250,252,0.75)'}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12 }}
        pannable
        zoomable
      />
    </ReactFlow>
  );
}

// ─── Category overview grid (shown when no category is selected) ──────────────

interface OverviewProps {
  onSelect: (id: string) => void;
  darkMode: boolean;
}

function CategoryOverview({ onSelect, darkMode }: OverviewProps) {
  const catData = useMemo(
    () =>
      categories.map((cat) => {
        const catConcepts = concepts.filter((c) => c.categoryId === cat.id);
        const primaryIds = new Set(catConcepts.map((c) => c.id));
        const linked = new Set(
          catConcepts.flatMap((c) => c.relatedConcepts).filter((id) => !primaryIds.has(id) && conceptMap.has(id)),
        ).size;
        const avg = catConcepts.length
          ? (catConcepts.reduce((s, c) => s + c.certificationPriority, 0) / catConcepts.length).toFixed(1)
          : '0';
        const top = catConcepts
          .sort((a, b) => b.certificationPriority - a.certificationPriority)
          .slice(0, 3)
          .map((c) => c.term);
        return { ...cat, count: catConcepts.length, linked, avg, top };
      }),
    [],
  );

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 bg-sky-500/10 text-sky-500">
            <Network size={12} />
            Interactive Concept Graph
          </div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Select a Topic to Explore</h2>
          <p className={`mt-2 text-sm max-w-lg mx-auto ${textMuted}`}>
            Each category opens a focused relationship map — only that topic's concepts and their connections, nothing else.
          </p>
          <p className={`mt-1 text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            {concepts.length} concepts across {categories.length} categories
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {catData.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.28 }}
              whileHover={{ y: -3, transition: { duration: 0.14 } }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onSelect(cat.id)}
              className={`p-5 rounded-2xl border text-left transition-all hover:shadow-lg group ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-slate-200/60'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: cat.color + '22' }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold leading-snug ${textPrimary}`}>{cat.name}</div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: cat.color }}>
                    {cat.count} concepts · {cat.linked} links
                  </div>
                </div>
                <div
                  className="text-xs font-bold px-2 py-1 rounded-lg shrink-0"
                  style={{ backgroundColor: cat.color + '1a', color: cat.color }}
                >
                  ★ {cat.avg}
                </div>
              </div>

              {/* Description */}
              <p className={`text-xs leading-relaxed mb-3 line-clamp-2 ${textMuted}`}>{cat.description}</p>

              {/* Top terms */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cat.top.map((term) => (
                  <span
                    key={term}
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ backgroundColor: cat.color + '18', color: cat.color }}
                  >
                    {term}
                  </span>
                ))}
              </div>

              {/* CTA row */}
              <div
                className="flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
                style={{ color: cat.color }}
              >
                Explore graph
                <ArrowRight size={12} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail panel (right side) ────────────────────────────────────────────────

interface DetailPanelProps {
  concept: Concept;
  darkMode: boolean;
  onClose: () => void;
  onNavigateToConcept: (c: Concept) => void;
  onOpenFull: () => void;
}

function DetailPanel({ concept, darkMode, onClose, onNavigateToConcept, onOpenFull }: DetailPanelProps) {
  const cat = categoryMap.get(concept.categoryId as CatKey);
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const border = darkMode ? 'border-slate-700' : 'border-slate-100';
  const panelBg = darkMode ? 'bg-slate-900' : 'bg-white';

  return (
    <motion.aside
      key={concept.id}
      initial={{ x: 288, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 288, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      className={`w-72 shrink-0 flex flex-col border-l overflow-hidden ${border} ${panelBg}`}
    >
      {/* Header */}
      <div className={`flex items-start gap-2.5 p-4 border-b ${border}`}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: (cat?.color ?? '#64748b') + '20' }}
        >
          {cat?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-bold leading-snug ${textPrimary}`}>{concept.term}</h3>
          <div className="text-xs mt-0.5 font-semibold" style={{ color: cat?.color }}>
            {concept.category}
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className={`text-xs leading-relaxed ${textMuted}`}>{concept.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: concept.difficulty, color: concept.difficulty === 'beginner' ? '#10b981' : concept.difficulty === 'intermediate' ? '#0ea5e9' : '#8b5cf6' },
            { label: `★ ${concept.certificationPriority}/5`, color: '#f59e0b' },
            { label: `~${concept.estimatedTime}m`, color: darkMode ? '#64748b' : '#94a3b8' },
          ].map(({ label, color }) => (
            <span
              key={label}
              className="text-xs px-2.5 py-1 rounded-lg font-semibold capitalize"
              style={{ backgroundColor: color + '20', color }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Key insight */}
        <div className={`p-3 rounded-xl border-l-2 ${darkMode ? 'border-amber-500/60 bg-amber-950/20' : 'border-amber-400 bg-amber-50'}`}>
          <div className={`text-xs font-bold mb-1.5 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>💡 Key Insight</div>
          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{concept.insight}</p>
        </div>

        {/* Purpose */}
        <div>
          <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${textMuted}`}>Purpose</div>
          <p className={`text-xs leading-relaxed ${textMuted}`}>{concept.purpose}</p>
        </div>

        {/* Connected concepts */}
        {concept.relatedConcepts.length > 0 && (
          <div>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${textMuted}`}>
              Connections ({concept.relatedConcepts.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {concept.relatedConcepts.slice(0, 10).map((relId) => {
                const rel = conceptMap.get(relId);
                const relCat = rel ? categoryMap.get(rel.categoryId as CatKey) : null;
                return rel ? (
                  <button
                    key={relId}
                    onClick={() => onNavigateToConcept(rel)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: (relCat?.color ?? '#64748b') + '20', color: relCat?.color ?? '#64748b' }}
                  >
                    {rel.term}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${border}`}>
        <button
          onClick={onOpenFull}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-sm shadow-sky-500/25"
        >
          Open Full Concept <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.aside>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────

interface SidebarProps {
  filterCat: string | null;
  onSelect: (id: string | null) => void;
  darkMode: boolean;
}

function GraphSidebar({ filterCat, onSelect, darkMode }: SidebarProps) {
  const border = darkMode ? 'border-slate-700' : 'border-slate-200';
  const sideBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`w-52 shrink-0 flex flex-col border-r ${border} ${sideBg} overflow-hidden`}>
      {/* Header */}
      <div className={`px-3 pt-4 pb-2.5 border-b ${border}`}>
        <div className="flex items-center gap-2">
          <Network size={14} className="text-sky-500" />
          <span className={`text-xs font-bold tracking-widest uppercase ${textMuted}`}>Focus Topic</span>
        </div>
      </div>

      {/* "All" button */}
      <div className="px-2.5 pt-2.5 pb-1.5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !filterCat
              ? 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-lg shadow-sky-500/20'
              : darkMode
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="text-base">🗺️</span>
          <span>Overview</span>
          <span className={`ml-auto text-xs font-normal tabular-nums ${filterCat ? textMuted : 'text-white/70'}`}>
            {concepts.length}
          </span>
        </motion.button>
      </div>

      <div className={`mx-3 border-t ${border} mb-1`} />

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-2 space-y-0.5">
        {categories.map((cat) => {
          const isActive = filterCat === cat.id;
          const count = concepts.filter((c) => c.categoryId === cat.id).length;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                isActive ? '' : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
              }`}
              style={
                isActive
                  ? { backgroundColor: cat.color + '18', borderLeft: `3px solid ${cat.color}`, paddingLeft: 10 }
                  : {}
              }
            >
              <span className="text-sm leading-none shrink-0">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-semibold leading-snug truncate"
                  style={{ color: isActive ? cat.color : darkMode ? '#cbd5e1' : '#374151' }}
                >
                  {cat.name}
                </div>
                <div className="text-xs tabular-nums" style={{ fontSize: 10, color: darkMode ? '#475569' : '#9ca3af' }}>
                  {count} concepts
                </div>
              </div>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                  style={{ backgroundColor: cat.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className={`px-3 py-2.5 border-t ${border}`}>
        <p className={`text-xs leading-relaxed ${textMuted}`}>
          Select a topic → focused graph.{' '}
          Click nodes to inspect.
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function GraphPage() {
  const navigate = useNavigate();
  const { darkMode, addRecentlyViewed } = useAppStore();

  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const rfRef = useRef<{ fitView: (o?: object) => void } | null>(null);

  const activeCat: Category | undefined = filterCat
    ? categoryMap.get(filterCat as CatKey)
    : undefined;

  const handleSelectCategory = useCallback((id: string | null) => {
    setFilterCat(id);
    setSelectedConcept(null);
  }, []);

  const handleConceptSelect = useCallback((c: Concept | null) => {
    setSelectedConcept(c);
  }, []);

  const handleNavigateToConcept = useCallback(
    (rel: Concept) => {
      setSelectedConcept(rel);
    },
    [],
  );

  const handleOpenFull = useCallback(() => {
    if (!selectedConcept) return;
    addRecentlyViewed(selectedConcept.id);
    navigate(`/concept/${selectedConcept.id}`);
  }, [selectedConcept, addRecentlyViewed, navigate]);

  const sideBg = darkMode ? 'bg-slate-900' : 'bg-white';
  const border = darkMode ? 'border-slate-700' : 'border-slate-200';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex h-full overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* ── Left sidebar ── */}
      <GraphSidebar filterCat={filterCat} onSelect={handleSelectCategory} darkMode={darkMode} />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Breadcrumb / status bar */}
        <div className={`flex items-center gap-2 px-4 h-9 shrink-0 border-b text-xs ${sideBg} ${border} ${textMuted}`}>
          <button
            onClick={() => handleSelectCategory(null)}
            className={`flex items-center gap-1 transition-colors hover:text-sky-500 ${!filterCat ? 'text-sky-500 font-semibold' : ''}`}
          >
            Overview
          </button>
          {activeCat && (
            <>
              <span className={darkMode ? 'text-slate-700' : 'text-slate-300'}>/</span>
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: activeCat.color }}>
                {activeCat.icon} {activeCat.name}
              </span>
              <span className={darkMode ? 'text-slate-700' : 'text-slate-300'}>·</span>
              <span>
                {concepts.filter((c) => c.categoryId === filterCat).length} core concepts
              </span>
              <button
                onClick={() => handleSelectCategory(null)}
                className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md hover:text-rose-400 transition-colors`}
              >
                <ChevronLeft size={11} /> Back to overview
              </button>
            </>
          )}
          {!filterCat && (
            <span className="ml-auto">Click a category card to open its graph</span>
          )}
        </div>

        {/* Content area: grid OR graph */}
        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!filterCat ? (
              <CategoryOverview key="overview" onSelect={handleSelectCategory} darkMode={darkMode} />
            ) : (
              <motion.div
                key={filterCat}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="flex-1 relative"
              >
                {/* Focus mode badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 360, damping: 28 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl pointer-events-none select-none"
                  style={{
                    backgroundColor: activeCat?.color,
                    color: '#fff',
                    boxShadow: `0 4px 22px ${activeCat?.color}55`,
                  }}
                >
                  <Layers size={12} />
                  Focused: {activeCat?.name}
                </motion.div>

                <GraphCanvas
                  catId={filterCat}
                  darkMode={darkMode}
                  onConceptSelect={handleConceptSelect}
                  selectedConceptId={selectedConcept?.id ?? null}
                  rfRef={rfRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right detail panel ── */}
      <AnimatePresence>
        {selectedConcept && (
          <DetailPanel
            key={selectedConcept.id}
            concept={selectedConcept}
            darkMode={darkMode}
            onClose={() => {
              setSelectedConcept(null);
              // Reset node highlight — GraphCanvas will reconstruct via its own resetFocus
              // Trigger a filter re-apply by no-op state update
              setFilterCat((prev) => prev);
            }}
            onNavigateToConcept={handleNavigateToConcept}
            onOpenFull={handleOpenFull}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
