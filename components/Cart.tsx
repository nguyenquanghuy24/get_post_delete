"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/stores/cart-store";
export type { CartItem } from "@/stores/cart-store";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, change: number) => void;
  onRemove: (id: number) => void;
}

export default function Cart({ items, onUpdateQuantity, onRemove }: CartProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="rounded-lg bg-white p-5 shadow">
      <h2 className="mb-3 text-lg font-bold">Giỏ hàng ({totalQuantity})</h2>
      {items.length === 0 ? <p className="text-sm text-gray-500">Chưa có sản phẩm nào.</p> : (
        <div className="space-y-3">
          <ul className="divide-y text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 py-3">
                <div className="flex justify-between gap-2"><span>{item.title}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>
                <div className="flex items-center gap-2">
                  <button aria-label={`Decrease ${item.title}`} onClick={() => onUpdateQuantity(item.id, -1)} className="rounded bg-gray-200 p-1"><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button aria-label={`Increase ${item.title}`} onClick={() => onUpdateQuantity(item.id, 1)} className="rounded bg-gray-200 p-1"><Plus size={14} /></button>
                  <button aria-label={`Remove ${item.title}`} onClick={() => onRemove(item.id)} className="ml-auto text-red-600 hover:underline"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-2 font-bold"><span>Tổng cộng:</span><span className="text-blue-600">${totalPrice.toFixed(2)}</span></div>
        </div>
      )}
    </div>
  );
}
