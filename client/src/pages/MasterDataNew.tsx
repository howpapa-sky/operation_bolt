import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function MasterDataNew() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">마스터 데이터 관리</h1>
        <p className="text-muted-foreground mt-2">
          프로젝트 관리에 필요한 기준 정보를 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="brands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brands">브랜드</TabsTrigger>
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="manufacturers">제조사</TabsTrigger>
          <TabsTrigger value="vendors">제작 업체</TabsTrigger>
          <TabsTrigger value="sellers">셀러</TabsTrigger>
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
    queryFn: () => db.brands.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.brands.create(data),
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
    mutationFn: ({ id, ...data }: any) => db.brands.update(id, data),
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
    mutationFn: (id: string) => db.brands.delete(id),
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
    const data = { name: formData.get("name") as string };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>브랜드 관리</CardTitle>
            <CardDescription>브랜드 정보를 등록하고 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            브랜드 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>브랜드명</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands?.map((brand: any) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{new Date(brand.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingItem(brand); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(brand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "브랜드 수정" : "브랜드 추가"}</DialogTitle>
                <DialogDescription>
                  브랜드 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">브랜드명</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingItem?.name || ""}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
    queryFn: () => db.categories.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.categories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      toast.success("카테고리가 생성되었습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => db.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("카테고리가 수정되었습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("카테고리가 삭제되었습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = { name: formData.get("name") as string };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>카테고리 관리</CardTitle>
            <CardDescription>제품 카테고리를 등록하고 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            카테고리 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>카테고리명</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category: any) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingItem(category); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
                <DialogDescription>
                  카테고리 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">카테고리명</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingItem?.name || ""}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ==================== Manufacturers Manager ====================
function ManufacturersManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: manufacturers, isLoading } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: () => db.manufacturers.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.manufacturers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      setIsDialogOpen(false);
      toast.success("제조사가 생성되었습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => db.manufacturers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("제조사가 수정되었습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.manufacturers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manufacturers"] });
      toast.success("제조사가 삭제되었습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      contact_info: formData.get("contact_info") as string,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>제조사 관리</CardTitle>
            <CardDescription>제조사 정보를 등록하고 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            제조사 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제조사명</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manufacturers?.map((manufacturer: any) => (
                <TableRow key={manufacturer.id}>
                  <TableCell className="font-medium">{manufacturer.name}</TableCell>
                  <TableCell>{manufacturer.contact_info || "-"}</TableCell>
                  <TableCell>{new Date(manufacturer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingItem(manufacturer); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(manufacturer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "제조사 수정" : "제조사 추가"}</DialogTitle>
                <DialogDescription>
                  제조사 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">제조사명</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingItem?.name || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_info">연락처</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    defaultValue={editingItem?.contact_info || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ==================== Vendors Manager ====================
function VendorsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => db.vendors.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.vendors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsDialogOpen(false);
      toast.success("제작 업체가 생성되었습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => db.vendors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("제작 업체가 수정되었습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.vendors.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("제작 업체가 삭제되었습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      contact_info: formData.get("contact_info") as string,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>제작 업체 관리</CardTitle>
            <CardDescription>제작 업체 정보를 등록하고 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            제작 업체 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>업체명</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors?.map((vendor: any) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.contact_info || "-"}</TableCell>
                  <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingItem(vendor); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(vendor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "제작 업체 수정" : "제작 업체 추가"}</DialogTitle>
                <DialogDescription>
                  제작 업체 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">업체명</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingItem?.name || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_info">연락처</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    defaultValue={editingItem?.contact_info || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ==================== Sellers Manager ====================
function SellersManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: sellers, isLoading } = useQuery({
    queryKey: ["sellers"],
    queryFn: () => db.sellers.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => db.sellers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      setIsDialogOpen(false);
      toast.success("셀러가 생성되었습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => db.sellers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("셀러가 수정되었습니다");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.sellers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success("셀러가 삭제되었습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      contact_info: formData.get("contact_info") as string,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>셀러 관리</CardTitle>
            <CardDescription>셀러 정보를 등록하고 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            셀러 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>셀러명</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers?.map((seller: any) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell>{seller.contact_info || "-"}</TableCell>
                  <TableCell>{new Date(seller.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setEditingItem(seller); setIsDialogOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(seller.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingItem ? "셀러 수정" : "셀러 추가"}</DialogTitle>
                <DialogDescription>
                  셀러 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">셀러명</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingItem?.name || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_info">연락처</Label>
                  <Input
                    id="contact_info"
                    name="contact_info"
                    defaultValue={editingItem?.contact_info || ""}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button type="submit">
                  {editingItem ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
