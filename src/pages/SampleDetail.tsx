import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, FileText, MessageSquare, ClipboardList, Send } from 'lucide-react';

interface Props {
  projectId: string;
  onBack: () => void;
}

interface Project {
  id: string;
  name: string;
  project_subtype: string;
  manufacturer: string;
  sample_round: string;
  lab_number: string | null;
  sampling_start_date: string | null;
  sampling_notes: string | null;
  final_feedback_to_manufacturer: string | null;
  sample_status: string;
  evaluation_criteria: Record<string, number>;
}

interface EvaluationItem {
  id: string;
  product_category: string;
  item_name: string;
  description: string | null;
  display_order: number;
}

interface EvaluatorFeedback {
  id: string;
  evaluator_name: string;
  criterion_name: string;
  feedback: string;
  score: number;
  created_at: string;
}

export function SampleDetail({ projectId, onBack }: Props) {
  const { } = useAuthContext();
  const [project, setProject] = useState<Project | null>(null);
  const [evaluationItems, setEvaluationItems] = useState<EvaluationItem[]>([]);
  const [evaluatorFeedbacks, setEvaluatorFeedbacks] = useState<EvaluatorFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    lab_number: '',
    sampling_start_date: '',
    sampling_notes: '',
    final_feedback_to_manufacturer: '',
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectResult, feedbackResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).maybeSingle(),
        supabase
          .from('evaluator_feedback')
          .select('*')
          .eq('project_id', projectId)
          .order('criterion_name', { ascending: true }),
      ]);

      if (projectResult.data) {
        setProject(projectResult.data);
        setFormData({
          lab_number: projectResult.data.lab_number || '',
          sampling_start_date: projectResult.data.sampling_start_date || '',
          sampling_notes: projectResult.data.sampling_notes || '',
          final_feedback_to_manufacturer: projectResult.data.final_feedback_to_manufacturer || '',
        });

        if (projectResult.data.project_subtype) {
          const itemsResult = await supabase
            .from('evaluation_items')
            .select('*')
            .eq('product_category', projectResult.data.project_subtype)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (itemsResult.data) {
            setEvaluationItems(itemsResult.data);
          }
        }
      }

      if (feedbackResult.data) {
        setEvaluatorFeedbacks(feedbackResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          lab_number: formData.lab_number || null,
          sampling_start_date: formData.sampling_start_date || null,
          sampling_notes: formData.sampling_notes || null,
          final_feedback_to_manufacturer: formData.final_feedback_to_manufacturer || null,
        })
        .eq('id', projectId);

      if (error) throw error;

      alert('저장되었습니다');
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('저장 중 오류가 발생했습니다');
    } finally {
      setSaving(false);
    }
  };

  const groupFeedbackByCriterion = () => {
    const grouped: Record<string, EvaluatorFeedback[]> = {};
    evaluatorFeedbacks.forEach((feedback) => {
      if (!grouped[feedback.criterion_name]) {
        grouped[feedback.criterion_name] = [];
      }
      grouped[feedback.criterion_name].push(feedback);
    });
    return grouped;
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-600">프로젝트를 찾을 수 없습니다</div>;
  }

  const feedbackByCriterion = groupFeedbackByCriterion();

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>뒤로 가기</span>
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {project.project_subtype}
              </span>
              <span>제조사: {project.manufacturer || '-'}</span>
              <span>{project.sample_round ? `${project.sample_round}회차` : '-'}</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
            {project.sample_status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              샘플링 시작 날짜
            </label>
            <input
              type="date"
              value={formData.sampling_start_date}
              onChange={(e) => setFormData({ ...formData, sampling_start_date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Lab Number
            </label>
            <input
              type="text"
              value={formData.lab_number}
              onChange={(e) => setFormData({ ...formData, lab_number: e.target.value })}
              placeholder="예: LAB-2024-001"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <MessageSquare size={16} className="inline mr-2" />
            비고 (특이사항)
          </label>
          <textarea
            value={formData.sampling_notes}
            onChange={(e) => setFormData({ ...formData, sampling_notes: e.target.value })}
            placeholder="샘플링 관련 특이사항이나 지연 사유 등을 입력하세요"
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '기본 정보 저장'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MessageSquare size={24} className="text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">평가자별 피드백</h2>
            </div>

            {evaluationItems.length === 0 ? (
              <p className="text-slate-500 text-center py-8">평가 항목이 없습니다</p>
            ) : (
              <div className="space-y-6">
                {evaluationItems.map((item) => (
                  <div key={item.id} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{item.item_name}</h3>
                      {item.description && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {item.description}
                        </span>
                      )}
                    </div>

                    {feedbackByCriterion[item.item_name] && feedbackByCriterion[item.item_name].length > 0 ? (
                      <div className="space-y-2">
                        {feedbackByCriterion[item.item_name].map((feedback) => (
                          <div
                            key={feedback.id}
                            className="bg-slate-50 p-3 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-700">
                                {feedback.evaluator_name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500">
                                  {new Date(feedback.created_at).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                  {feedback.score}/5
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{feedback.feedback || '피드백 없음'}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">아직 피드백이 없습니다</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Send size={24} className="text-amber-700" />
              <h2 className="text-xl font-bold text-amber-900">제조사 전달 최종 피드백</h2>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              평가자들의 피드백을 종합하여 제조사에 전달할 최종 의견을 작성하세요
            </p>
            <textarea
              value={formData.final_feedback_to_manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, final_feedback_to_manufacturer: e.target.value })
              }
              placeholder="제조사에 전달할 종합 피드백을 입력하세요..."
              rows={8}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send size={16} />
                <span>{saving ? '저장 중...' : '최종 피드백 저장'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 p-6 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <ClipboardList size={24} className="text-blue-700" />
              <h2 className="text-lg font-bold text-blue-900">평가 기준표</h2>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              {project.project_subtype} 카테고리 평가 항목
            </p>

            {evaluationItems.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">평가 항목이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {evaluationItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{item.item_name}</h4>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">평가 척도</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>5점</span>
                  <span className="font-medium">매우 우수</span>
                </div>
                <div className="flex justify-between">
                  <span>4점</span>
                  <span className="font-medium">우수</span>
                </div>
                <div className="flex justify-between">
                  <span>3점</span>
                  <span className="font-medium">보통</span>
                </div>
                <div className="flex justify-between">
                  <span>2점</span>
                  <span className="font-medium">미흡</span>
                </div>
                <div className="flex justify-between">
                  <span>1점</span>
                  <span className="font-medium">매우 미흡</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
