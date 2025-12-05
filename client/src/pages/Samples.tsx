import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

// 평가 점수 계산 함수
function calculateAverageScore(evaluationScores: any): number | null {
  if (!evaluationScores || typeof evaluationScores !== "object") return null;

  const scores = Object.values(evaluationScores).filter(
    (score): score is number => typeof score === "number" && score > 0
  );

  if (scores.length === 0) return null;

  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

// 평점에 따른 색상 반환
function getScoreColor(score: number): string {
  if (score >= 4.5) return "text-green-600";
  if (score >= 4.0) return "text-blue-600";
  if (score >= 3.5) return "text-yellow-600";
  if (score >= 3.0) return "text-orange-600";
  return "text-red-600";
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

export default function Samples() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [priorityFilter, setPriorityFilter] = useState("전체");
  const [sortBy, setSortBy] = useState<"latest" | "rating">("latest");

  // 모든 프로젝트 가져오기
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  // 필터링 및 정렬 로직
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    let filtered = [...projects];

    // 검색 필터 (프로젝트 이름, 샘플 코드, 세부 유형)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.sampleCode?.toLowerCase().includes(query) ||
          (Array.isArray(p.projectSubtypes)
            ? p.projectSubtypes.some((subtype: string) => subtype.toLowerCase().includes(query))
            : false)
      );
    }

    // 샘플 종류 필터
    if (sampleTypeFilter !== "전체") {
      filtered = filtered.filter((p) =>
        Array.isArray(p.projectSubtypes)
          ? p.projectSubtypes.includes(sampleTypeFilter)
          : false
      );
    }

    // 상태 필터
    if (statusFilter !== "전체") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // 우선순위 필터
    if (priorityFilter !== "전체") {
      filtered = filtered.filter((p) => p.priority === priorityFilter);
    }

    // 정렬
    if (sortBy === "rating") {
      filtered.sort((a, b) => {
        const scoreA = calculateAverageScore(a.evaluationScores) || 0;
        const scoreB = calculateAverageScore(b.evaluationScores) || 0;
        return scoreB - scoreA; // 높은 평점 우선
      });
    } else {
      // 최신순 (ID 기준 내림차순)
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [projects, searchQuery, sampleTypeFilter, statusFilter, priorityFilter, sortBy]);

  // 필터 초기화
  const resetFilters = () => {
    setSearchQuery("");
    setSampleTypeFilter("전체");
    setStatusFilter("전체");
    setPriorityFilter("전체");
    setSortBy("latest");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">샘플 관리</h1>
          <p className="text-muted-foreground">
            전체 {filteredProjects.length}개의 샘플 프로젝트
          </p>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="mb-6 space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="프로젝트 이름 또는 샘플 코드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 필터 옵션 */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">필터:</span>
            </div>

            {/* 샘플 종류 */}
            <Select value={sampleTypeFilter} onValueChange={setSampleTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="샘플 종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="크림">크림</SelectItem>
                <SelectItem value="토너패드">토너패드</SelectItem>
                <SelectItem value="앰플">앰플</SelectItem>
                <SelectItem value="로션">로션</SelectItem>
                <SelectItem value="미스트">미스트</SelectItem>
              </SelectContent>
            </Select>

            {/* 상태 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="진행전">진행 전</SelectItem>
                <SelectItem value="진행중">진행 중</SelectItem>
                <SelectItem value="완료">완료</SelectItem>
                <SelectItem value="보류">보류</SelectItem>
              </SelectContent>
            </Select>

            {/* 우선순위 */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="우선순위" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="낮음">낮음</SelectItem>
                <SelectItem value="보통">보통</SelectItem>
                <SelectItem value="높음">높음</SelectItem>
              </SelectContent>
            </Select>

            {/* 정렬 */}
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "latest" | "rating")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
              </SelectContent>
            </Select>

            {/* 필터 초기화 버튼 */}
            <Button variant="outline" onClick={resetFilters}>
              필터 초기화
            </Button>
          </div>
        </div>

        {/* 프로젝트 카드 그리드 */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => {
              const avgScore = calculateAverageScore(project.evaluationScores);
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/samples/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className={getStatusColor(project.status || "")}>
                        {project.status}
                      </Badge>
                      <Badge className={getPriorityColor(project.priority || "")}>
                        {project.priority}
                      </Badge>
                    </div>
                    {avgScore !== null && (
                      <div className={`text-lg font-bold ${getScoreColor(avgScore)}`}>
                        ⭐ {avgScore}
                      </div>
                    )}
                    <CardTitle className="text-base line-clamp-2">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">브랜드</span>
                      <span className="font-medium">{project.brand || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">샘플 종류</span>
                      <span className="font-medium">
                        {Array.isArray(project.projectSubtypes) && project.projectSubtypes.length > 0
                          ? project.projectSubtypes.join(", ")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">제조사</span>
                      <span className="font-medium">
                        {project.manufacturer || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">회차</span>
                      <span className="font-medium">{project.round || "-"}차</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">평가자</span>
                      <span className="font-medium">
                        평가자 {project.evaluatorId || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">시작일</span>
                      <span className="font-medium">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
