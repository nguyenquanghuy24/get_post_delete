"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";
import Cart, { type CartItem } from "@/components/Cart";
import ProductCard, { type Product } from "@/components/ProductCard";

interface ProductResponse {
  products: Product[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cartSavingId, setCartSavingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setError("");
        const data = await apiRequest<ProductResponse>("/products?limit=6", { signal: controller.signal });
        setProducts(data.products);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  async function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const productTitle = title.trim();
    const productPrice = Number(price);
    if (!productTitle || !Number.isFinite(productPrice) || productPrice <= 0 || saving) return;

    try {
      setSaving(true);
      setError("");
      const newProduct = await apiRequest<Product>("/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: productTitle, price: productPrice }),
      });
      setProducts((previousProducts) => [
        { ...newProduct, id: Date.now(), isLocal: true, price: productPrice },
        ...previousProducts,
      ]);
      setTitle("");
      setPrice("");
      setNotice(`Đã thêm sản phẩm "${productTitle}" thành công!`);
    } catch {
      setError("Không thể thêm sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToCart(product: Product) {
    if (cartSavingId !== null) return;

    try {
      setCartSavingId(product.id);
      setError("");
      if (!product.isLocal) {
        await apiRequest("/carts/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1, products: [{ id: product.id, quantity: 1 }] }),
        });
      }

      setCart((previousCart) => {
        const existing = previousCart.find((item) => item.id === product.id);
        if (existing) {
          return previousCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...previousCart, { id: product.id, title: product.title, price: product.price, quantity: 1 }];
      });
      setNotice(`Đã thêm "${product.title}" vào giỏ hàng!`);
    } catch {
      setError("Không thể thêm sản phẩm vào giỏ hàng.");
    } finally {
      setCartSavingId(null);
    }
  }

  const updateQuantity = (id: number, change: number) => {
    setCart((previousCart) => previousCart
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart((previousCart) => previousCart.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h1 className="text-xl font-bold">Bài 2: Sản phẩm &amp; Giỏ hàng</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Bài 1 (Todo)</Link>
        </div>

        {notice && <div className="rounded border border-green-400 bg-green-100 px-4 py-2 text-green-800">{notice}</div>}
        {error && <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-red-700">{error}<button onClick={() => window.location.reload()} className="ml-3 underline">Thử lại</button></div>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-3 text-lg font-bold">Thêm sản phẩm mới</h2>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tên sản phẩm" className="w-full rounded border border-gray-300 px-3 py-2" />
                <input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Giá tiền ($)" className="w-full rounded border border-gray-300 px-3 py-2" />
                <button type="submit" disabled={saving} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Đang lưu..." : "Thêm sản phẩm"}</button>
              </form>
            </div>

            <Cart items={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
          </div>

          <div className="rounded-lg bg-white p-5 shadow md:col-span-2">
            <h2 className="mb-4 text-lg font-bold">Danh sách sản phẩm</h2>
            {loading ? <p className="text-gray-500">Đang tải sản phẩm...</p> : products.length === 0 ? <p className="text-gray-500">Không có sản phẩm.</p> : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isAdding={cartSavingId === product.id}
                    onAddToCart={() => void handleAddToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
