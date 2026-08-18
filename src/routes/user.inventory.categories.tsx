import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { createFileRoute } from "@tanstack/react-router";
import { FolderTree, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/user/inventory/categories")({
  component: UserCategoriesPage,
});

function UserCategoriesPage() {
  const { session } = useAuth();
  const { users, categories, products, addCategory, deleteCategory } = useStore();

  const user = users.find(
    (u) =>
      u.email.toLowerCase() === session?.email.toLowerCase() ||
      u.username.toLowerCase() === session?.username.toLowerCase(),
  ) || users[0];

  const myCategories = (categories || []).filter((c) => c.userId === user?.id);
  const myProducts = (products || []).filter((p) => p.userId === user?.id);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    addCategory({
      userId: user?.id || "usr-1",
      name,
      description,
    });

    toast.success("Category added successfully.");
    setName("");
    setDescription("");
    setOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category '${catName}'?`)) {
      deleteCategory(id);
      toast.info("Category removed.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
          <p className="text-xs text-muted-foreground">
            Group your store products into organized categories
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
          <Plus className="size-4" /> Add Category
        </Button>
      </div>

      {/* CATEGORIES GRID / TABLE */}
      <Card className="rounded-2xl border-border shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Total Products</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {myCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No categories created yet. Click "Add Category" to create your first category.
                    </td>
                  </tr>
                ) : (
                  myCategories.map((cat) => {
                    const count = myProducts.filter((p) => p.category === cat.name).length;
                    return (
                      <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                          <FolderTree className="size-4 text-emerald-600" />
                          {cat.name}
                        </td>
                        <td className="p-4 text-muted-foreground">{cat.description || "N/A"}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="text-[10px]">
                            {count} products
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(cat.id, cat.name)}
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

      {/* ADD CATEGORY DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Add Category</DialogTitle>
              <DialogDescription className="text-xs">
                Create a new category grouping for your product catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Antibiotics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Description (Optional)</Label>
                <Input
                  id="cat-desc"
                  placeholder="e.g. Prescription antibiotic medications..."
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
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
