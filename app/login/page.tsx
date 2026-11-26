"use client";

export default function LoginPage() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}
