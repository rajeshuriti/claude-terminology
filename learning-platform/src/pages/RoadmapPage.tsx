import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Clock, ChevronDown, ChevronUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { roadmaps } from '@/data/roadmaps';
import { conceptMap } from '@/data/concepts';
import { useAppStore } from '@/store/appStore';

export function RoadmapPage() {
  const navigate = useNavigate();
  const { darkMode, completedConcepts, addRecentlyViewed } = useAppStore();
  const [selectedRoadmap, setSelectedRoadmap] = useState(roadmaps[0].id);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const roadmap = roadmaps.find((r) => r.id === selectedRoadmap) ?? roadmaps[0];

  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100';

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const roadmapProgress = (rdm: typeof roadmaps[0]) => {
    const allConcepts = rdm.nodes.flatMap((n) => n.concepts);
    const done = allConcepts.filter((id) => completedConcepts.includes(id)).length;
    return allConcepts.length > 0 ? Math.round((done / allConcepts.length) * 100) : 0;
  };

  const nodeProgress = (nodeId: string) => {
    const node = roadmap.nodes.find((n) => n.id === nodeId);
    if (!node) return 0;
    const done = node.concepts.filter((id) => completedConcepts.includes(id)).length;
    return node.concepts.length > 0 ? Math.round((done / node.concepts.length) * 100) : 0;
  };

  return (
    <div className={`min-h-full ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Map size={20} className="text-sky-500" />
          <h1 className={`text-xl font-bold ${textPrimary}`}>Study Roadmaps</h1>
        </div>

        {/* Roadmap selector */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {roadmaps.map((rdm) => {
            const prog = roadmapProgress(rdm);
            const isSelected = rdm.id === selectedRoadmap;
            return (
              <motion.button
                key={rdm.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedRoadmap(rdm.id)}
                className={`shrink-0 flex flex-col p-4 rounded-2xl border-2 text-left transition-all min-w-[200px] ${
                  isSelected
                    ? `border-opacity-100 shadow-md`
                    : darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                }`}
                style={isSelected ? { borderColor: rdm.color, backgroundColor: rdm.color + '15' } : {}}
              >
                <div className="text-2xl mb-2">{rdm.icon}</div>
                <div className={`text-sm font-bold ${textPrimary}`}>{rdm.title}</div>
                <div className={`text-xs mt-0.5 ${textMuted}`}>{rdm.estimatedWeeks} weeks</div>
                <div className={`flex items-center gap-2 mt-2`}>
                  <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${prog}%`, backgroundColor: rdm.color }} />
                  </div>
                  <span className={`text-xs ${textMuted}`}>{prog}%</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected roadmap detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRoadmap}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Roadmap header */}
            <div className={`rounded-2xl border p-5 mb-4 ${cardBg}`} style={{ borderLeftWidth: 4, borderLeftColor: roadmap.color }}>
              <div className="flex items-start gap-4">
                <div className="text-3xl">{roadmap.icon}</div>
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${textPrimary}`}>{roadmap.title}</h2>
                  <p className={`text-sm mt-0.5 ${textMuted}`}>{roadmap.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className={`flex items-center gap-1.5 text-sm ${textMuted}`}>
                      <Clock size={14} />
                      {roadmap.estimatedWeeks} weeks
                    </div>
                    <div className={`text-sm capitalize px-2 py-0.5 rounded-full text-xs font-medium ${
                      roadmap.difficulty === 'beginner' ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                      roadmap.difficulty === 'intermediate' ? (darkMode ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-100 text-sky-700') :
                      (darkMode ? 'bg-violet-900/30 text-violet-400' : 'bg-violet-100 text-violet-700')
                    }`}>
                      {roadmap.difficulty}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Nodes (weeks) */}
            <div className="space-y-3">
              {roadmap.nodes.map((node, nodeIdx) => {
                const isExpanded = expandedNodes.has(node.id);
                const progress = nodeProgress(node.id);
                const allDone = progress === 100;

                return (
                  <div key={node.id} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 z-10`}
                        style={{ backgroundColor: allDone ? '#10b981' : roadmap.color }}
                      >
                        {allDone ? <CheckCircle2 size={16} /> : node.week}
                      </div>
                      {nodeIdx < roadmap.nodes.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} style={{ minHeight: 24 }} />
                      )}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 rounded-2xl border mb-2 overflow-hidden ${cardBg} ${allDone ? (darkMode ? 'border-emerald-700/40' : 'border-emerald-200') : ''}`}>
                      <button
                        onClick={() => toggleNode(node.id)}
                        className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${darkMode ? 'hover:bg-slate-750' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold ${textPrimary}`}>{node.label}</div>
                          <div className={`text-xs mt-0.5 ${textMuted}`}>{node.description}</div>
                          <div className={`flex items-center gap-2 mt-2`}>
                            <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: roadmap.color }} />
                            </div>
                            <span className={`text-xs ${textMuted}`}>{progress}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs ${textMuted}`}>{node.concepts.length} concepts</span>
                          {isExpanded ? <ChevronUp size={16} className={textMuted} /> : <ChevronDown size={16} className={textMuted} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`px-4 pb-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {node.concepts.map((conceptId) => {
                                  const concept = conceptMap.get(conceptId);
                                  if (!concept) return null;
                                  const isDone = completedConcepts.includes(conceptId);
                                  return (
                                    <button
                                      key={conceptId}
                                      onClick={() => { addRecentlyViewed(conceptId); navigate(`/concept/${conceptId}`); }}
                                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                                    >
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                        {isDone ? <CheckCircle2 size={11} className="text-white" /> : <span className={`text-xs ${textMuted}`}>·</span>}
                                      </div>
                                      <span className={`text-xs font-medium ${isDone ? textMuted : textPrimary}`}>{concept.term}</span>
                                      <ArrowRight size={10} className={`ml-auto ${textMuted}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
