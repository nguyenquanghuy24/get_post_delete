"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/services/api";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (!normalizedUsername) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }

    if (!normalizedPassword) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalizedUsername,
          password: normalizedPassword,
          expiresInMins: 30,
        }),
      });
      window.localStorage.setItem("accessToken", data.accessToken);
      window.localStorage.setItem("refreshToken", data.refreshToken);
      router.replace("/profile");
    } catch {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-800">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold">Đăng nhập</h1>
        <p className="mb-6 text-sm text-gray-600">Đăng nhập để xem trang cá nhân.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Tên đăng nhập
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError("");
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p aria-live="polite" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}
