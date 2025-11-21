import { useState, useEffect } from 'react';
import { useAuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { SampleDetail } from './pages/SampleDetail';
import { MyTasks } from './pages/MyTasks';
import { SampleAnalytics } from './pages/SampleAnalytics';
import { UserManagement } from './pages/UserManagement';
import EvaluationItems from './pages/EvaluationItems';
import { Sidebar } from './components/Sidebar';

type Page = 'dashboard' | 'projects' | 'project-detail' | 'sample-detail' | 'my-tasks' | 'sample-analytics' | 'user-management' | 'evaluation-items';

function App() {
  const { user, loading } = useAuthContext();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const [sampleCategory, setSampleCategory] = useState<string | undefined>(undefined);
  const [analyticsCategory, setAnalyticsCategory] = useState<string>('');

  useEffect(() => {
    console.log('[App] Loading state:', loading);
    console.log('[App] User state:', user ? 'logged in' : 'not logged in');
  }, [loading, user]);

  useEffect(() => {
    if (loading) {
      console.log('[App] Currently loading...');
    }
  }, [loading]);

  if (loading) {
    console.log('[App] Rendering loading screen');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 text-lg mb-2">로딩 중...</div>
          <div className="text-slate-400 text-sm">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-detail');
  };

  const handleNavigateToProjects = (filter?: string) => {
    setProjectFilter(filter);
    setSampleCategory(undefined);
    setCurrentPage('projects');
  };

  const handleSampleCategoryClick = (category: string) => {
    setAnalyticsCategory(category);
    setCurrentPage('sample-analytics');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onProjectClick={handleProjectClick} onNavigateToProjects={handleNavigateToProjects} />;
      case 'projects':
        return <Projects onProjectClick={handleProjectClick} initialFilter={projectFilter} sampleCategory={sampleCategory} />;
      case 'project-detail':
        return selectedProjectId ? (
          <ProjectDetail projectId={selectedProjectId} onBack={() => setCurrentPage('projects')} />
        ) : null;
      case 'sample-detail':
        return selectedProjectId ? (
          <SampleDetail projectId={selectedProjectId} onBack={() => setCurrentPage('projects')} />
        ) : null;
      case 'my-tasks':
        return <MyTasks />;
      case 'sample-analytics':
        return analyticsCategory ? (
          <SampleAnalytics category={analyticsCategory} onBack={() => setCurrentPage('dashboard')} />
        ) : null;
      case 'user-management':
        return <UserManagement />;
      case 'evaluation-items':
        return <EvaluationItems />;
      default:
        return <Dashboard onProjectClick={handleProjectClick} onNavigateToProjects={handleNavigateToProjects} />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onSampleCategoryClick={handleSampleCategoryClick}
        userName={user?.full_name || '하우파파'}
        userRole={user?.role || 'viewer'}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
