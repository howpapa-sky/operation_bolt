import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Instagram, Mail, Phone, Users } from "lucide-react";
import { useParams, useLocation } from "wouter";

export default function InfluencerDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const influencerId = parseInt(params.id || "0");

  const { data: influencer, isLoading } = trpc.influencers.getById.useQuery({ id: influencerId });
  const { data: campaigns } = trpc.campaigns.listByInfluencer.useQuery({ influencerId });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!influencer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">인플루언서를 찾을 수 없습니다</p>
          <Button className="mt-4" onClick={() => navigate("/influencers")}>
            목록으로
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/influencers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{influencer.name}</h1>
            <p className="text-muted-foreground">{influencer.category}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>인플루언서 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {influencer.instagramHandle && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <span>{influencer.instagramHandle}</span>
                </div>
              )}
              {influencer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{influencer.email}</span>
                </div>
              )}
              {influencer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{influencer.phone}</span>
                </div>
              )}
              {influencer.followerCount && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{influencer.followerCount.toLocaleString()} 팔로워</span>
                </div>
              )}
              {influencer.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">메모</p>
                  <p className="text-sm text-muted-foreground">{influencer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>캠페인 이력</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-2">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-2 hover:bg-accent rounded-lg">
                      <p className="font-medium text-sm">{campaign.campaignName}</p>
                      <p className="text-xs text-muted-foreground">{campaign.productName}</p>
                      {campaign.postUrl && (
                        <a href={campaign.postUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          포스트 보기
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">캠페인 이력이 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
