"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/services/api";

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
  isLocal?: boolean;
}

interface TodoResponse {
  todos: Todo[];
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTodos() {
      try {
        setError("");
        const data = await apiRequest<TodoResponse>("/todos?limit=5", {
          signal: controller.signal,
        });
        setTodos(data.todos);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("Không thể tải danh sách công việc. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }

    void loadTodos();
    return () => controller.abort();
  }, []);

  const handleRetry = () => window.location.reload();

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const todoText = newTodo.trim();
    if (!todoText || saving) return;

    try {
      setSaving(true);
      setError("");
      const data = await apiRequest<Todo>("/todos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: todoText, completed: false, userId: 1 }),
      });
      setTodos((previousTodos) => [
        { ...data, id: Date.now(), isLocal: true, todo: todoText },
        ...previousTodos,
      ]);
      setNewTodo("");
    } catch {
      setError("Không thể thêm công việc. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: Todo) {
    const nextCompleted = !item.completed;

    try {
      setError("");
      if (!item.isLocal) {
        await apiRequest(`/todos/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: nextCompleted }),
        });
      }
      setTodos((previousTodos) =>
        previousTodos.map((todo) =>
          todo.id === item.id ? { ...todo, completed: nextCompleted } : todo,
        ),
      );
    } catch {
      setError("Không thể cập nhật công việc.");
    }
  }

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.todo);
  };

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>, item: Todo) {
    event.preventDefault();
    const todoText = editingText.trim();
    if (!todoText || saving) return;

    try {
      setSaving(true);
      setError("");
      if (!item.isLocal) {
        await apiRequest(`/todos/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ todo: todoText }),
        });
      }
      setTodos((previousTodos) =>
        previousTodos.map((todo) =>
          todo.id === item.id ? { ...todo, todo: todoText } : todo,
        ),
      );
      setEditingId(null);
      setEditingText("");
    } catch {
      setError("Không thể lưu công việc.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Todo) {
    if (!window.confirm("Bạn có chắc muốn xóa công việc này không?")) return;

    try {
      setError("");
      if (!item.isLocal) await apiRequest(`/todos/${item.id}`, { method: "DELETE" });
      setTodos((previousTodos) => previousTodos.filter((todo) => todo.id !== item.id));
    } catch {
      setError("Không thể xóa công việc.");
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-800">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Bài 1: Quản lý Todo</h1>
          <Link href="/products" className="text-sm text-blue-600 hover:underline">Bài 2</Link>
        </div>

        <p className="mb-4 text-sm text-gray-600">Đã hoàn thành: {completedCount}/{todos.length}</p>

        <form onSubmit={handleAdd} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Nhập công việc mới..."
            className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Đang lưu..." : "Thêm"}
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={handleRetry} className="mt-2 font-semibold underline">Thử lại</button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có công việc nào.</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 rounded border p-3">
                {editingId === item.id ? (
                  <form onSubmit={(event) => void handleSaveEdit(event, item)} className="flex flex-1 gap-2">
                    <input autoFocus type="text" value={editingText} onChange={(event) => setEditingText(event.target.value)} className="min-w-0 flex-1 rounded border border-blue-400 px-2 py-1" />
                    <button type="submit" disabled={saving} className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50">Lưu</button>
                    <button type="button" onClick={() => { setEditingId(null); setEditingText(""); }} className="rounded bg-gray-300 px-3 py-1 text-sm">Hủy</button>
                  </form>
                ) : (
                  <>
                    {/* Todo display with an accessible label. */}
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={item.completed} onChange={() => void handleToggle(item)} className="h-4 w-4" />
                      <span className={`break-words ${item.completed ? "text-gray-400 line-through" : ""}`}>{item.todo}</span>
                    </label>
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => startEdit(item)} className="text-sm text-blue-600 hover:underline">Sửa</button>
                      <button onClick={() => void handleDelete(item)} className="text-sm text-red-600 hover:underline">Xóa</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
