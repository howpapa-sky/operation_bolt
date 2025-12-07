import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, ShoppingCart, TrendingUp, FolderKanban, Bell, AlertCircle, CheckCircle2, Clock, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = {
  "진행 전": "#94a3b8",
  "진행 중": "#3b82f6",
  "완료": "#22c55e",
  "보류": "#f59e0b",
  "대기": "#6b7280",
};

const PRIORITY_COLORS = {
  "낮음": "#94a3b8",
  "보통": "#3b82f6",
  "높음": "#f59e0b",
  "긴급": "#ef4444",
};

export default function Dashboard() {
  // 기존 API 호출
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: influencers } = trpc.influencers.list.useQuery();
  const { data: salesData } = trpc.sales.list.useQuery();
  const { data: adCampaigns } = trpc.ads.list.useQuery();
  const { data: unreadNotifications } = trpc.notifications.unread.useQuery();

  // 새로운 통계 API 호출
  const { data: projectsNew } = useQuery({
    queryKey: ["projectsNew"],
    queryFn: () => trpc.projectsNew.list.query(),
  });

  const { data: statsByType } = useQuery({
    queryKey: ["projectStats", "byType"],
    queryFn: () => trpc.projectsNew.stats.byType.query(),
  });

  const { data: statsByStatus } = useQuery({
    queryKey: ["projectStats", "byStatus"],
    queryFn: () => trpc.projectsNew.stats.byStatus.query(),
  });

  const { data: statsByPriority } = useQuery({
    queryKey: ["projectStats", "byPriority"],
    queryFn: () => trpc.projectsNew.stats.byPriority.query(),
  });

  const { data: budgetStats } = useQuery({
    queryKey: ["projectStats", "budget"],
    queryFn: () => trpc.projectsNew.stats.budget.query(),
  });

  // 기존 통계 계산
  const activeProjects = projects?.filter(p => p.status === "진행중").length || 0;
  const activeInfluencers = influencers?.filter(i => i.status === "활성").length || 0;
  const totalSales = salesData?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const totalAdSpend = adCampaigns?.reduce((sum, ad) => sum + (ad.spend || 0), 0) || 0;

  // 새로운 프로젝트 통계
  const totalProjectsNew = projectsNew?.length || 0;
  const activeProjectsNew = projectsNew?.filter(p => p.status === "진행 중").length || 0;
  const completedProjectsNew = projectsNew?.filter(p => p.status === "완료").length || 0;
  const urgentProjectsNew = projectsNew?.filter(p => p.priority === "긴급").length || 0;

  // 프로젝트 유형별 데이터 변환
  const projectTypeData = statsByType
    ? Object.entries(statsByType).map(([type, statusCounts]: [string, any]) => ({
        name: type,
        ...statusCounts,
      }))
    : [];

  // 진행 상황별 데이터 변환
  const statusData = statsByStatus
    ? Object.entries(statsByStatus).map(([status, count]) => ({
        name: status,
        value: count,
      }))
    : [];

  // 우선순위별 데이터 변환
  const priorityData = statsByPriority
    ? Object.entries(statsByPriority).map(([priority, count]) => ({
        name: priority,
        value: count,
      }))
    : [];

  // 예산 데이터 변환
  const budgetData = budgetStats
    ? Object.entries(budgetStats).map(([type, amounts]: [string, any]) => ({
        name: type,
        예산: amounts.budget,
        매출: amounts.revenue,
        이익: amounts.profit,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">하우파파 통합 업무 현황을 한눈에 확인하세요</p>
        </div>

        {/* 주요 지표 카드 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 프로젝트</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjectsNew}</div>
              <p className="text-xs text-muted-foreground">
                진행 중 {activeProjectsNew}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 프로젝트</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedProjectsNew}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {totalProjectsNew > 0 ? Math.round((completedProjectsNew / totalProjectsNew) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">긴급 프로젝트</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentProjectsNew}</div>
              <p className="text-xs text-muted-foreground">
                즉시 처리 필요
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 인플루언서</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInfluencers}</div>
              <p className="text-xs text-muted-foreground">
                전체 {influencers?.length || 0}명
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 프로젝트 유형별 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 유형별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="진행 전" stackId="a" fill={COLORS["진행 전"]} />
                <Bar dataKey="진행 중" stackId="a" fill={COLORS["진행 중"]} />
                <Bar dataKey="완료" stackId="a" fill={COLORS["완료"]} />
                <Bar dataKey="보류" stackId="a" fill={COLORS["보류"]} />
                <Bar dataKey="대기" stackId="a" fill={COLORS["대기"]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 진행 상황 및 우선순위 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>진행 상황별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>우선순위별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 예산 사용 현황 */}
        {budgetData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 유형별 예산 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                  <Legend />
                  <Bar dataKey="예산" fill="#3b82f6" />
                  <Bar dataKey="매출" fill="#22c55e" />
                  <Bar dataKey="이익" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 최근 프로젝트 및 알림 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 프로젝트</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsNew && projectsNew.length > 0 ? (
                <div className="space-y-2">
                  {projectsNew.slice(0, 5).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.project_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.priority === "긴급" ? "bg-red-100 text-red-800" :
                          project.priority === "높음" ? "bg-orange-100 text-orange-800" :
                          project.priority === "보통" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {project.priority}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === "진행 중" ? "bg-blue-100 text-blue-800" :
                          project.status === "완료" ? "bg-green-100 text-green-800" :
                          project.status === "보류" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">프로젝트가 없습니다</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                최근 알림
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unreadNotifications && unreadNotifications.length > 0 ? (
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="p-2 hover:bg-accent rounded-lg">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {notification.message && (
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">새로운 알림이 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
