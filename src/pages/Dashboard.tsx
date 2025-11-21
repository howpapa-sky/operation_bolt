import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { Target, Flame, AlertCircle, Calendar, BarChart3, PieChart as PieChartIcon, Plus, CheckSquare } from 'lucide-react';
import { ProjectFormModal } from '../components/ProjectFormModal';

interface DashboardStats {
  totalTasks: number;
  focusTasks: number;
  urgentTasks: number;
  overdueTasks: number;
  totalProjects: number;
  inProgressProjects: number;
}

interface ProjectTypeCount {
  type: string;
  count: number;
}

interface ProjectStatusCount {
  status: string;
  count: number;
}

interface Props {
  onProjectClick: (projectId: string) => void;
  onNavigateToProjects: (filter?: string) => void;
}

export function Dashboard({ onProjectClick, onNavigateToProjects }: Props) {
  const { canManageProjects } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    focusTasks: 0,
    urgentTasks: 0,
    overdueTasks: 0,
    totalProjects: 0,
    inProgressProjects: 0,
  });
  const [projectTypes, setProjectTypes] = useState<ProjectTypeCount[]>([]);
  const [projectStatuses, setProjectStatuses] = useState<ProjectStatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasksResult, projectsResult] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('projects').select('*'),
      ]);

      if (tasksResult.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setStats({
          totalTasks: tasksResult.data.length,
          focusTasks: tasksResult.data.filter((t) => t.priority === '높음' || t.priority === '긴급').length,
          urgentTasks: tasksResult.data.filter((t) => t.priority === '긴급').length,
          overdueTasks: tasksResult.data.filter((t) => {
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date);
            return dueDate < today && t.status !== '완료';
          }).length,
        });
      }

      if (projectsResult.data) {
        const inProgressCount = projectsResult.data.filter((p) => p.status === '진행 중').length;

        setStats((prev) => ({
          ...prev,
          totalProjects: projectsResult.data.length,
          inProgressProjects: inProgressCount,
        }));

        const typeCounts = projectsResult.data.reduce((acc, project) => {
          const type = project.project_type || '기타';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setProjectTypes(
          Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
        );

        const statusCounts = projectsResult.data.reduce((acc, project) => {
          const status = project.status || '대기';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setProjectStatuses(
          Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
        );
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행 중':
        return 'bg-blue-500';
      case '완료':
        return 'bg-green-500';
      case '보류':
        return 'bg-gray-500';
      default:
        return 'bg-slate-300';
    }
  };

  const totalProjects = projectStatuses.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
        {canManageProjects && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>프로젝트 등록</span>
          </button>
        )}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadDashboardData();
        }}
      />

      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">프로젝트 현황</h2>
          <p className="text-slate-600 text-sm">전체 프로젝트 진행 상태를 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => onNavigateToProjects('all')}
            className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all hover:border-slate-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-700 text-sm font-semibold">전체 프로젝트</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-900">{stats.totalProjects}</div>
          </button>

          <button
            onClick={() => onNavigateToProjects('active')}
            className="bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all hover:border-blue-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-700 text-sm font-semibold">진행 중</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-600">{stats.inProgressProjects}</div>
          </button>

          <button
            onClick={() => onNavigateToProjects('completed')}
            className="bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all hover:border-green-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-700 text-sm font-semibold">완료</span>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare size={16} className="text-green-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-green-600">{projectStatuses.find(s => s.status === '완료')?.count || 0}</div>
          </button>

          <button
            onClick={() => onNavigateToProjects('pending')}
            className="bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-200 p-6 hover:shadow-lg transition-all hover:border-amber-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-amber-700 text-sm font-semibold">대기</span>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-amber-600">{projectStatuses.find(s => s.status === '대기')?.count || 0}</div>
          </button>
        </div>

        <div className="border-t border-slate-200 pt-8 mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">나에게 할당된 작업</h2>
            <p className="text-slate-600 text-sm">현재 진행 중인 작업을 확인하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm font-medium">전체 작업</span>
                <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalTasks}<span className="text-lg text-slate-500 ml-1">건</span></div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 text-sm font-medium">Focus 목표</span>
                <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center">
                  <Target size={14} className="text-green-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-700">{stats.focusTasks}<span className="text-lg text-green-500 ml-1">건</span></div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 text-sm font-medium">긴급/중요</span>
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <Flame size={14} className="text-red-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-red-700">{stats.urgentTasks}<span className="text-lg text-red-500 ml-1">건</span></div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 text-sm font-medium">마감 임박</span>
                <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  <Calendar size={14} className="text-orange-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-700">{stats.overdueTasks}<span className="text-lg text-orange-500 ml-1">건</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
