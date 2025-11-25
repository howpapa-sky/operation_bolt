import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, Clock, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function Automation() {
  const utils = trpc.useUtils();
  const { data: rules, isLoading } = trpc.automation.list.useQuery();
  
  const updateRule = trpc.automation.update.useMutation({
    onSuccess: () => {
      utils.automation.list.invalidate();
      toast.success("자동화 규칙이 업데이트되었습니다");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">자동화 관리</h1>
          <p className="text-muted-foreground">반복 업무를 자동화하여 효율성을 높이세요</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 규칙</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rules?.filter(r => r.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시간 기반</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rules?.filter(r => r.triggerType === "시간").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">알림 규칙</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rules?.filter(r => r.actionType === "알림").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>자동화 규칙</CardTitle>
          </CardHeader>
          <CardContent>
            {rules && rules.length > 0 ? (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 hover:bg-accent rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{rule.name}</p>
                      {rule.description && (
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {rule.triggerType}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {rule.actionType}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => {
                        updateRule.mutate({ id: rule.id, isActive: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">자동화 규칙이 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
