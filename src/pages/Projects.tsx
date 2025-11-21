import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';
import { ProjectFormModal } from '../components/ProjectFormModal';

interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  created_at: string;
}

interface Props {
  onProjectClick: (projectId: string) => void;
  initialFilter?: string;
  sampleCategory?: string;
}

export function Projects({ onProjectClick, initialFilter, sampleCategory }: Props) {
  const { canManageProjects } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>(sampleCategory || 'all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (initialFilter) {
      const filterMap: Record<string, string> = {
        'all': 'all',
        'active': '진행 중',
        'completed': '완료',
        'pending': '대기'
      };
      setStatusFilter(filterMap[initialFilter] || 'all');
    }
  }, [initialFilter]);

  useEffect(() => {
    if (sampleCategory) {
      setCategoryFilter(sampleCategory);
    }
  }, [sampleCategory]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (project as any).project_subtype === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행 중':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '완료':
        return 'bg-green-100 text-green-700 border-green-200';
      case '보류':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '긴급':
        return 'text-red-600';
      case '높음':
        return 'text-orange-600';
      case '보통':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '샘플링':
        return 'bg-purple-100 text-purple-700';
      case '상세페이지':
        return 'bg-blue-100 text-blue-700';
      case '신제품':
        return 'bg-green-100 text-green-700';
      case '인플루언서':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">프로젝트</h2>
          <p className="text-slate-600">전체 {projects.length}개의 프로젝트</p>
        </div>
        {canManageProjects && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>프로젝트 등록</span>
          </button>
        )}
      </div>

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadProjects}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 카테고리</option>
            <option value="크림">크림</option>
            <option value="토너패드">토너패드</option>
            <option value="앰플">앰플</option>
            <option value="로션">로션</option>
            <option value="미스트">미스트</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="대기">대기</option>
            <option value="진행 중">진행 중</option>
            <option value="완료">완료</option>
            <option value="보류">보류</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectClick(project.id)}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(project.project_type)}`}>
                {project.project_type}
              </span>
              <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{project.name}</h3>
            {project.description && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {project.due_date && (
                <span className="text-xs text-slate-500">마감: {project.due_date}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
