import { LayoutDashboard, FolderKanban, CheckSquare, Clipboard, FileText, PieChart, Settings, Shield, ChevronDown, LogOut, Users, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

type Page = 'dashboard' | 'projects' | 'my-tasks' | 'project-detail' | 'user-management' | 'evaluation-items';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onSampleCategoryClick?: (category: string) => void;
  userName?: string;
  userRole?: string;
}

interface ProjectStats {
  total: number;
  completed: number;
  inProgress: number;
  delayed: number;
}

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'manager':
      return 'Manager';
    case 'viewer':
      return 'Viewer';
    default:
      return role;
  }
};

export function Sidebar({ currentPage, onPageChange, onSampleCategoryClick, userName = '하우파파', userRole = 'viewer' }: SidebarProps) {
  const { signOut, canManageUsers } = useAuthContext();
  const canManageEvaluations = ['manager', 'admin', 'super_admin'].includes(userRole);
  const [dashboardExpanded, setDashboardExpanded] = useState(true);
  const [samplesExpanded, setSamplesExpanded] = useState(false);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    delayed: 0,
  });

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  useEffect(() => {
    loadProjectStats();
  }, []);

  const loadProjectStats = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('status, due_date');

      if (error) throw error;
      if (!data) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        total: data.length,
        completed: data.filter((p) => p.status === '완료').length,
        inProgress: data.filter((p) => p.status === '진행 중').length,
        delayed: data.filter((p) => {
          if (!p.due_date || p.status === '완료') return false;
          const dueDate = new Date(p.due_date);
          return dueDate < today;
        }).length,
      };

      setProjectStats(stats);
    } catch (error) {
      console.error('Error loading project stats:', error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <button
          onClick={() => onPageChange('dashboard')}
          className="w-full text-left hover:opacity-80 transition-opacity mb-4"
        >
          <img src="/howpapa.png" alt="HOWPAPA" className="h-8 mb-2" />
          <p className="text-sm text-slate-600">프로덕트 관리</p>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            HP
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900">{userName}</div>
            <div className="text-xs text-slate-500">{getRoleDisplayName(userRole)}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <div>
          <button
            onClick={() => setDashboardExpanded(!dashboardExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <LayoutDashboard size={18} />
              <span className="font-medium">대시보드</span>
            </div>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${dashboardExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {dashboardExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              <button
                onClick={() => onPageChange('projects')}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>전체 프로젝트</span>
                <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                  {projectStats.total}
                </span>
              </button>
              <button
                onClick={() => onPageChange('projects')}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>완료된 프로젝트</span>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  {projectStats.completed}
                </span>
              </button>
              <button
                onClick={() => onPageChange('projects')}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>진행 프로젝트</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {projectStats.inProgress}
                </span>
              </button>
              <button
                onClick={() => onPageChange('projects')}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between"
              >
                <span>지연 프로젝트</span>
                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  {projectStats.delayed}
                </span>
              </button>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setSamplesExpanded(!samplesExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Clipboard size={18} />
              <span className="font-medium">샘플 관리</span>
            </div>
            <ChevronDown
              size={16}
              className={`transform transition-transform ${samplesExpanded ? 'rotate-180' : ''}`}
            />
          </button>
          {samplesExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              <button
                onClick={() => {
                  onPageChange('projects');
                  onSampleCategoryClick?.('크림');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                크림
              </button>
              <button
                onClick={() => {
                  onPageChange('projects');
                  onSampleCategoryClick?.('토너패드');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                토너패드
              </button>
              <button
                onClick={() => {
                  onPageChange('projects');
                  onSampleCategoryClick?.('앰플');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                앰플
              </button>
              <button
                onClick={() => {
                  onPageChange('projects');
                  onSampleCategoryClick?.('로션');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                로션
              </button>
              <button
                onClick={() => {
                  onPageChange('projects');
                  onSampleCategoryClick?.('미스트');
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                미스트
              </button>
            </div>
          )}
        </div>

        <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
          <FileText size={18} />
          <span className="font-medium">계약 정보</span>
        </button>

        {canManageUsers && (
          <button
            onClick={() => onPageChange('user-management')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentPage === 'user-management'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            <span className="font-medium">사용자 관리</span>
          </button>
        )}

        {canManageEvaluations && (
          <button
            onClick={() => onPageChange('evaluation-items')}
            className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              currentPage === 'evaluation-items'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <List size={18} />
            <span className="font-medium">평가 항목 관리</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Settings size={18} />
          <span>설정</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
