import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface EvaluationItem {
  id: string;
  product_category: string;
  item_name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PRODUCT_CATEGORIES = ['크림', '토너패드', '앰플', '로션', '미스트'];

export default function EvaluationItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('크림');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    product_category: '크림',
    item_name: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('evaluation_items')
        .select('*')
        .order('product_category')
        .order('display_order');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched items:', data);
      setItems(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || '평가 항목을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    return items
      .filter(item => item.product_category === selectedCategory)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const handleAdd = () => {
    const filteredItems = getFilteredItems();
    setIsAddingNew(true);
    setEditingId(null);
    setFormData({
      product_category: selectedCategory,
      item_name: '',
      description: '',
      display_order: filteredItems.length + 1,
      is_active: true,
    });
  };

  const handleEdit = (item: EvaluationItem) => {
    setEditingId(item.id);
    setIsAddingNew(false);
    setFormData({
      product_category: item.product_category,
      item_name: item.item_name,
      description: item.description || '',
      display_order: item.display_order,
      is_active: item.is_active,
    });
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      product_category: selectedCategory,
      item_name: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.item_name.trim()) {
        alert('평가 항목 이름을 입력하세요.');
        return;
      }

      if (isAddingNew) {
        const { data, error } = await supabase
          .from('evaluation_items')
          .insert([{
            product_category: formData.product_category,
            item_name: formData.item_name.trim(),
            description: formData.description.trim() || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          }])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert success:', data);
      } else if (editingId) {
        const { data, error } = await supabase
          .from('evaluation_items')
          .update({
            item_name: formData.item_name.trim(),
            description: formData.description.trim() || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update success:', data);
      }

      await fetchItems();
      handleCancel();
    } catch (err: any) {
      console.error('Save error:', err);
      alert(`저장 실패: ${err.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 평가 항목을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('evaluation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchItems();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">평가 항목 관리</h1>
          <p className="text-sm text-gray-600 mt-1">제품출시 &gt; 샘플 제품별 평가 항목을 관리합니다</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 항목 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-2 border-b border-gray-200">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              handleCancel();
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedCategory === category
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {isAddingNew && (
        <div className="bg-blue-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">새 평가 항목 추가</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제품 카테고리
              </label>
              <select
                value={formData.product_category}
                onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                항목 이름 *
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 겉보습"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 피부 표면 보습 효과"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                표시 순서
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">활성</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                순서
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                항목 이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  평가 항목이 없습니다. 새 항목을 추가하세요.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className={editingId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  {editingId === item.id ? (
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.item_name}
                          onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">활성</span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="text-blue-600 hover:text-blue-800"
                            title="저장"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-800"
                            title="취소"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.display_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{item.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.is_active ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="수정"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
