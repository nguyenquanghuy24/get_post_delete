import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { ApiError, apiRequest } from "@/services/api";

export const instant = false;

export interface ProductDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  thumbnail: string;
  images: string[];
  brand?: string;
  category?: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let product: ProductDetail;
  try {
    product = await apiRequest<ProductDetail>(`/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return <main className="mx-auto min-h-screen max-w-3xl px-4 py-10"><p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-red-700">Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.</p></main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"><ArrowLeft size={16} /> Quay lại danh sách</Link>
        <article className="grid gap-8 rounded-xl bg-white p-6 shadow md:grid-cols-2">
          <div className="relative min-h-80 overflow-hidden rounded-lg bg-gray-50">
            <Image src={product.thumbnail} alt={product.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" priority />
          </div>
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-sm uppercase tracking-wide text-gray-500">{product.brand ?? product.category ?? "Product"}</p>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-amber-500"><Star size={18} fill="currentColor" /><span>{product.rating.toFixed(1)} / 5</span></div>
            <p className="mt-5 text-3xl font-bold text-blue-700">${product.price.toFixed(2)}</p>
            <p className="mt-4 leading-7 text-gray-600">{product.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-600"><Package size={18} /> Còn {product.stock} sản phẩm</div>
            <div className="mt-6"><AddToCartButton product={product} /></div>
          </div>
        </article>
      </div>
    </main>
  );
}
