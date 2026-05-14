import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExplorerPage } from '@/pages/ExplorerPage';
import { ConceptDetailPage } from '@/pages/ConceptDetailPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { GraphPage } from '@/pages/GraphPage';
import { QuizPage } from '@/pages/QuizPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { ComparePage } from '@/pages/ComparePage';
import { BookmarksPage } from '@/pages/BookmarksPage';
import { ClaudeInternalsPage } from '@/pages/ClaudeInternalsPage';
import { SlashCommandsStudioPage } from '@/pages/SlashCommandsStudioPage';
import { CertificationPracticePage } from '@/pages/CertificationPracticePage';
import { StudyMaterialsPage } from '@/pages/StudyMaterialsPage';
import { ConnectorsPage } from '@/pages/ConnectorsPage';
import { ArchitectureExplorerPage } from '@/pages/ArchitectureExplorerPage';
import { ClaudeDesktopStudioPage } from '@/pages/ClaudeDesktopStudioPage';
import { MCPMasteryPage } from '@/pages/MCPMasteryPage';
import { MCPEcosystemPage } from '@/pages/MCPEcosystemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/studio" element={<ClaudeDesktopStudioPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/explorer" element={<ExplorerPage />} />
          <Route path="/concept/:id" element={<ConceptDetailPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/internals" element={<ClaudeInternalsPage />} />
          <Route path="/commands" element={<SlashCommandsStudioPage />} />
          <Route path="/certification" element={<CertificationPracticePage />} />
          <Route path="/study" element={<StudyMaterialsPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/architecture" element={<ArchitectureExplorerPage />} />
          <Route path="/mcp-mastery" element={<MCPMasteryPage />} />
          <Route path="/mcp-ecosystem" element={<MCPEcosystemPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
