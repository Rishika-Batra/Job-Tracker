"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Auto‑remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const ToastsContainer = () => (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 max-w-xs px-4 py-2 rounded-xl shadow-lg pointer-events-auto transition-opacity 
            ${t.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
        >
          <span className="flex-1 text-sm truncate">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            className="p-1 rounded hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );

  return { addToast, ToastsContainer };
}
