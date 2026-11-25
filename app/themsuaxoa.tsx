"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);

  // GET
  useEffect(() => {
    fetch("https://dummyjson.com/todos?limit=5")
      .then((res) => res.json())
      .then((data) => {
        setTodos(data.todos);
        setLoading(false);
      });
  }, []);

  // POST
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: newTodo,
        completed: false,
        userId: 1,
      }),
    });

    const data = await res.json();

    setTodos([{ ...data, id: Date.now() }, ...todos]);
    setNewTodo("");
  };

  // (PUT)
  const handleToggle = async (item: Todo) => {
    if (item.id <= 254) {
      await fetch(`https://dummyjson.com/todos/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !item.completed }),
      });
    }

    setTodos(
      todos.map((t) =>
        t.id === item.id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const startEdit = (item: Todo) => {
    setEditingId(item.id);
    setEditingText(item.todo);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingText.trim()) return;

    if (id <= 254) {
      await fetch(`https://dummyjson.com/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ todo: editingText }),
      });
    }

    setTodos(
      todos.map((t) => (t.id === id ? { ...t, todo: editingText } : t))
    );
    setEditingId(null);
    setEditingText("");
  };

  // XÓA 
  const handleDelete = async (id: number) => {
    if (id <= 254) {
      await fetch(`https://dummyjson.com/todos/${id}`, {
        method: "DELETE",
      });
    }

    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 text-gray-800">
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bài 1: Quản lý Todo
        </h1>

  
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Nhập công việc mới..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thêm
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 border p-3 rounded"
              >
                {editingId === item.id ? (
                  // Giao dien sua
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 border border-blue-400 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  // Giao diện
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggle(item)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span
                        className={
                          item.completed ? "line-through text-gray-400" : ""
                        }
                      >
                        {item.todo}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Xóa
                      </button>
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