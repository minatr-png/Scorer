"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="modal-panel glass-strong w-full sm:max-w-md max-h-screen sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-t-3xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/70">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-glass w-8 h-8"
            aria-label="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
