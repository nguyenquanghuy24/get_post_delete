"use client";

import Image from "next/image";

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
  onAddToCart: () => void;
}

export default function ProductCard({ product, isAdding, onAddToCart }: ProductCardProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border p-4">
      <div>
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={320}
            height={144}
            className="mb-3 h-36 w-full rounded bg-gray-50 object-cover"
          />
        ) : (
          <div className="mb-3 flex h-36 w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
            Sản phẩm mới
          </div>
        )}
        <h3 className="font-semibold">{product.title}</h3>
        <p className="mt-1 font-bold text-blue-600">${product.price.toFixed(2)}</p>
      </div>
      <button
        disabled={isAdding}
        onClick={onAddToCart}
        className="w-full rounded bg-emerald-600 py-2 text-sm text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding ? "Đang thêm..." : "+ Thêm vào giỏ"}
      </button>
    </div>
  );
}
