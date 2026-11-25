"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
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

  // State cho form thêm sản phẩm
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  // State cho giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState("");

  // 1. LẤY DANH SÁCH SẢN PHẨM (GET)
  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=6")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  // 2. THÊM SẢN PHẨM MỚI (POST)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const res = await fetch("https://dummyjson.com/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        price: Number(price),
      }),
    });

    const newProduct = await res.json();

    // Gán id = Date.now() để tránh trùng key nếu thêm nhiều sản phẩm liên tiếp
    setProducts([{ ...newProduct, id: Date.now() }, ...products]);
    setTitle("");
    setPrice("");
    setNotice(`Đã thêm sản phẩm "${newProduct.title}" thành công!`);
  };

  // 3. THÊM VÀO GIỎ HÀNG (POST)
  const handleAddToCart = async (product: Product) => {
    // DummyJSON chỉ có sẵn sản phẩm id từ 1 đến 194 trên server
    const validApiId = product.id <= 194 ? product.id : 1;

    const res = await fetch("https://dummyjson.com/carts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: 1,
        products: [
          {
            id: validApiId,
            quantity: 1,
          },
        ],
      }),
    });

    if (res.ok) {
      // Cập nhật giỏ hàng trên giao diện
      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === product.id);
        if (existing) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prevCart,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
          },
        ];
      });

      setNotice(`Đã thêm "${product.title}" vào giỏ hàng!`);
    }
  };

  // Tính tổng số lượng và tổng tiền trong giỏ
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Thanh điều hướng */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold">Bài 2: Sản phẩm & Giỏ hàng</h1>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Quay lại Bài 1 (Todo)
          </Link>
        </div>

        {/* Thông báo nhanh */}
        {notice && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CỘT TRÁI: Form thêm sản phẩm + Giỏ hàng */}
          <div className="space-y-6">
            {/* Form thêm sản phẩm */}
            <div className="bg-white p-5 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-3">Thêm sản phẩm mới</h2>
              <form onSubmit={handleAddProduct} className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tên sản phẩm (vd: Áo thun)"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Giá tiền ($)"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Thêm sản phẩm
                </button>
              </form>
            </div>

            {/* Giỏ hàng */}
            <div className="bg-white p-5 rounded-lg shadow">
              <h2 className="font-bold text-lg mb-3">
                Giỏ hàng ({totalQuantity})
              </h2>
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có sản phẩm nào.</p>
              ) : (
                <div className="space-y-3">
                  <ul className="divide-y text-sm">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="py-2 flex justify-between gap-2"
                      >
                        <span>
                          {item.title} <strong>x{item.quantity}</strong>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: Danh sách sản phẩm */}
          <div className="md:col-span-2 bg-white p-5 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4">Danh sách sản phẩm</h2>
            {loading ? (
              <p className="text-gray-500">Đang tải sản phẩm...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-full h-36 object-cover rounded mb-3 bg-gray-50"
                        />
                      ) : (
                        <div className="w-full h-36 rounded mb-3 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          Sản phẩm mới
                        </div>
                      )}
                      <h3 className="font-semibold line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-blue-600 font-bold mt-1">
                        ${product.price}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-emerald-600 text-white py-2 rounded text-sm hover:bg-emerald-700"
                    >
                      + Thêm vào giỏ
                    </button>
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