import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, BarChart3, Filter } from 'lucide-react';

interface Props {
  category: string;
  onBack: () => void;
}

interface EvaluationStat {
  criterion: string;
  average: number;
  count: number;
}

export function SampleAnalytics({ category, onBack }: Props) {
  const [stats, setStats] = useState<EvaluationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('전체');
  const [selectedRound, setSelectedRound] = useState<string>('전체');

  useEffect(() => {
    loadFilters();
  }, [category]);

  useEffect(() => {
    loadAnalytics();
  }, [category, selectedManufacturer, selectedRound]);

  const loadFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('manufacturer, sample_round')
        .eq('project_subtype', category);

      if (error) throw error;

      const uniqueManufacturers = Array.from(
        new Set(data?.map((p) => p.manufacturer).filter(Boolean))
      ) as string[];
      const uniqueRounds = Array.from(
        new Set(data?.map((p) => p.sample_round).filter(Boolean))
      ) as string[];

      setManufacturers(['전체', ...uniqueManufacturers.sort()]);
      setRounds(['전체', ...uniqueRounds.sort()]);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      let query = supabase
        .from('projects')
        .select('evaluation_criteria')
        .eq('project_subtype', category)
        .not('evaluation_criteria', 'is', null);

      if (selectedManufacturer !== '전체') {
        query = query.eq('manufacturer', selectedManufacturer);
      }

      if (selectedRound !== '전체') {
        query = query.eq('sample_round', selectedRound);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTotalProjects(data?.length || 0);

      const criteriaMap: Record<string, { sum: number; count: number }> = {};

      data?.forEach((project) => {
        const criteria = project.evaluation_criteria as Record<string, number>;
        if (criteria && typeof criteria === 'object') {
          Object.entries(criteria).forEach(([key, value]) => {
            if (typeof value === 'number') {
              if (!criteriaMap[key]) {
                criteriaMap[key] = { sum: 0, count: 0 };
              }
              criteriaMap[key].sum += value;
              criteriaMap[key].count += 1;
            }
          });
        }
      });

      const statistics = Object.entries(criteriaMap).map(([criterion, data]) => ({
        criterion,
        average: data.sum / data.count,
        count: data.count,
      }));

      statistics.sort((a, b) => b.average - a.average);

      setStats(statistics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 4.0) return 'bg-blue-500';
    if (score >= 3.5) return 'bg-yellow-500';
    if (score >= 3.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 4.5) return 'text-green-700';
    if (score >= 4.0) return 'text-blue-700';
    if (score >= 3.5) return 'text-yellow-700';
    if (score >= 3.0) return 'text-orange-700';
    return 'text-red-700';
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{category} 평가 통계</h1>
            <p className="text-slate-600 mt-1">총 {totalProjects}개 프로젝트 분석</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-slate-500" />
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m === '전체' ? '전체 제조사' : m}
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {rounds.map((r) => (
              <option key={r} value={r}>
                {r === '전체' ? '전체 회차' : `${r}회차`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BarChart3 size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">평가 데이터가 없습니다</p>
          <p className="text-slate-500 text-sm mt-2">
            {category} 카테고리에 평가 점수가 입력된 프로젝트가 없습니다.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.criterion}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{stat.criterion}</h3>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {stat.count}건
                  </span>
                </div>
                <div className="flex items-end space-x-2">
                  <span className={`text-4xl font-bold ${getScoreTextColor(stat.average)}`}>
                    {stat.average.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-sm mb-1">/ 5.0</span>
                </div>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(stat.average)} transition-all`}
                    style={{ width: `${(stat.average / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 size={20} className="text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900">평가 항목별 비교</h2>
            </div>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={stat.criterion}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-slate-900 w-32">
                        {stat.criterion}
                      </span>
                      <span className={`text-2xl font-bold ${getScoreTextColor(stat.average)}`}>
                        {stat.average.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500">{stat.count}개 평가</span>
                  </div>
                  <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${getScoreColor(
                        stat.average
                      )} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                      style={{
                        width: `${(stat.average / 5) * 100}%`,
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      <span className="text-white text-xs font-semibold">
                        {((stat.average / 5) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-200 p-6">
              <div className="text-sm text-green-700 font-semibold mb-2">최고 점수</div>
              <div className="text-3xl font-bold text-green-700">
                {Math.max(...stats.map((s) => s.average)).toFixed(1)}
              </div>
              <div className="text-xs text-green-600 mt-2">
                {stats.find((s) => s.average === Math.max(...stats.map((s) => s.average)))?.criterion}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border-2 border-red-200 p-6">
              <div className="text-sm text-red-700 font-semibold mb-2">최저 점수</div>
              <div className="text-3xl font-bold text-red-700">
                {Math.min(...stats.map((s) => s.average)).toFixed(1)}
              </div>
              <div className="text-xs text-red-600 mt-2">
                {stats.find((s) => s.average === Math.min(...stats.map((s) => s.average)))?.criterion}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 p-6">
              <div className="text-sm text-blue-700 font-semibold mb-2">평균 점수</div>
              <div className="text-3xl font-bold text-blue-700">
                {(stats.reduce((sum, s) => sum + s.average, 0) / stats.length).toFixed(1)}
              </div>
              <div className="text-xs text-blue-600 mt-2">전체 항목 평균</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 p-6">
              <div className="text-sm text-slate-700 font-semibold mb-2">평가 항목</div>
              <div className="text-3xl font-bold text-slate-900">{stats.length}</div>
              <div className="text-xs text-slate-600 mt-2">개 항목</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-200 p-6">
              <div className="text-sm text-amber-700 font-semibold mb-2">총 평가</div>
              <div className="text-3xl font-bold text-amber-700">{totalProjects}</div>
              <div className="text-xs text-amber-600 mt-2">개 프로젝트</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
