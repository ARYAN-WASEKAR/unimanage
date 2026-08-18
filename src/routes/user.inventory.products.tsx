import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/lib/unimanage/auth";
import { useStore } from "@/lib/unimanage/store";
import type { Product } from "@/lib/unimanage/types";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Edit,
  FolderTree,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/inventory/products")({
  component: UserProductsPage,
});

function UserProductsPage() {
  const { session } = useAuth();
  const { users, products, categories, addProduct, updateProduct, deleteProduct } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  // Data isolation check: filter only user's products
  const myProducts = (products || []).filter((p) => p.userId === user?.id);
  const myCategories = (categories || []).filter((c) => c.userId === user?.id);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(100);
  const [stock, setStock] = useState(10);
  const [lowThreshold, setLowThreshold] = useState(5);
  const [description, setDescription] = useState("");

  const filtered = useMemo(() => {
    return myProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchesStock = !lowStockOnly || p.stock <= p.lowStockThreshold;
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [myProducts, search, selectedCategory, lowStockOnly]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setCategory(myCategories[0]?.name || "General");
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice(100);
    setStock(10);
    setLowThreshold(5);
    setDescription("");
    setOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setSku(p.sku);
    setPrice(p.price);
    setStock(p.stock);
    setLowThreshold(p.lowStockThreshold);
    setDescription(p.description || "");
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        category,
        sku,
        price: Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowThreshold),
        description,
      });
      toast.success("Product updated successfully.");
    } else {
      addProduct({
        userId: user?.id || "usr-1",
        name,
        category,
        sku,
        price: Number(price),
        stock: Number(stock),
        lowStockThreshold: Number(lowThreshold),
        description,
      });
      toast.success("Product added to inventory.");
    }
    setOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Are you sure you want to delete ${prodName}?`)) {
      deleteProduct(id);
      toast.info("Product removed from inventory.");
    }
  };

  const lowStockCount = myProducts.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products & Inventory</h1>
          <p className="text-xs text-muted-foreground">
            Manage your store catalogue, stock levels, and pricing
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          <Plus className="size-4" /> Add Product
        </Button>
      </div>

      {/* LOW STOCK WARNING ALERT */}
      {lowStockCount > 0 && (
        <Alert variant="default" className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertDescription className="text-xs font-medium flex items-center justify-between">
            <span>You have <strong>{lowStockCount} items</strong> running below their low stock threshold limit.</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className="h-7 text-xs border-amber-500/40"
            >
              {lowStockOnly ? "Show All Items" : "View Low Stock Only"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* FILTER BAR */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none"
            >
              <option value="all">All Categories</option>
              {myCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button
              variant={lowStockOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className="text-xs shrink-0"
            >
              Low Stock Alert ({lowStockCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PRODUCTS TABLE */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No products found. Click "Add Product" to create your first item.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prod) => {
                    const isLow = prod.stock <= prod.lowStockThreshold;
                    const isOut = prod.stock === 0;
                    return (
                      <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground">
                          {prod.name}
                          {prod.description && (
                            <span className="block text-[10px] text-muted-foreground font-normal truncate max-w-xs">
                              {prod.description}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-mono text-muted-foreground">{prod.sku}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">
                            {prod.category}
                          </Badge>
                        </td>
                        <td className="p-4 font-bold text-foreground">₹{prod.price.toLocaleString()}</td>
                        <td className="p-4 font-bold">
                          <span className={isOut ? "text-destructive" : isLow ? "text-amber-600 dark:text-amber-400" : ""}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={isOut ? "destructive" : isLow ? "secondary" : "default"}
                            className="text-[10px]"
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleOpenEdit(prod)}
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(prod.id, prod.name)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ADD / EDIT PRODUCT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Enter product details and stock information for your catalogue.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="prod-name">Product Name *</Label>
                <Input
                  id="prod-name"
                  placeholder="e.g. Paracetamol 500mg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-cat">Category</Label>
                  <Input
                    id="prod-cat"
                    placeholder="e.g. Medicines"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-sku">SKU Code</Label>
                  <Input
                    id="prod-sku"
                    placeholder="SKU-1001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-price">Price (₹)</Label>
                  <Input
                    id="prod-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-stock">Current Stock</Label>
                  <Input
                    id="prod-stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-low">Low Alert Limit</Label>
                  <Input
                    id="prod-low"
                    type="number"
                    value={lowThreshold}
                    onChange={(e) => setLowThreshold(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prod-desc">Description (Optional)</Label>
                <Input
                  id="prod-desc"
                  placeholder="Item details or dosage info..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
