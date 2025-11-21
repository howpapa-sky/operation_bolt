import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'viewer' | 'manager' | 'admin' | 'super_admin';
  created_at: string;
}

export function UserManagement() {
  const { canManageUsers } = useAuthContext();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserProfile['role']) => {
    if (!canManageUsers) {
      alert('권한이 없습니다.');
      return;
    }

    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      alert('권한이 성공적으로 변경되었습니다.');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('권한 변경에 실패했습니다.');
    } finally {
      setUpdating(null);
    }
  };

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!canManageUsers) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한 없음</h2>
        <p className="text-slate-600">사용자 관리 권한이 없습니다.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">사용자 관리</h1>
          <p className="text-slate-600">시스템 사용자의 권한을 관리합니다</p>
        </div>
        <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <Users size={20} className="text-blue-600" />
          <div>
            <div className="text-sm text-blue-600 font-medium">전체 사용자</div>
            <div className="text-2xl font-bold text-blue-700">{users.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">이메일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">현재 권한</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">가입일</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">권한 변경</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.full_name}</div>
                        <div className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      <Shield size={12} />
                      <span>{getRoleDisplayName(user.role)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as UserProfile['role'])}
                      disabled={updating === user.id}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    {updating === user.id && (
                      <span className="ml-2 text-sm text-blue-600">저장 중...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Shield size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">권한 안내</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li><strong>Super Admin:</strong> 모든 기능 접근 및 사용자 관리 가능</li>
              <li><strong>Admin:</strong> 프로젝트 및 작업 관리 가능</li>
              <li><strong>Manager:</strong> 프로젝트 및 작업 관리 가능</li>
              <li><strong>Viewer:</strong> 읽기 전용 접근</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
