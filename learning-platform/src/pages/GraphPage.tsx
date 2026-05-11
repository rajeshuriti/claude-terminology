import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  type Node, type Edge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, type NodeProps,
  Handle, Position, BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { concepts } from '@/data/concepts';
import { categoryMap, categories } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import type { Concept } from '@/types';

// Custom node component
function ConceptNode({ data }: NodeProps) {
  const { darkMode } = useAppStore();
  return (
    <div
      className={`px-3 py-2 rounded-xl border-2 cursor-pointer transition-shadow hover:shadow-lg min-w-[120px] max-w-[160px] text-center ${
        data.selected
          ? 'border-sky-400 shadow-md shadow-sky-400/30'
          : darkMode ? 'border-slate-600' : 'border-slate-200'
      }`}
      style={{
        backgroundColor: data.selected ? data.color + '30' : (darkMode ? '#1e293b' : '#fff'),
        borderColor: data.selected ? data.color : (darkMode ? '#334155' : '#e2e8f0'),
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 8, height: 8 }} />
      <div className="text-sm font-medium leading-tight" style={{ color: data.color }}>{data.icon}</div>
      <div className={`text-xs font-semibold mt-0.5 leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
        {data.label}
      </div>
      <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{data.category}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { concept: ConceptNode };

// Generate a simple force-directed-ish layout
function generateLayout(conceptList: Concept[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedEdges = new Set<string>();

  // Group by category for layout
  const byCategory = new Map<string, Concept[]>();
  conceptList.forEach((c) => {
    const arr = byCategory.get(c.categoryId) ?? [];
    arr.push(c);
    byCategory.set(c.categoryId, arr);
  });

  const catList = [...byCategory.entries()];
  const angleStep = (2 * Math.PI) / catList.length;
  const radius = 400;

  catList.forEach(([catId, cats], catIdx) => {
    const catData = categoryMap.get(catId as Parameters<typeof categoryMap.get>[0]);
    const catAngle = catIdx * angleStep;
    const catCenterX = Math.cos(catAngle) * radius;
    const catCenterY = Math.sin(catAngle) * radius;

    cats.forEach((concept, i) => {
      const innerAngle = (i / Math.max(cats.length, 1)) * 2 * Math.PI;
      const innerR = 80;
      const x = catCenterX + Math.cos(innerAngle) * innerR;
      const y = catCenterY + Math.sin(innerAngle) * innerR;

      nodes.push({
        id: concept.id,
        type: 'concept',
        position: { x: x + 600, y: y + 400 },
        data: {
          label: concept.term.length > 18 ? concept.term.slice(0, 16) + '…' : concept.term,
          fullLabel: concept.term,
          category: catData?.name.split(' ')[0] ?? '',
          color: catData?.color ?? '#64748b',
          icon: catData?.icon ?? '📌',
          conceptId: concept.id,
          selected: false,
        },
      });

      // Add edges for related concepts
      concept.relatedConcepts.slice(0, 3).forEach((relId) => {
        const edgeKey = [concept.id, relId].sort().join('--');
        if (!processedEdges.has(edgeKey)) {
          processedEdges.add(edgeKey);
          edges.push({
            id: edgeKey,
            source: concept.id,
            target: relId,
            style: { stroke: catData?.color ?? '#94a3b8', strokeWidth: 1.5, opacity: 0.5 },
            type: 'smoothstep',
          });
        }
      });
    });
  });

  return { nodes, edges };
}

export function GraphPage() {
  const navigate = useNavigate();
  const { darkMode, addRecentlyViewed } = useAppStore();
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filteredConcepts = useMemo(
    () => filterCat ? concepts.filter((c) => c.categoryId === filterCat) : concepts,
    [filterCat]
  );

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => generateLayout(filteredConcepts),
    [filteredConcepts]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const concept = concepts.find((c) => c.id === node.id);
    setSelectedConcept(concept ?? null);
    // Highlight related
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.id === node.id || (concept?.relatedConcepts.includes(n.id) ?? false),
        },
      }))
    );
  }, [setNodes]);

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Toolbar */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <ZoomIn size={16} className={textMuted} />
        <span className={`text-sm font-medium ${textPrimary}`}>Concept Relationship Graph</span>
        <span className={`text-xs ${textMuted}`}>· {filteredConcepts.length} concepts, click a node to explore</span>
        <div className="ml-auto flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCat(null)}
            className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${!filterCat ? 'bg-sky-500 text-white' : darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors`}
              style={filterCat === cat.id ? { backgroundColor: cat.color, color: 'white' } : {
                backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                color: darkMode ? '#94a3b8' : '#64748b',
              }}
            >
              {cat.icon} {cat.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph */}
        <div className="flex-1 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={darkMode ? '#334155' : '#e2e8f0'}
            />
            <Controls style={{ background: darkMode ? '#1e293b' : '#fff', border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0') }} />
            <MiniMap
              nodeColor={(node) => node.data.color ?? '#64748b'}
              style={{ background: darkMode ? '#0f172a' : '#f8fafc' }}
            />
          </ReactFlow>
        </div>

        {/* Detail panel */}
        {selectedConcept && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={`w-72 border-l overflow-y-auto shrink-0 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-sm font-bold ${textPrimary}`}>{selectedConcept.term}</h3>
                  <div className={`text-xs ${textMuted}`}>{selectedConcept.category}</div>
                </div>
                <button
                  onClick={() => { setSelectedConcept(null); setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, selected: false } }))); }}
                  className={`p-1 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <X size={14} className={textMuted} />
                </button>
              </div>

              <p className={`text-xs leading-relaxed mb-3 ${textMuted}`}>{selectedConcept.description}</p>

              <div className={`p-3 rounded-xl mb-3 ${darkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
                <div className={`text-xs font-semibold mb-1 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>Key Insight</div>
                <div className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{selectedConcept.insight}</div>
              </div>

              {selectedConcept.relatedConcepts.length > 0 && (
                <div>
                  <div className={`text-xs font-semibold mb-2 ${textMuted}`}>Related ({selectedConcept.relatedConcepts.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedConcept.relatedConcepts.slice(0, 8).map((relId) => {
                      const rel = concepts.find((c) => c.id === relId);
                      return rel ? (
                        <button
                          key={relId}
                          onClick={() => {
                            const relConcept = concepts.find((c) => c.id === relId);
                            setSelectedConcept(relConcept ?? null);
                          }}
                          className={`text-xs px-2 py-0.5 rounded-md transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          {rel.term}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => { addRecentlyViewed(selectedConcept.id); navigate(`/concept/${selectedConcept.id}`); }}
                className="mt-4 w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
              >
                View Full Concept →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
