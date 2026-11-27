"use client";

import Link from "next/link";
import { ClipboardList, ShoppingCart, UserRound } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useCartStore } from "@/stores/cart-store";

const subscribe = () => () => undefined;

export default function Navbar() {
  const itemCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <header className="sticky top-0 z-10 border-b bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 text-black">
        <Link href="/" className="text-lg font-bold text-black">DummyJSON App</Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="inline-flex items-center gap-1 rounded px-2 py-1 text-black hover:bg-gray-100"><ClipboardList size={16} /> Todo</Link>
          <Link href="/products" className="inline-flex items-center gap-1 rounded px-2 py-1 text-black hover:bg-gray-100"><ShoppingCart size={16} /> Products</Link>
          <Link href="/profile" className="inline-flex items-center gap-1 rounded px-2 py-1 text-black hover:bg-gray-100"><UserRound size={16} /> Profile</Link>
          <Link href="/products" aria-label={`Shopping cart, ${hydrated ? itemCount : 0} items`} className="relative rounded p-2 hover:bg-gray-100">
            <ShoppingCart size={20} />
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-blue-600 px-1 text-center text-xs text-white">{hydrated ? itemCount : 0}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
