"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/services/api";
import Cart from "@/components/Cart";
import ProductCard, { type Product } from "@/components/ProductCard";
import { useCartStore } from "@/stores/cart-store";

const PAGE_SIZE = 6;

interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

function ProductsPageFallback() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-5xl rounded-lg bg-white p-5 shadow">
        <p className="text-gray-500">Đang tải sản phẩm...</p>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "";
  const initialPage = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cartSavingId, setCartSavingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const cart = useCartStore((state) => state.items);
  const addCartItem = useCartStore((state) => state.addItem);
  const increaseCartItem = useCartStore((state) => state.increase);
  const decreaseCartItem = useCartStore((state) => state.decrease);
  const removeCartItem = useCartStore((state) => state.remove);
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const data = await apiRequest<string[]>("/products/category-list", {
          signal: controller.signal,
        });
        setCategories(data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Không thể tải danh mục sản phẩm.");
      } finally {
        setCategoriesLoading(false);
      }
    }

    void loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const skip = (page - 1) * PAGE_SIZE;
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      skip: String(skip),
    });

    let requestPath = "/products";
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
      requestPath = `/products/search?${params.toString()}`;
    } else if (category) {
      requestPath = `/products/category/${encodeURIComponent(category)}?${params.toString()}`;
    } else {
      requestPath = `/products?${params.toString()}`;
    }

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest<ProductResponse>(requestPath, {
          signal: controller.signal,
        });
        setProducts(data.products);
        setTotal(data.total);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setProducts([]);
        setTotal(0);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [category, debouncedQuery, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));

    const nextQueryString = params.toString();
    if (searchParams.toString() !== nextQueryString) {
      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, { scroll: false });
    }
  }, [category, debouncedQuery, page, pathname, router, searchParams]);

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

      addCartItem({ id: product.id, title: product.title, price: product.price });
      setNotice(`Đã thêm "${product.title}" vào giỏ hàng!`);
    } catch {
      setError("Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setCartSavingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
              <h2 className="mb-3 text-lg font-bold">Tìm kiếm và lọc</h2>
              <div className="space-y-3">
                <label htmlFor="product-search" className="sr-only">Tìm kiếm sản phẩm</label>
                <input
                  id="product-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setCategory("");
                    setPage(1);
                  }}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                />
                <label htmlFor="product-category" className="sr-only">Lọc theo danh mục</label>
                <select
                  id="product-category"
                  value={category}
                  disabled={categoriesLoading}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setSearchInput("");
                    setDebouncedQuery("");
                    setPage(1);
                  }}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 disabled:opacity-50"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-3 text-lg font-bold">Thêm sản phẩm mới</h2>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tên sản phẩm" className="w-full rounded border border-gray-300 px-3 py-2" />
                <input type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Giá tiền ($)" className="w-full rounded border border-gray-300 px-3 py-2" />
                <button type="submit" disabled={saving} className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Đang lưu..." : "Thêm sản phẩm"}</button>
              </form>
            </div>

            <Cart items={cart} onUpdateQuantity={(id, change) => change > 0 ? increaseCartItem(id) : decreaseCartItem(id)} onRemove={removeCartItem} />
          </div>

          <div className="rounded-lg bg-white p-5 shadow md:col-span-2">
            <h2 className="mb-4 text-lg font-bold">Danh sách sản phẩm</h2>
            {loading ? <p className="text-gray-500">Đang tải sản phẩm...</p> : products.length === 0 ? <p className="text-gray-500">Không có sản phẩm phù hợp.</p> : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAdding={cartSavingId === product.id}
                      isPriority={index === 0}
                      onAddToCart={() => void handleAddToCart(product)}
                    />
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                    className="rounded bg-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm text-gray-600">Trang {page} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                    className="rounded bg-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
