import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { ArrowLeft, Plus, CheckCircle, Clock, MessageSquare } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: string;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  users: {
    full_name: string;
  };
}

interface Props {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: Props) {
  const { user, canManageTasks } = useAuthContext();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: '할 일',
    priority: '보통',
    due_date: '',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const [projectResult, tasksResult, commentsResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase
          .from('comments')
          .select('*, users(full_name)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
      ]);

      if (projectResult.data) setProject(projectResult.data);
      if (tasksResult.data) setTasks(tasksResult.data);
      if (commentsResult.data) setComments(commentsResult.data as Comment[]);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert([
        {
          ...newTask,
          project_id: projectId,
        },
      ]);

      if (error) throw error;

      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        status: '할 일',
        priority: '보통',
        due_date: '',
      });
      loadProjectData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase.from('comments').insert([
        {
          content: newComment,
          user_id: user.id,
          project_id: projectId,
        },
      ]);

      if (error) throw error;

      setNewComment('');
      loadProjectData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      loadProjectData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행 중':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case '완료':
        return 'bg-green-100 text-green-700 border-green-200';
      case '보류':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case '검토':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-600">프로젝트를 찾을 수 없습니다</div>;
  }

  const tasksByStatus = {
    '할 일': tasks.filter((t) => t.status === '할 일'),
    '진행 중': tasks.filter((t) => t.status === '진행 중'),
    '검토': tasks.filter((t) => t.status === '검토'),
    '완료': tasks.filter((t) => t.status === '완료'),
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>프로젝트 목록으로</span>
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h2>
            {project.description && <p className="text-slate-600">{project.description}</p>}
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}
          >
            {project.status}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-slate-500 mb-1">타입</div>
            <div className="font-medium text-slate-900">{project.project_type}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">우선순위</div>
            <div className="font-medium text-slate-900">{project.priority}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">시작일</div>
            <div className="font-medium text-slate-900">{project.start_date || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">마감일</div>
            <div className="font-medium text-slate-900">{project.due_date || '-'}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-900">작업</h3>
        {canManageTasks && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>작업 추가</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">{status}</h4>
              <span className="text-sm text-slate-500">{statusTasks.length}</span>
            </div>
            <div className="space-y-3">
              {statusTasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg border border-slate-200">
                  <div className="font-medium text-slate-900 mb-2">{task.title}</div>
                  {task.description && (
                    <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{task.priority}</span>
                    {task.due_date && (
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{task.due_date}</span>
                      </span>
                    )}
                  </div>
                  {status !== '완료' && (
                    <button
                      onClick={() => {
                        const nextStatus =
                          status === '할 일' ? '진행 중' : status === '진행 중' ? '검토' : '완료';
                        updateTaskStatus(task.id, nextStatus);
                      }}
                      className="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle size={14} />
                      <span>다음 단계로</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare size={24} className="text-slate-900" />
          <h3 className="text-xl font-bold text-slate-900">댓글</h3>
          <span className="text-sm text-slate-500">({comments.length})</span>
        </div>

        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows={3}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            댓글 작성
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">{comment.users.full_name}</span>
                <span className="text-sm text-slate-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">새 작업 추가</h3>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">작업 제목</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">설명</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">우선순위</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                    <option value="긴급">긴급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">마감일</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
