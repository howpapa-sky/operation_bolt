import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Plus, Pencil, Trash2, Database } from "lucide-react";
import { toast } from "sonner";

export default function MasterData() {
  const [activeTab, setActiveTab] = useState("brands");
  const queryClient = useQueryClient();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Database className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">기준 정보 관리</h1>
          <p className="text-muted-foreground">
            브랜드, 카테고리, 제조사 등 시스템의 기본 데이터를 관리합니다
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="brands">브랜드</TabsTrigger>
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="manufacturers">제조사</TabsTrigger>
          <TabsTrigger value="vendors">제작 업체</TabsTrigger>
          <TabsTrigger value="sellers">셀러</TabsTrigger>
          <TabsTrigger value="evaluators">평가자</TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <BrandsManager />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>

        <TabsContent value="manufacturers">
          <ManufacturersManager />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsManager />
        </TabsContent>

        <TabsContent value="sellers">
          <SellersManager />
        </TabsContent>

        <TabsContent value="evaluators">
          <EvaluatorsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== Brands Manager ====================
function BrandsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => trpc.masterData.brands.list.query(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.masterData.brands.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsDialogOpen(false);
      toast.success("브랜드가 생성되었습니다");
    },
    onError: () => {
      toast.error("브랜드 생성에 실패했습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => trpc.masterData.brands.update.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("브랜드가 수정되었습니다");
    },
    onError: () => {
      toast.error("브랜드 수정에 실패했습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trpc.masterData.brands.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("브랜드가 삭제되었습니다");
    },
    onError: () => {
      toast.error("브랜드 삭제에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>브랜드 관리</CardTitle>
            <CardDescription>등록된 브랜드 목록을 관리합니다</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="h-4 w-4 mr-2" />
                브랜드 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "브랜드 수정" : "브랜드 추가"}</DialogTitle>
                  <DialogDescription>
                    브랜드 정보를 입력하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">브랜드명 *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingItem?.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingItem?.description}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingItem ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>브랜드명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands?.map((brand: any) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{brand.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(brand);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("정말 삭제하시겠습니까?")) {
                        deleteMutation.mutate(brand.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== Categories Manager ====================
function CategoriesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => trpc.masterData.categories.list.query(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.masterData.categories.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      toast.success("카테고리가 생성되었습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => trpc.masterData.categories.update.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("카테고리가 수정되었습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trpc.masterData.categories.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리가 삭제되었습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      type: formData.get("type") as "화장품" | "부자재",
      description: formData.get("description") as string,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>카테고리 관리</CardTitle>
            <CardDescription>제품 및 부자재 카테고리를 관리합니다</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="h-4 w-4 mr-2" />
                카테고리 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">카테고리명 *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingItem?.name}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">유형 *</Label>
                    <Select name="type" defaultValue={editingItem?.type || "화장품"} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="화장품">화장품</SelectItem>
                        <SelectItem value="부자재">부자재</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingItem?.description}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingItem ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>카테고리명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category: any) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.type}</TableCell>
                <TableCell>{category.description || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingItem(category);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("정말 삭제하시겠습니까?")) {
                        deleteMutation.mutate(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ==================== Manufacturers Manager ====================
function ManufacturersManager() {
  // Similar implementation to BrandsManager with additional fields
  return <div>제조사 관리 (구현 예정)</div>;
}

// ==================== Vendors Manager ====================
function VendorsManager() {
  // Similar implementation to BrandsManager with additional fields
  return <div>제작 업체 관리 (구현 예정)</div>;
}

// ==================== Sellers Manager ====================
function SellersManager() {
  // Similar implementation to BrandsManager with additional fields
  return <div>셀러 관리 (구현 예정)</div>;
}

// ==================== Evaluators Manager ====================
function EvaluatorsManager() {
  // Similar implementation to BrandsManager with additional fields
  return <div>평가자 관리 (구현 예정)</div>;
}
