"use client";

import type { FormEvent } from "react";

export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
  isLocal?: boolean;
}

interface TodoItemProps {
  item: Todo;
  isEditing: boolean;
  editingText: string;
  saving: boolean;
  busy: boolean;
  onEditingTextChange: (value: string) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

export default function TodoItem({
  item,
  isEditing,
  editingText,
  saving,
  busy,
  onEditingTextChange,
  onSave,
  onCancel,
  onToggle,
  onStartEdit,
  onDelete,
}: TodoItemProps) {
  return (
    <li className="flex items-center justify-between gap-2 rounded border p-3">
      {isEditing ? (
        <form onSubmit={onSave} className="flex flex-1 gap-2">
          <input
            autoFocus
            type="text"
            value={editingText}
            onChange={(event) => onEditingTextChange(event.target.value)}
            className="min-w-0 flex-1 rounded border border-blue-400 px-2 py-1"
          />
          <button
            type="submit"
            disabled={saving || busy}
            className="rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-300 px-3 py-1 text-sm"
          >
            Hủy
          </button>
        </form>
      ) : (
        <>
          {/* Todo display with an accessible label. */}
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={item.completed}
              disabled={busy}
              onChange={onToggle}
              className="h-4 w-4 disabled:cursor-not-allowed"
            />
            <span className={`break-words ${item.completed ? "text-gray-400 line-through" : ""}`}>
              {item.todo}
            </span>
          </label>
          <div className="flex shrink-0 gap-2">
            <button
              disabled={busy}
              onClick={onStartEdit}
              className="text-sm text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sửa
            </button>
            <button
              disabled={busy}
              onClick={onDelete}
              className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        </>
      )}
    </li>
  );
}
