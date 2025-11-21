import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROJECT_SUBTYPES = {
  '제품 출시': ['샘플', '부자재'],
  '상세페이지': ['크림', '토너패드', '앰플', '로션', '미스트'],
  '인플루언서': ['단순시딩', '유가시딩', '공동구매'],
  '제품 발주': ['원료', '부자재', '기타'],
};

const EVALUATION_CRITERIA: Record<string, string[]> = {
  '크림': ['겉보습', '속건조개선', '마무리감'],
  '토너패드': ['크기', '밀착력', '원단', '두께', '수분함침/유지력'],
};

const MANUFACTURERS = ['한국콜마', '코스맥스'];

const PACKAGE_TYPES = ['용기', '단상자'];

const PACKAGE_SUPPLIERS: Record<string, string[]> = {
  '용기': ['콜마(턴키)', '그린팩', '미소코스팔', '영동프라텍', '럭스팩'],
  '단상자': ['콜마(턴키)', '원컴퍼니티엠', '아토즈'],
};

export function ProjectFormModal({ isOpen, onClose, onSuccess }: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    project_type: '',
    project_subtype: '',
    custom_subtype: '',
    manufacturer: '',
    package_type: '',
    sample_code: '',
    sample_round: '',
    status: '진행 전',
    priority: '보통',
    start_date: '',
    due_date: '',
    completed_date: '',
    notes: '',
  });
  const [evaluationScores, setEvaluationScores] = useState<Record<string, number>>({});
  const [evaluationComments, setEvaluationComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.brand) {
        setError('브랜드를 선택해주세요');
        setLoading(false);
        return;
      }

      if (!formData.project_type) {
        setError('프로젝트 유형을 선택해주세요');
        setLoading(false);
        return;
      }

      let subtypeValue;
      if (formData.project_type === '제품 발주' && formData.project_subtype === '기타') {
        subtypeValue = formData.custom_subtype;
      } else if (formData.project_type === '제품 출시' && formData.custom_subtype === '부자재') {
        subtypeValue = formData.package_type;
      } else if (formData.project_type === '제품 출시') {
        subtypeValue = formData.custom_subtype;
      } else {
        subtypeValue = formData.project_subtype;
      }

      if (!subtypeValue) {
        setError('세부 유형을 선택해주세요');
        setLoading(false);
        return;
      }

      if (needsManufacturer() && !formData.manufacturer) {
        setError('제조사를 선택해주세요');
        setLoading(false);
        return;
      }

      if (needsSampleSubtype() && !formData.project_subtype) {
        setError('샘플 세부 유형을 선택해주세요');
        setLoading(false);
        return;
      }

      if (needsManufacturer() && !formData.sample_round) {
        setError('회차를 선택해주세요');
        setLoading(false);
        return;
      }

      if (needsPackageType() && !formData.package_type) {
        setError('부자재 유형을 선택해주세요');
        setLoading(false);
        return;
      }

      if (needsPackageSupplier() && !formData.manufacturer) {
        setError('업체를 선택해주세요');
        setLoading(false);
        return;
      }

      let projectName;
      if (formData.project_type === '제품 출시' && formData.custom_subtype === '샘플') {
        projectName = `[${formData.brand}] ${formData.project_type} - 샘플 - ${formData.project_subtype}`;
      } else if (formData.project_type === '제품 출시' && formData.custom_subtype === '부자재') {
        projectName = `[${formData.brand}] ${formData.project_type} - 부자재 - ${formData.package_type}`;
      } else {
        projectName = `[${formData.brand}] ${formData.project_type} - ${subtypeValue}`;
      }

      const projectTypeMapping: Record<string, string> = {
        '제품 출시': '샘플링',
        '상세페이지': '상세페이지',
        '인플루언서': '인플루언서',
        '제품 발주': '제품 발주',
      };

      const insertData = {
        brand: formData.brand,
        name: projectName,
        project_type: projectTypeMapping[formData.project_type] || formData.project_type,
        project_subtype: (formData.project_type === '제품 출시' && formData.custom_subtype === '샘플')
          ? formData.project_subtype
          : (formData.project_type === '제품 출시' && formData.custom_subtype === '부자재')
          ? formData.package_type
          : subtypeValue,
        manufacturer: formData.manufacturer || null,
        sample_code: formData.sample_code || null,
        sample_round: formData.sample_round || null,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        completed_date: formData.completed_date || null,
        notes: formData.notes || null,
        evaluation_criteria: Object.keys(evaluationScores).length > 0 ? evaluationScores : null,
        evaluation_comments: Object.keys(evaluationComments).length > 0 ? evaluationComments : null,
      };

      console.log('Inserting project data:', insertData);

      const { error: insertError } = await supabase.from('projects').insert(insertData);

      if (insertError) {
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });
        throw insertError;
      }

      setFormData({
        brand: '',
        project_type: '',
        project_subtype: '',
        custom_subtype: '',
        manufacturer: '',
        package_type: '',
        sample_code: '',
        sample_round: '',
        status: '진행 전',
        priority: '보통',
        start_date: '',
        due_date: '',
        completed_date: '',
        notes: '',
      });
      setEvaluationScores({});
      setEvaluationComments({});

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        error: err,
      });
      const errorMessage = err?.message || '프로젝트 생성 중 오류가 발생했습니다';
      setError(`오류: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectTypeChange = (type: string) => {
    setFormData({
      ...formData,
      project_type: type,
      project_subtype: '',
      custom_subtype: '',
      manufacturer: '',
      package_type: '',
      sample_code: '',
      sample_round: '',
    });
    setEvaluationScores({});
    setEvaluationComments({});
  };

  const handleSubtypeChange = (subtype: string) => {
    if (formData.project_type === '제품 출시') {
      setFormData({
        ...formData,
        custom_subtype: subtype,
        project_subtype: '',
        manufacturer: '',
        package_type: '',
        sample_code: '',
        sample_round: '',
      });
      setEvaluationScores({});
      setEvaluationComments({});
    } else {
      setFormData({
        ...formData,
        project_subtype: subtype,
      });

      if (shouldShowEvaluationCriteria(subtype)) {
        const initialScores: Record<string, number> = {};
        const initialComments: Record<string, string> = {};
        EVALUATION_CRITERIA[subtype].forEach((criterion) => {
          initialScores[criterion] = 0;
          initialComments[criterion] = '';
        });
        setEvaluationScores(initialScores);
        setEvaluationComments(initialComments);
      } else {
        setEvaluationScores({});
        setEvaluationComments({});
      }
    }
  };

  const handleSampleSubtypeChange = (subtype: string) => {
    setFormData({
      ...formData,
      project_subtype: subtype,
    });

    if (shouldShowEvaluationCriteria(subtype)) {
      const initialScores: Record<string, number> = {};
      const initialComments: Record<string, string> = {};
      EVALUATION_CRITERIA[subtype].forEach((criterion) => {
        initialScores[criterion] = 0;
        initialComments[criterion] = '';
      });
      setEvaluationScores(initialScores);
      setEvaluationComments(initialComments);
    } else {
      setEvaluationScores({});
      setEvaluationComments({});
    }
  };

  const handleManufacturerChange = (manufacturer: string) => {
    setFormData({
      ...formData,
      manufacturer,
      project_subtype: '',
      sample_code: '',
      sample_round: '',
    });
    setEvaluationScores({});
    setEvaluationComments({});
  };

  const handlePackageTypeChange = (packageType: string) => {
    setFormData({
      ...formData,
      package_type: packageType,
      manufacturer: '',
    });
  };

  const handlePackageSupplierChange = (supplier: string) => {
    setFormData({
      ...formData,
      manufacturer: supplier,
    });
  };

  const handleScoreChange = (criterion: string, score: number) => {
    setEvaluationScores({
      ...evaluationScores,
      [criterion]: score,
    });
  };

  const handleCommentChange = (criterion: string, comment: string) => {
    setEvaluationComments({
      ...evaluationComments,
      [criterion]: comment,
    });
  };

  const needsManufacturer = () => {
    return formData.project_type === '제품 출시' && formData.custom_subtype === '샘플';
  };

  const needsSampleSubtype = () => {
    return formData.project_type === '제품 출시' && formData.custom_subtype === '샘플' && formData.manufacturer;
  };

  const needsPackageType = () => {
    return formData.project_type === '제품 출시' && formData.custom_subtype === '부자재';
  };

  const needsPackageSupplier = () => {
    return formData.project_type === '제품 출시' && formData.custom_subtype === '부자재' && formData.package_type;
  };

  const shouldShowEvaluationCriteria = (subtype: string) => {
    return formData.project_type === '제품 출시' && formData.custom_subtype === '샘플' && formData.manufacturer && EVALUATION_CRITERIA[subtype];
  };

  const subtypeOptions = formData.project_type
    ? PROJECT_SUBTYPES[formData.project_type as keyof typeof PROJECT_SUBTYPES] || []
    : [];

  const showManufacturerSelection = formData.project_type === '제품 출시' && formData.custom_subtype === '샘플';

  const showSampleSubtypeSelection = formData.project_type === '제품 출시' && formData.custom_subtype === '샘플' && formData.manufacturer;

  const showPackageTypeSelection = formData.project_type === '제품 출시' && formData.custom_subtype === '부자재';

  const showPackageSupplierSelection = formData.project_type === '제품 출시' && formData.custom_subtype === '부자재' && formData.package_type;

  const packageSupplierOptions = formData.package_type ? PACKAGE_SUPPLIERS[formData.package_type] || [] : [];

  const showEvaluationCriteria = formData.project_subtype && shouldShowEvaluationCriteria(formData.project_subtype);

  const evaluationCriteria = showEvaluationCriteria && EVALUATION_CRITERIA[formData.project_subtype]
    ? EVALUATION_CRITERIA[formData.project_subtype]
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">새 프로젝트 등록</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              1. 브랜드 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['누씨오', '하우파파'].map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setFormData({ ...formData, brand })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.brand === brand
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              2. 프로젝트 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['제품 출시', '상세페이지', '인플루언서', '제품 발주'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleProjectTypeChange(type)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.project_type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {formData.project_type && subtypeOptions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                세부 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {subtypeOptions.map((subtype) => (
                  <button
                    key={subtype}
                    type="button"
                    onClick={() => handleSubtypeChange(subtype)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.custom_subtype === subtype || formData.project_subtype === subtype
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {subtype}
                  </button>
                ))}
              </div>
              {formData.project_type === '제품 발주' && formData.project_subtype === '기타' && (
                <input
                  type="text"
                  placeholder="기타 내용을 입력하세요"
                  value={formData.custom_subtype}
                  onChange={(e) => setFormData({ ...formData, custom_subtype: e.target.value })}
                  className="mt-3 w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              )}
            </div>
          )}

          {showManufacturerSelection && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                제조사 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MANUFACTURERS.map((manufacturer) => (
                  <button
                    key={manufacturer}
                    type="button"
                    onClick={() => handleManufacturerChange(manufacturer)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.manufacturer === manufacturer
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {manufacturer}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSampleSubtypeSelection && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  샘플 세부 유형 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['크림', '토너패드', '앰플', '로션', '미스트'].map((subtype) => (
                    <button
                      key={subtype}
                      type="button"
                      onClick={() => handleSampleSubtypeChange(subtype)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.project_subtype === subtype
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {subtype}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  샘플 코드
                </label>
                <input
                  type="text"
                  value={formData.sample_code}
                  onChange={(e) => setFormData({ ...formData, sample_code: e.target.value })}
                  placeholder="샘플 코드를 입력하세요 (예: A-001)"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  회차 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sample_round}
                  onChange={(e) => setFormData({ ...formData, sample_round: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-700 font-medium"
                >
                  <option value="">회차를 선택하세요</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((round) => (
                    <option key={round} value={round}>
                      {round}회차
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {showPackageTypeSelection && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                부자재 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PACKAGE_TYPES.map((packageType) => (
                  <button
                    key={packageType}
                    type="button"
                    onClick={() => handlePackageTypeChange(packageType)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.package_type === packageType
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {packageType}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showPackageSupplierSelection && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                업체 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {packageSupplierOptions.map((supplier) => (
                  <button
                    key={supplier}
                    type="button"
                    onClick={() => handlePackageSupplierChange(supplier)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.manufacturer === supplier
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {supplier}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showEvaluationCriteria && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                평가 항목 (1-5점)
              </label>
              <div className="space-y-6">
                {evaluationCriteria.map((criterion) => (
                  <div key={criterion} className="bg-white rounded-lg p-4 border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">{criterion}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {evaluationScores[criterion] || 0}점
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(criterion, score)}
                          className={`flex-1 py-2 rounded-lg border-2 font-semibold transition-all ${
                            evaluationScores[criterion] === score
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-blue-300'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        한줄평
                      </label>
                      <input
                        type="text"
                        placeholder="평가에 대한 한줄평을 입력하세요"
                        value={evaluationComments[criterion] || ''}
                        onChange={(e) => handleCommentChange(criterion, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              3. 진행 상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="진행 전">진행 전</option>
              <option value="진행 중">진행 중</option>
              <option value="완료">완료</option>
              <option value="보류">보류</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              4. 우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="낮음">낮음</option>
              <option value="보통">보통</option>
              <option value="높음">높음</option>
              <option value="긴급">긴급</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                5. 시작일
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                6. 목표일
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                7. 완료일
              </label>
              <input
                type="date"
                value={formData.completed_date}
                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              8. 비고
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="추가 메모나 설명을 입력하세요"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? '등록 중...' : '프로젝트 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
