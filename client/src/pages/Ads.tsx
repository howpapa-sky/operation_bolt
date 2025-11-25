import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Eye, MousePointer, DollarSign } from "lucide-react";

export default function Ads() {
  const { data: adCampaigns, isLoading } = trpc.ads.list.useQuery();

  const totalSpend = adCampaigns?.reduce((sum, ad) => sum + (ad.spend || 0), 0) || 0;
  const totalImpressions = adCampaigns?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
  const totalClicks = adCampaigns?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
  const totalRevenue = adCampaigns?.reduce((sum, ad) => sum + (ad.revenue || 0), 0) || 0;

  const avgRoas = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">광고 성과 분석</h1>
          <p className="text-muted-foreground">메타, 네이버 광고 캠페인 성과를 확인하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 광고비</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpend.toLocaleString()}원</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">노출수</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">클릭수</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROAS</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRoas}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>캠페인 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {adCampaigns && adCampaigns.length > 0 ? (
              <div className="space-y-2">
                {adCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{campaign.campaignName}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.platform} • {new Date(campaign.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{(campaign.spend || 0).toLocaleString()}원</p>
                      {campaign.roas && (
                        <p className="text-xs text-muted-foreground">ROAS: {campaign.roas}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">광고 데이터가 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
