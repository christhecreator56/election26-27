"use client";

type DialogProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: "success" | "error" | "info";
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  cancelLabel?: string;
  disabled?: boolean;
};

const variantStyles = {
  success: "border-emerald-500/50 bg-emerald-950/90",
  error: "border-red-500/50 bg-red-950/90",
  info: "border-blue-500/50 bg-slate-900/95",
};

export default function Dialog({
  open,
  title,
  message,
  variant = "info",
  onClose,
  actionLabel,
  onAction,
  cancelLabel,
  disabled,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${variantStyles[variant]}`}
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <h2 id="dialog-title" className="text-xl font-semibold text-white">
          {title}
        </h2>
        <p id="dialog-message" className="mt-3 text-slate-200">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          {cancelLabel && (
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onAction ?? onClose}
            disabled={disabled}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel ?? "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
