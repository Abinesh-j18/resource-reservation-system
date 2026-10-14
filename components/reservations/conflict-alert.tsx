"use client";

import { AlertTriangle, Clock, Info } from "lucide-react";

interface ConflictAlertProps {
  error: string | null;
  isConflict?: boolean;
}

export function ConflictAlert({ error, isConflict }: ConflictAlertProps) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 text-sm transition-all ${
        isConflict
          ? "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-200"
          : "border-red-400 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-950/50 dark:text-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {isConflict ? (
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        ) : (
          <Info className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
        )}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {isConflict ? "Scheduling Conflict (HTTP 409)" : "Booking Validation Error"}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{error}</p>
          {isConflict && (
            <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 px-2.5 py-1.5 rounded flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5" />
              <span>Double-booking prevention rule enforced by atomic database transaction.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
