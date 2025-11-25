import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, ShoppingCart, TrendingUp, FolderKanban, Bell } from "lucide-react";

export default function Dashboard() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: influencers } = trpc.influencers.list.useQuery();
  const { data: salesData } = trpc.sales.list.useQuery();
  const { data: adCampaigns } = trpc.ads.list.useQuery();
  const { data: unreadNotifications } = trpc.notifications.unread.useQuery();

  const activeProjects = projects?.filter(p => p.status === "진행중").length || 0;
  const activeInfluencers = influencers?.filter(i => i.status === "활성").length || 0;
  const totalSales = salesData?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const totalAdSpend = adCampaigns?.reduce((sum, ad) => sum + (ad.spend || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">하우파파 통합 업무 현황을 한눈에 확인하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행 중인 프로젝트</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                전체 {projects?.length || 0}개 프로젝트
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalSales.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground">
                {salesData?.length || 0}건의 주문
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">광고 지출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAdSpend.toLocaleString()}원
              </div>
              <p className="text-xs text-muted-foreground">
                {adCampaigns?.length || 0}개 캠페인
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 프로젝트</CardTitle>
            </CardHeader>
            <CardContent>
              {projects && projects.length > 0 ? (
                <div className="space-y-2">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === "진행중" ? "bg-blue-100 text-blue-800" :
                        project.status === "완료" ? "bg-green-100 text-green-800" :
                        project.status === "보류" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {project.status}
                      </span>
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
