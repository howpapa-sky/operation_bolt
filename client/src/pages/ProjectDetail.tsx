import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, User, AlertCircle } from "lucide-react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function ProjectDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const projectId = parseInt(params.id || "0");

  const utils = trpc.useUtils();
  const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: tasks } = trpc.tasks.listByProject.useQuery({ projectId });
  
  const updateProject = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getById.invalidate({ id: projectId });
      utils.projects.list.invalidate();
      toast.success("프로젝트가 업데이트되었습니다");
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.listByProject.invalidate({ projectId });
      toast.success("작업이 업데이트되었습니다");
    },
  });

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("프로젝트가 삭제되었습니다");
      navigate("/projects");
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다</p>
          <Button className="mt-4" onClick={() => navigate("/projects")}>
            프로젝트 목록으로
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.type}</p>
          </div>
          <Button variant="destructive" onClick={() => {
            if (confirm("정말 이 프로젝트를 삭제하시겠습니까?")) {
              deleteProject.mutate({ id: projectId });
            }
          }}>
            삭제
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">상태</label>
                <Select 
                  value={project.status} 
                  onValueChange={(value: any) => updateProject.mutate({ id: projectId, status: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="진행전">진행전</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                    <SelectItem value="보류">보류</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">우선순위</label>
                <Select 
                  value={project.priority || "보통"} 
                  onValueChange={(value: any) => updateProject.mutate({ id: projectId, priority: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="높음">높음</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="낮음">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {project.description && (
                <div>
                  <label className="text-sm font-medium">설명</label>
                  <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}

              {project.projectSubtypes && Array.isArray(project.projectSubtypes) && project.projectSubtypes.length > 0 ? (
                <div>
                  <label className="text-sm font-medium">세부 유형</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {project.projectSubtypes.map((subtype: string) => (
                      <span key={subtype} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subtype}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {project.packagingTypes && Array.isArray(project.packagingTypes) && project.packagingTypes.length > 0 ? (
                <div>
                  <label className="text-sm font-medium">부자재 유형</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {project.packagingTypes.map((packaging: string) => (
                      <span key={packaging} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {packaging}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {project.startDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>시작: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}

              {project.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>마감: {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>작업 목록</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                      <Select 
                        value={task.status} 
                        onValueChange={(value: any) => updateTask.mutate({ id: task.id, status: value })}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="대기">대기</SelectItem>
                          <SelectItem value="진행중">진행중</SelectItem>
                          <SelectItem value="완료">완료</SelectItem>
                          <SelectItem value="보류">보류</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">작업이 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
