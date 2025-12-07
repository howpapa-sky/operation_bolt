import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface ProjectCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectCreateForm({ open, onOpenChange }: ProjectCreateFormProps) {
  const [projectType, setProjectType] = useState<string>("샘플링");
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const queryClient = useQueryClient();

  // Fetch master data
  const { data: brands } = useQuery({
    queryKey: ["brands"],
    queryFn: () => trpc.masterData.brands.list.query(),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => trpc.masterData.categories.list.query(),
  });

  const { data: manufacturers } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: () => trpc.masterData.manufacturers.list.query(),
  });

  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => trpc.masterData.vendors.list.query(),
  });

  const { data: sellers } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => trpc.masterData.sellers.list.query(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.projectsNew.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      toast.success("프로젝트가 생성되었습니다");
    },
    onError: (error) => {
      console.error(error);
      toast.error("프로젝트 생성에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const baseData = {
      name: formData.get("name") as string,
      notes: formData.get("notes") as string,
      project_type: projectType as any,
      status: formData.get("status") as any,
      priority: formData.get("priority") as any,
      start_date: startDate?.toISOString(),
      due_date: dueDate?.toISOString(),
    };

    let specificData = {};

    switch (projectType) {
      case "샘플링":
        specificData = {
          brand_id: formData.get("brand_id") as string,
          category_id: formData.get("category_id") as string,
          manufacturer_id: formData.get("manufacturer_id") as string,
          sample_code: formData.get("sample_code") as string,
          sample_round: formData.get("sample_round") as string,
        };
        break;
      case "상세페이지":
        specificData = {
          brand_id: formData.get("brand_id") as string,
          category_id: formData.get("category_id") as string,
          product_name: formData.get("product_name") as string,
          vendor_id: formData.get("vendor_id") as string,
          work_type: formData.get("work_type") as any,
          includes_photography: formData.get("includes_photography") === "on",
          includes_planning: formData.get("includes_planning") === "on",
          budget: parseInt(formData.get("budget") as string) || 0,
        };
        break;
      case "인플루언서":
        specificData = {
          collaboration_type: formData.get("collaboration_type") as any,
          budget: parseInt(formData.get("budget") as string) || 0,
        };
        break;
      case "제품 발주":
        specificData = {
          brand_id: formData.get("brand_id") as string,
          manufacturer_id: formData.get("manufacturer_id") as string,
          container_material_id: formData.get("container_material_id") as string,
          box_material_id: formData.get("box_material_id") as string,
        };
        break;
      case "공동구매":
        specificData = {
          brand_id: formData.get("brand_id") as string,
          seller_id: formData.get("seller_id") as string,
          revenue: parseInt(formData.get("revenue") as string) || 0,
          contribution_profit: parseInt(formData.get("contribution_profit") as string) || 0,
        };
        break;
      case "기타":
        // 기타는 기본 필드만 사용
        break;
    }

    createMutation.mutate({ ...baseData, ...specificData });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 프로젝트 생성</DialogTitle>
            <DialogDescription>
              프로젝트 유형을 선택하고 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 기본 정보 */}
            <div className="grid gap-2">
              <Label htmlFor="project_type">프로젝트 유형 *</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="샘플링">샘플링</SelectItem>
                  <SelectItem value="상세페이지">상세페이지 제작</SelectItem>
                  <SelectItem value="인플루언서">인플루언서 협업</SelectItem>
                  <SelectItem value="제품 발주">제품 발주</SelectItem>
                  <SelectItem value="공동구매">공동구매</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">프로젝트명 *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">진행 상황</Label>
                <Select name="status" defaultValue="대기">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="진행 전">진행 전</SelectItem>
                    <SelectItem value="진행 중">진행 중</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                    <SelectItem value="보류">보류</SelectItem>
                    <SelectItem value="대기">대기</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">우선순위</Label>
                <Select name="priority" defaultValue="보통">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="낮음">낮음</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="높음">높음</SelectItem>
                    <SelectItem value="긴급">긴급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>시작일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ko }) : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>목표일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: ko }) : "날짜 선택"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 프로젝트 유형별 필드 */}
            {projectType === "샘플링" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand_id">브랜드</Label>
                    <Select name="brand_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category_id">카테고리</Label>
                    <Select name="category_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter((c: any) => c.type === "화장품").map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="manufacturer_id">제조사</Label>
                    <Select name="manufacturer_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers?.map((manufacturer: any) => (
                          <SelectItem key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sample_round">회차</Label>
                    <Select name="sample_round">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((round) => (
                          <SelectItem key={round} value={round.toString()}>
                            {round}회차
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="sample_code">샘플 코드</Label>
                  <Input id="sample_code" name="sample_code" placeholder="예: SC-001" />
                </div>
              </>
            )}

            {projectType === "상세페이지" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand_id">브랜드</Label>
                    <Select name="brand_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category_id">제품 카테고리</Label>
                    <Select name="category_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter((c: any) => c.type === "화장품").map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="product_name">제품명</Label>
                  <Input id="product_name" name="product_name" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="vendor_id">제작 업체</Label>
                    <Select name="vendor_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors?.filter((v: any) => v.type === "상세페이지").map((vendor: any) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="work_type">업무 구분</Label>
                    <Select name="work_type">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="신규">신규</SelectItem>
                        <SelectItem value="리뉴얼">리뉴얼</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includes_photography" name="includes_photography" />
                    <Label htmlFor="includes_photography">촬영 포함</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="includes_planning" name="includes_planning" />
                    <Label htmlFor="includes_planning">기획 포함</Label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="budget">예산 (원)</Label>
                  <Input id="budget" name="budget" type="number" />
                </div>
              </>
            )}

            {projectType === "인플루언서" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="collaboration_type">협업 유형</Label>
                  <Select name="collaboration_type">
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="제품협찬">제품 협찬</SelectItem>
                      <SelectItem value="유가콘텐츠">유가 콘텐츠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="budget">예산 (원)</Label>
                  <Input id="budget" name="budget" type="number" />
                </div>
              </>
            )}

            {projectType === "제품 발주" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand_id">브랜드</Label>
                    <Select name="brand_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="manufacturer_id">제조사</Label>
                    <Select name="manufacturer_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {manufacturers?.map((manufacturer: any) => (
                          <SelectItem key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="container_material_id">용기 부자재</Label>
                    <Select name="container_material_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter((c: any) => c.type === "부자재" && c.name === "용기").map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="box_material_id">단상자 부자재</Label>
                    <Select name="box_material_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.filter((c: any) => c.type === "부자재" && c.name === "단상자").map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {projectType === "공동구매" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="brand_id">브랜드</Label>
                    <Select name="brand_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand: any) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="seller_id">셀러</Label>
                    <Select name="seller_id">
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellers?.map((seller: any) => (
                          <SelectItem key={seller.id} value={seller.id}>
                            {seller.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="revenue">매출 (원)</Label>
                    <Input id="revenue" name="revenue" type="number" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contribution_profit">공헌 이익 (원)</Label>
                    <Input id="contribution_profit" name="contribution_profit" type="number" />
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">비고</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
