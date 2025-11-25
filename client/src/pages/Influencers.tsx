import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Users, Instagram } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Influencers() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instagramHandle: "",
    email: "",
    phone: "",
    followerCount: 0,
    category: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: influencers, isLoading } = trpc.influencers.list.useQuery();
  const createInfluencer = trpc.influencers.create.useMutation({
    onSuccess: () => {
      utils.influencers.list.invalidate();
      setOpen(false);
      setFormData({ name: "", instagramHandle: "", email: "", phone: "", followerCount: 0, category: "", notes: "" });
      toast.success("인플루언서가 추가되었습니다");
    },
    onError: (error) => {
      toast.error("인플루언서 추가 실패: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInfluencer.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "활성": return "bg-green-100 text-green-800";
      case "비활성": return "bg-gray-100 text-gray-800";
      case "계약종료": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">인플루언서 관리</h1>
            <p className="text-muted-foreground">인플루언서 관계를 관리하고 캠페인 성과를 추적하세요</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                인플루언서 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 인플루언서 추가</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagramHandle">인스타그램 핸들</Label>
                  <Input
                    id="instagramHandle"
                    placeholder="@username"
                    value={formData.instagramHandle}
                    onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="followerCount">팔로워 수</Label>
                  <Input
                    id="followerCount"
                    type="number"
                    value={formData.followerCount}
                    onChange={(e) => setFormData({ ...formData, followerCount: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Input
                    id="category"
                    placeholder="뷰티, 라이프스타일 등"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">메모</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={createInfluencer.isPending}>
                    {createInfluencer.isPending ? "추가 중..." : "추가"}
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
        ) : influencers && influencers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {influencers.map((influencer) => (
              <Link key={influencer.id} href={`/influencers/\${influencer.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{influencer.name}</CardTitle>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs \${getStatusColor(influencer.status)}`}>
                        {influencer.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {influencer.instagramHandle && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{influencer.instagramHandle}</span>
                        </div>
                      )}
                      {influencer.followerCount && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">팔로워: </span>
                          <span className="font-medium">{influencer.followerCount.toLocaleString()}</span>
                        </div>
                      )}
                      {influencer.category && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">카테고리: </span>
                          <span className="font-medium">{influencer.category}</span>
                        </div>
                      )}
                      {influencer.email && (
                        <div className="text-xs text-muted-foreground truncate">
                          {influencer.email}
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">아직 인플루언서가 없습니다</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                첫 인플루언서 추가
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
