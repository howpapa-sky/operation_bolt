import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, FolderKanban } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "샘플링" as "샘플링" | "인플루언서" | "제품발주" | "상세페이지",
    description: "",
    priority: "보통" as "높음" | "보통" | "낮음",
    projectSubtypes: [] as string[],
    packagingTypes: [] as string[],
  });

  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setOpen(false);
      setFormData({ name: "", type: "샘플링", description: "", priority: "보통", projectSubtypes: [], packagingTypes: [] });
      toast.success("프로젝트가 생성되었습니다");
    },
    onError: (error) => {
      toast.error("프로젝트 생성 실패: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중": return "bg-blue-100 text-blue-800";
      case "완료": return "bg-green-100 text-green-800";
      case "보류": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "높음": return "bg-red-100 text-red-800";
      case "보통": return "bg-blue-100 text-blue-800";
      case "낮음": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">프로젝트 관리</h1>
            <p className="text-muted-foreground">제품 개발 프로젝트를 관리하세요</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                새 프로젝트
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 프로젝트 생성</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">프로젝트명</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">프로젝트 유형</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="샘플링">샘플링</SelectItem>
                      <SelectItem value="인플루언서">인플루언서</SelectItem>
                      <SelectItem value="제품발주">제품발주</SelectItem>
                      <SelectItem value="상세페이지">상세페이지</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">우선순위</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="높음">높음</SelectItem>
                      <SelectItem value="보통">보통</SelectItem>
                      <SelectItem value="낮음">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>세부 유형 (다중 선택 가능)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["크림", "토너패드", "앤플", "로션", "미스트", "선케어", "파우더"].map((subtype) => (
                      <label key={subtype} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.projectSubtypes.includes(subtype)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, projectSubtypes: [...formData.projectSubtypes, subtype] });
                            } else {
                              setFormData({ ...formData, projectSubtypes: formData.projectSubtypes.filter((s) => s !== subtype) });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{subtype}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>부자재 유형 (다중 선택 가능)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["용기", "라벨", "단상자", "포장지", "우창이노팩", "크릭", "영동프라텍", "럭스팩"].map((packaging) => (
                      <label key={packaging} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.packagingTypes.includes(packaging)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, packagingTypes: [...formData.packagingTypes, packaging] });
                            } else {
                              setFormData({ ...formData, packagingTypes: formData.packagingTypes.filter((p) => p !== packaging) });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{packaging}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "생성 중..." : "생성"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(project.priority || "보통")}`}>
                        {project.priority || "보통"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">유형</span>
                        <span className="font-medium">{project.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">상태</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {project.description}
                        </p>
                      )}
                      {project.dueDate && (
                        <div className="text-xs text-muted-foreground mt-2">
                          마감: {new Date(project.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">아직 프로젝트가 없습니다</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 프로젝트 만들기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
