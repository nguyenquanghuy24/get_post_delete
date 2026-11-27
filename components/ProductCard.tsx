"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
  isLocal?: boolean;
}

interface ProductCardProps {
  product: Product;
  isAdding: boolean;
  isPriority?: boolean;
  onAddToCart: () => void;
}

export default function ProductCard({ product, isAdding, isPriority = false, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border p-4">
      <Link href={`/products/${product.id}`} className="block rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
        {product.thumbnail ? <div className="relative mb-3 h-36 w-full overflow-hidden rounded bg-gray-50">
          <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width: 640px) 100vw, 320px" loading={isPriority ? "eager" : "lazy"} className="object-cover" />
        </div> : <div className="mb-3 flex h-36 w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-400">Sản phẩm mới</div>}
        <h3 className="font-semibold">{product.title}</h3>
        <p className="mt-1 font-bold text-blue-600">${product.price.toFixed(2)}</p>
      </Link>
      <button disabled={isAdding} onClick={onAddToCart} className="flex w-full items-center justify-center gap-2 rounded bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
        <ShoppingCart size={16} aria-hidden="true" />
        {isAdding ? "Đang thêm..." : "Thêm vào giỏ"}
      </button>
    </div>
  );
}
