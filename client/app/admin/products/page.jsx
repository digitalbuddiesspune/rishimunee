"use client";
import { useEffect, useMemo, useState } from "react";
import { adminApiClient } from "../../../lib/admin-api-client.js";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import LoadingOverlay from "../../../components/ui/LoadingOverlay.jsx";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", slug: "", description: "", longDescription: "", category: "other", gemstoneType: "", price: 0, stock: 0 });
  const [files, setFiles] = useState([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editFiles, setEditFiles] = useState([null, null, null, null]);
  const [savingEdit, setSavingEdit] = useState(false);

  const previews = useMemo(() => files.map((f) => (f ? URL.createObjectURL(f) : null)), [files]);
  useEffect(() => {
    return () => {
      previews.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [previews]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await adminApiClient.get("/products");
      setProducts(data.data?.products || []);
    } catch (e) {
      console.error("Failed to load products", e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      files.filter(Boolean).forEach((f) => fd.append("images", f));
      const { data } = await adminApiClient.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ name: "", slug: "", description: "", longDescription: "", category: "other", gemstoneType: "", price: 0, stock: 0 });
      setFiles([null, null, null, null]);
      setProducts((p) => [data.data?.product, ...p]);
      setShowForm(false);
    } catch (e) {
      console.error("Create failed", e?.response?.data || e.message);
      alert("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await adminApiClient.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x._id !== id));
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setEditForm({
      name: p.name || "",
      slug: p.slug || "",
      category: p.category || "other",
      description: p.description || "",
      longDescription: p.longDescription || "",
      gemstoneType: p.gemstoneType || "",
      price: p.price || 0,
      stock: p.stock || 0
    });
    setEditFiles([null, null, null, null]);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm(null);
    setEditFiles([null, null, null, null]);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editId) return;
    try {
      setSavingEdit(true);
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, String(v)));
      editFiles.filter(Boolean).forEach((f) => fd.append("images", f));
      const { data } = await adminApiClient.put(`/products/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProducts((list) => list.map((x) => (x._id === editId ? data.data?.product || x : x)));
      cancelEdit();
    } catch (err) {
      console.error("Update failed", err?.response?.data || err.message);
      alert("Failed to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-[color:var(--color-text)]">Products</h1>
      <div className="mb-6 flex items-center justify-end">
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>{showForm ? "Close" : "Add New Product"}</Button>
      </div>

      {showForm && (
      <form onSubmit={create} className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Basic Info</CardTitle>
                <CardDescription>Title, slug and categorisation for the product.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, slug: f.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}>Generate slug</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Name</label>
                  <input required placeholder="e.g. Blue Sapphire 5ct" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Slug</label>
                  <input required placeholder="blue-sapphire-5ct" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                  <p className="mt-1 text-xs text-[color:var(--color-text-soft)]">URL: /store/{form.slug || "your-slug"}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Category</label>
                  <select className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    <option value="gemstone">Gemstone</option>
                    <option value="book">Book</option>
                    <option value="puja_item">Puja Item</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Short Description</label>
                  <input placeholder="A concise summary shown on cards" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Long Description</label>
                  <textarea className="min-h-28 w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Detailed description shown on the product page" value={form.longDescription} onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set price, stock and optional gemstone type.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Price (₹)</label>
                  <input type="number" min="0" step="1" placeholder="0" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Stock</label>
                  <input type="number" min="0" step="1" placeholder="0" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm text-[color:var(--color-text-soft)]">Gemstone Type (optional)</label>
                  <input placeholder="e.g. Neelam, Pukhraj, Panna" className="w-full rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={form.gemstoneType} onChange={(e) => setForm((f) => ({ ...f, gemstoneType: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Media</CardTitle>
                <CardDescription>Upload up to 4 images. First image is used as the cover.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {files.map((f, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="aspect-square overflow-hidden rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                      {previews[idx] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previews[idx]} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[color:var(--color-text-soft)]">No image</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full truncate rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]"
                      onChange={(e) => setFiles((arr) => { const next = [...arr]; next[idx] = e.target.files?.[0] || null; return next; })}
                    />
                    {f ? <p className="text-xs text-[color:var(--color-text-soft)]">{f.name}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={submitting} className="min-w-36">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-[color:var(--color-primary-foreground)]" />
                  Creating...
                </span>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </div>
      </form>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] p-6 text-sm text-[color:var(--color-text-soft)]">Loading products…</div>
      ) : (
        <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <p className="font-medium text-[color:var(--color-text)]">{p.name}</p>
                  <p className="text-sm text-[color:var(--color-text-soft)]">{p.category || p.gemstoneType} • ₹{p.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editId && editForm && (
        <div className="mt-8 rounded-2xl border border-[color:var(--color-border)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--color-text)]">Edit Product</h2>
          <form onSubmit={saveEdit} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                <input className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={editForm.slug} onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))} />
                <select className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="gemstone">Gemstone</option>
                  <option value="book">Book</option>
                  <option value="puja_item">Puja Item</option>
                  <option value="other">Other</option>
                </select>
                <input className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Short description" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                <textarea className="col-span-2 min-h-24 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Long description" value={editForm.longDescription} onChange={(e) => setEditForm((f) => ({ ...f, longDescription: e.target.value }))} />
                <input className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Price" type="number" value={editForm.price} onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))} />
                <input className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Stock" type="number" value={editForm.stock} onChange={(e) => setEditForm((f) => ({ ...f, stock: Number(e.target.value) }))} />
                <input className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" placeholder="Gemstone type" value={editForm.gemstoneType} onChange={(e) => setEditForm((f) => ({ ...f, gemstoneType: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[0,1,2,3].map((idx) => (
                  <div key={idx}>
                    <div className="aspect-square overflow-hidden rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                      {(() => {
                        const prod = products.find((x) => x._id === editId);
                        const existing = prod?.images?.[idx];
                        const preview = editFiles[idx] ? URL.createObjectURL(editFiles[idx]) : null;
                        const src = preview || existing;
                        return src ? <img src={src} alt={`Image ${idx+1}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[color:var(--color-text-soft)]">No image</div>;
                      })()}
                    </div>
                    <input type="file" accept="image/*" className="mt-2 block w-full truncate rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-text)]" onChange={(e) => setEditFiles((arr) => { const next = [...arr]; next[idx] = e.target.files?.[0] || null; return next; })} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>
                <Button type="submit" disabled={savingEdit}>{savingEdit ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          </form>
        </div>
      )}
      <LoadingOverlay show={submitting} label="Creating product..." />
      <LoadingOverlay show={savingEdit} label="Saving changes..." />
    </div>
  );
}
 
