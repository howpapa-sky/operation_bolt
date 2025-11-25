import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, TrendingUp } from "lucide-react";

export default function Sales() {
  const { data: salesData, isLoading } = trpc.sales.list.useQuery();

  const totalSales = salesData?.reduce((sum, sale) => sum + sale.totalAmount, 0) || 0;
  const totalOrders = salesData?.length || 0;

  const salesByPlatform = salesData?.reduce((acc, sale) => {
    acc[sale.platform] = (acc[sale.platform] || 0) + sale.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">매출 분석</h1>
          <p className="text-muted-foreground">쇼핑몰별 매출 현황을 확인하세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 매출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales.toLocaleString()}원</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 주문</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}건</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 주문액</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalOrders > 0 ? Math.round(totalSales / totalOrders).toLocaleString() : 0}원
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>플랫폼별 매출</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByPlatform && Object.keys(salesByPlatform).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(salesByPlatform).map(([platform, amount]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="font-medium">{platform}</span>
                    <span className="text-lg">{amount.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">매출 데이터가 없습니다</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData && salesData.length > 0 ? (
              <div className="space-y-2">
                {salesData.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{sale.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {sale.platform} • {new Date(sale.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-medium">{sale.totalAmount.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">주문 데이터가 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
