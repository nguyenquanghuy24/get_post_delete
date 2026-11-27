"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/services/api";
import TodoItem, { type Todo } from "@/components/TodoItem";

interface TodoResponse {
  todos: Todo[];
}

type TodoFilter = "all" | "active" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTodoId, setBusyTodoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TodoFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        setError("Không thể tải danh sách công việc");
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
      setError("Không thể thêm công việc");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item: Todo) {
    const nextCompleted = !item.completed;
    if (busyTodoId !== null) return;

    try {
      setBusyTodoId(item.id);
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
    } finally {
      setBusyTodoId(null);
    }
  }

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.todo);
  };

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>, item: Todo) {
    event.preventDefault();
    const todoText = editingText.trim();
    if (!todoText || saving || busyTodoId !== null) return;

    try {
      setSaving(true);
      setBusyTodoId(item.id);
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
      setBusyTodoId(null);
    }
  }

  async function handleDelete(item: Todo) {
    if (busyTodoId !== null || !window.confirm("xóa công việc này?")) return;

    try {
      setBusyTodoId(item.id);
      setError("");
      if (!item.isLocal) await apiRequest(`/todos/${item.id}`, { method: "DELETE" });
      setTodos((previousTodos) => previousTodos.filter((todo) => todo.id !== item.id));
    } catch {
      setError("Không thể xóa công việc.");
    } finally {
      setBusyTodoId(null);
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleTodos = todos.filter((todo) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? todo.completed : !todo.completed);
    const matchesSearch = todo.todo.toLowerCase().includes(normalizedSearchQuery);

    return matchesStatus && matchesSearch;
  });
  const filters: Array<{ value: TodoFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Chưa làm" },
    { value: "completed", label: "Đã xong" },
  ];

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 text-gray-800">
      <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Task 1: Quản lý Todo</h1>
          <Link href="/products" className="text-sm text-blue-600 hover:underline">Task 2</Link>
        </div>

        <p className="mb-4 text-sm text-gray-600">Đã hoàn thành: {completedCount}/{todos.length}</p>

        <form onSubmit={handleAdd} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Nhập công việc"
            className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />
          <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Đang lưu..." : "Thêm"}
          </button>
        </form>

        <div className="mb-6 space-y-3">
          <label htmlFor="todo-search" className="sr-only">
            Tìm kiếm công việc
          </label>
          <input
            id="todo-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm kiếm"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
          />
          <div className="flex flex-wrap gap-2" aria-label="Lọc">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={statusFilter === filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded px-3 py-1 text-sm ${statusFilter === filter.value ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={handleRetry} className="mt-2 font-semibold underline">Thử lại</button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Đang tải</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có công việc nào.</p>
        ) : visibleTodos.length === 0 ? (
          <p className="text-center text-gray-500">Không tìm thấy công việc phù hợp.</p>
        ) : (
          <ul className="space-y-3">
            {visibleTodos.map((item) => (
              <TodoItem
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                editingText={editingText}
                saving={saving}
                busy={busyTodoId !== null}
                onEditingTextChange={setEditingText}
                onSave={(event) => void handleSaveEdit(event, item)}
                onCancel={() => { setEditingId(null); setEditingText(""); }}
                onToggle={() => void handleToggle(item)}
                onStartEdit={() => startEdit(item)}
                onDelete={() => void handleDelete(item)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
