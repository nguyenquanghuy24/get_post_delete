"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/services/api";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const accessToken = window.localStorage.getItem("accessToken");

    if (!accessToken) {
      router.replace("/login");
      return () => controller.abort();
    }

    async function loadProfile() {
      try {
        setError("");
        const data = await apiRequest<UserProfile>("/auth/me", {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(data);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;

        if (requestError instanceof ApiError && requestError.status === 401) {
          window.localStorage.removeItem("accessToken");
          window.localStorage.removeItem("refreshToken");
          router.replace("/login");
          return;
        }

        setError("Không thể tải thông tin cá nhân. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, [retryCount, router]);

  const handleLogout = () => {
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("refreshToken");
    router.replace("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-800">
      <section className="w-full max-w-lg rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Trang cá nhân</h1>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
            Đăng xuất
          </button>
        </div>

        {loading && <p className="text-gray-500">Đang tải thông tin...</p>}

        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <p aria-live="polite">{error}</p>
            <button onClick={() => setRetryCount((count) => count + 1)} className="mt-2 font-semibold underline">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && user && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="font-medium text-gray-500">Username</dt>
              <dd>{user.username}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="font-medium text-gray-500">Họ tên</dt>
              <dd>{user.firstName} {user.lastName}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <dt className="font-medium text-gray-500">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-gray-500">Giới tính</dt>
              <dd>{user.gender}</dd>
            </div>
          </dl>
        )}
      </section>
    </main>
  );
}
