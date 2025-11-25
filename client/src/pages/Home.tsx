import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl, APP_TITLE } from "@/const";
import { BarChart3, Users, ShoppingCart, TrendingUp, Zap, FolderKanban } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              화장품 브랜드 운영의 모든 것을 하나로. 제품 개발부터 마케팅, 매출 분석까지 완벽한 통합 솔루션.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <FolderKanban className="w-12 h-12 mb-4 text-blue-600" />
                  <CardTitle>프로젝트 관리</CardTitle>
                  <CardDescription>
                    제품 개발 전 과정을 체계적으로 관리하고 추적합니다
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 mb-4 text-purple-600" />
                  <CardTitle>인플루언서 관리</CardTitle>
                  <CardDescription>
                    100+ 인플루언서 관계 관리 및 캠페인 성과 자동 추적
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BarChart3 className="w-12 h-12 mb-4 text-green-600" />
                  <CardTitle>통합 대시보드</CardTitle>
                  <CardDescription>
                    쇼핑몰 매출과 광고 성과를 실시간으로 한눈에
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <ShoppingCart className="w-12 h-12 mb-4 text-orange-600" />
                  <CardTitle>매출 통합</CardTitle>
                  <CardDescription>
                    카페24, 쿠팡, 스마트스토어 매출 데이터 자동 수집
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="w-12 h-12 mb-4 text-red-600" />
                  <CardTitle>광고 분석</CardTitle>
                  <CardDescription>
                    메타, 네이버 광고 성과 및 ROAS 실시간 분석
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="w-12 h-12 mb-4 text-yellow-600" />
                  <CardTitle>자동화</CardTitle>
                  <CardDescription>
                    반복 업무 자동화로 핵심 전략에 집중
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>시작하기</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 로그인된 사용자는 대시보드로 리다이렉트
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">대시보드로 이동 중...</p>
        <Link href="/dashboard">
          <Button>대시보드로 가기</Button>
        </Link>
      </div>
    </div>
  );
}
