import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string;
  projects: {
    name: string;
  };
}

export function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .eq('assignee_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks((data as Task[]) || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterTasks = (tasks: Task[]) => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return tasks.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate.toDateString() === today.toDateString();
        });
      case 'week':
        return tasks.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate <= weekFromNow;
        });
      case 'overdue':
        return tasks.filter((task) => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate < today && task.status !== '완료';
        });
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(tasks);
  const tasksByStatus = {
    '할 일': filteredTasks.filter((t) => t.status === '할 일'),
    '진행 중': filteredTasks.filter((t) => t.status === '진행 중'),
    '검토': filteredTasks.filter((t) => t.status === '검토'),
    '완료': filteredTasks.filter((t) => t.status === '완료'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행 중':
        return 'bg-blue-100 text-blue-700';
      case '완료':
        return 'bg-green-100 text-green-700';
      case '검토':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
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

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">내 작업</h2>
        <p className="text-slate-600">전체 {tasks.length}개의 작업</p>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          오늘
        </button>
        <button
          onClick={() => setFilter('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          이번 주
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
          }`}
        >
          지연
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <div key={status} className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">{status}</h4>
              <span className="text-sm text-slate-500">{statusTasks.length}</span>
            </div>
            <div className="space-y-3">
              {statusTasks.map((task) => {
                const daysUntil = getDaysUntilDue(task.due_date);
                const isOverdue = daysUntil !== null && daysUntil < 0 && task.status !== '완료';

                return (
                  <div
                    key={task.id}
                    className={`bg-white p-4 rounded-lg border ${
                      isOverdue ? 'border-red-300' : 'border-slate-200'
                    }`}
                  >
                    <div className="font-medium text-slate-900 mb-2">{task.title}</div>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="text-xs text-slate-500 mb-2">{task.projects.name}</div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className={`font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      {task.due_date && (
                        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                          <span>
                            {daysUntil !== null &&
                              (daysUntil === 0
                                ? '오늘'
                                : daysUntil > 0
                                ? `D-${daysUntil}`
                                : `D+${Math.abs(daysUntil)}`)}
                          </span>
                        </div>
                      )}
                    </div>
                    {status !== '완료' && (
                      <button
                        onClick={() => {
                          const nextStatus =
                            status === '할 일' ? '진행 중' : status === '진행 중' ? '검토' : '완료';
                          updateTaskStatus(task.id, nextStatus);
                        }}
                        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle size={14} />
                        <span>다음 단계로</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
