"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/services/api";

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
  isLocal?: boolean;
}

interface ProductResponse {
  products: Product[];
}

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
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
    try {
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

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-3 text-lg font-bold">Giỏ hàng ({totalQuantity})</h2>
              {cart.length === 0 ? <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p> : (
                <div className="space-y-3">
                  <ul className="divide-y text-sm">
                    {cart.map((item) => (
                      <li key={item.id} className="flex flex-col gap-2 py-3">
                        <div className="flex justify-between gap-2"><span>{item.title}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="rounded bg-gray-200 px-2">−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="rounded bg-gray-200 px-2">+</button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-600 hover:underline">Xóa</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t pt-2 font-bold"><span>Tổng cộng:</span><span className="text-blue-600">${totalPrice.toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow md:col-span-2">
            <h2 className="mb-4 text-lg font-bold">Danh sách sản phẩm</h2>
            {loading ? <p className="text-gray-500">Đang tải sản phẩm...</p> : products.length === 0 ? <p className="text-gray-500">Không có sản phẩm.</p> : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col justify-between gap-3 rounded-lg border p-4">
                    <div>
                      {product.thumbnail ? <Image src={product.thumbnail} alt={product.title} width={320} height={144} className="mb-3 h-36 w-full rounded bg-gray-50 object-cover" /> : <div className="mb-3 flex h-36 w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-400">Sản phẩm mới</div>}
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="mt-1 font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    </div>
                    <button onClick={() => void handleAddToCart(product)} className="w-full rounded bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700">+ Thêm vào giỏ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
