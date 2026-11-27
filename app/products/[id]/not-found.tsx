import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-center text-gray-800">
      <div className="rounded-xl bg-white p-8 shadow">
        <CircleAlert className="mx-auto mb-3 text-amber-500" size={40} />
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-gray-600">ID sản phẩm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-blue-700 hover:underline"><ArrowLeft size={16} /> Về danh sách sản phẩm</Link>
      </div>
    </main>
  );
}
