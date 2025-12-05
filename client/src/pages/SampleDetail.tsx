import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, Calendar, User, Package, Factory } from "lucide-react";
import { APP_TITLE } from "@/const";

// 평가 항목 한글 매핑
const SCORE_LABELS: Record<string, string> = {
  texture: "텍스처",
  absorption: "흡수력",
  scent: "향",
  packaging: "패키징",
  effectiveness: "효과",
};

// 점수에 따른 색상
function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 4.0) return "text-blue-600";
  if (score >= 3.5) return "text-yellow-600";
  if (score >= 3.0) return "text-orange-600";
  return "text-red-600";
}

// 점수에 따른 Progress 색상
function getProgressColor(score: number): string {
  if (score >= 4.5) return "bg-green-500";
  if (score >= 4.0) return "bg-blue-500";
  if (score >= 3.5) return "bg-yellow-500";
  if (score >= 3.0) return "bg-orange-500";
  return "bg-red-500";
}

// 상태 배지 색상
function getStatusColor(status: string): string {
  switch (status) {
    case "완료":
      return "bg-green-100 text-green-800";
    case "진행중":
      return "bg-blue-100 text-blue-800";
    case "진행전":
      return "bg-gray-100 text-gray-800";
    case "보류":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// 우선순위 배지 색상
function getPriorityColor(priority: string): string {
  switch (priority) {
    case "긴급":
      return "bg-red-100 text-red-800";
    case "높음":
      return "bg-orange-100 text-orange-800";
    case "보통":
      return "bg-blue-100 text-blue-800";
    case "낮음":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// 평균 점수 계산
function calculateAverageScore(evaluationScores: any): number | null {
  if (!evaluationScores || typeof evaluationScores !== "object") return null;

  const scores = Object.values(evaluationScores).filter(
    (score): score is number => typeof score === "number" && score > 0
  );

  if (scores.length === 0) return null;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export default function SampleDetail() {
  const [, params] = useRoute("/samples/:id");
  const [, setLocation] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : null;

  // 프로젝트 데이터 가져오기
  const { data: project, isLoading, error } = trpc.projects.getById.useQuery(
    { id: projectId! },
    { enabled: !!projectId }
  );

  // 페이지 제목 설정
  useEffect(() => {
    if (project) {
      document.title = `${project.name} - ${APP_TITLE}`;
    }
  }, [project]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">프로젝트를 찾을 수 없습니다</h1>
            <Button onClick={() => setLocation("/samples")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              샘플 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const avgScore = calculateAverageScore(project.evaluationScores);
  const evaluationScores = project.evaluationScores as Record<string, number> | null;
  const attachedImages = (project.attachedImages as string[]) || [];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/samples")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            샘플 목록으로 돌아가기
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getStatusColor(project.status || "")}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority || "")}>
                  {project.priority}
                </Badge>
                {avgScore !== null && (
                  <Badge variant="outline" className={getScoreColor(avgScore)}>
                    ⭐ {avgScore}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 기본 정보 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 프로젝트 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">브랜드:</span>
                  <span className="font-medium">{project.brand || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Factory className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">제조사:</span>
                  <span className="font-medium">{project.manufacturer || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">샘플 종류:</span>
                  <span className="font-medium">{project.projectSubtype || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">회차:</span>
                  <span className="font-medium">{project.round || "-"}차</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">샘플 코드:</span>
                  <span className="font-medium">{project.sampleCode || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">평가자:</span>
                  <span className="font-medium">평가자 {project.evaluatorId || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">시작일:</span>
                  <span className="font-medium">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">마감일:</span>
                  <span className="font-medium">
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 프로젝트 설명 */}
            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle>설명</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽: 평가 점수 및 코멘트 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 평가 점수 */}
            {evaluationScores && Object.keys(evaluationScores).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>평가 점수</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(evaluationScores).map(([key, score]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {SCORE_LABELS[key] || key}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={(score / 5) * 100} className="h-2" />
                        <div
                          className={`absolute top-0 left-0 h-2 rounded-full ${getProgressColor(
                            score
                          )}`}
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {avgScore !== null && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold">평균 점수</span>
                        <span className={`text-xl font-bold ${getScoreColor(avgScore)}`}>
                          ⭐ {avgScore} / 5.0
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 평가 코멘트 */}
            {project.evaluationComment && (
              <Card>
                <CardHeader>
                  <CardTitle>평가 코멘트</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {project.evaluationComment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 첨부 이미지 */}
            {attachedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>첨부 이미지</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachedImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => window.open(imageUrl, "_blank")}
                      >
                        <img
                          src={imageUrl}
                          alt={`샘플 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 데이터 없음 메시지 */}
            {!evaluationScores &&
              !project.evaluationComment &&
              attachedImages.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      아직 평가 데이터가 없습니다.
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
