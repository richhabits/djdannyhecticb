import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminShop() {
  const { data: products = [], isLoading, refetch } = trpc.products.list.useQuery({ activeOnly: false });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "GBP",
    type: "drop",
    thumbnailUrl: "",
    isActive: true,
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "GBP",
        type: "drop",
        thumbnailUrl: "",
        isActive: true,
      });
      setShowForm(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "GBP",
        type: "drop",
        thumbnailUrl: "",
        isActive: true,
      });
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Name and price required");
      return;
    }

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      currency: product.currency,
      type: product.type,
      thumbnailUrl: product.thumbnailUrl || "",
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      currency: "GBP",
      type: "drop",
      thumbnailUrl: "",
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="mb-12">
          <div className="tape-strip bg-accent text-white border-white mb-6 inline-block text-xs">
            SHOP_MANAGEMENT
          </div>
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.75] italic">
                Empire<br />Products
              </h1>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="tape-strip bg-white text-black border-black px-6 py-3 hover:bg-accent hover:text-white transition-all duration-150 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                NEW_PRODUCT
              </button>
            )}
          </div>
        </section>

        {/* Form */}
        {showForm && (
          <section className="mb-12 border-2 border-white p-8 bg-black">
            <h2 className="text-3xl font-black uppercase mb-6">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs uppercase font-black mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hectic Mix Vol. 3"
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-black mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-black mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-white bg-black text-white font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option>GBP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="drop">Digital Drop</option>
                  <option value="soundpack">Sound Pack</option>
                  <option value="preset">Preset</option>
                  <option value="course">Course</option>
                  <option value="vinyl">Vinyl</option>
                  <option value="merch">Merchandise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs uppercase font-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 border-2 border-white bg-black"
                  />
                  Active (visible in shop)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/20">
                <button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="tape-strip bg-white text-black border-black px-6 py-3 hover:bg-accent hover:text-white transition-all duration-150 disabled:opacity-50"
                >
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="tape-strip bg-black text-white border-white px-6 py-3 hover:bg-white/10 transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Products List */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-6">
            Products ({products.length})
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-white/60 font-mono">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="border-2 border-white p-12 text-center">
              <p className="text-white/60 font-mono mb-4">No products yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="tape-strip bg-white text-black border-black px-6 py-3 hover:bg-accent"
              >
                Create first product
              </button>
            </div>
          ) : (
            <div className="space-y-2 border-2 border-white divide-y divide-white">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-black uppercase text-sm">{product.name}</h3>
                    <p className="text-xs text-white/60 font-mono">
                      {product.currency} {product.price} • {product.type} •{" "}
                      <span className={product.isActive ? "text-green-500" : "text-red-500"}>
                        {product.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateProduct.mutate({
                          id: product.id,
                          isActive: !product.isActive,
                          name: product.name,
                          price: product.price,
                          currency: product.currency,
                          type: product.type,
                        })
                      }
                      className="p-2 hover:bg-white/10 transition-colors"
                      title={product.isActive ? "Hide" : "Show"}
                    >
                      {product.isActive ? (
                        <Eye className="w-5 h-5 text-accent" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-white/40" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(product)}
                      className="p-2 hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${product.name}"?`)) {
                          deleteProduct.mutate({ id: product.id });
                        }
                      }}
                      className="p-2 hover:bg-white/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
