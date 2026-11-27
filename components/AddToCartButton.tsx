"use client";

import { Button } from "@heroui/react";
import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { ProductDetail } from "@/app/products/[id]/page";
import { apiRequest } from "@/services/api";
import { useCartStore } from "@/stores/cart-store";

export default function AddToCartButton({ product }: { product: ProductDetail }) {
  const addItem = useCartStore((state) => state.addItem);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (saving) return;
    try {
      setSaving(true);
      setError("");
      await apiRequest("/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, products: [{ id: product.id, quantity: 1 }] }),
      });
      addItem({ id: product.id, title: product.title, price: product.price });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2000);
    } catch {
      setError("Không thể thêm sản phẩm vào giỏ hàng.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Button variant="primary" isDisabled={saving} onPress={() => void handleAdd()}>
        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        {saving ? "Đang thêm..." : added ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
      </Button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
