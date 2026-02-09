"use client";

import React, { Fragment, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils";
import { Icons } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalContent = (
    <Fragment>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            "modal-content w-full max-h-[90vh] lg:max-h-[80vh] flex flex-col animate-scale-in",
            sizes[size],
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 border-b border-[hsl(var(--surface-border))] flex-shrink-0">
            <h2
              id="modal-title"
              className="text-base lg:text-lg font-semibold text-[hsl(var(--text-primary))]"
            >
              {title}
            </h2>
            {showClose && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--surface-hover))] text-[hsl(var(--text-secondary))]"
                aria-label="Close modal"
              >
                <Icons.X size={20} />
              </button>
            )}
          </div>
          <div className="p-4 lg:p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </Fragment>
  );

  // Use portal to render at document body level
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4 lg:space-y-6">
        <p className="text-sm text-[hsl(var(--text-muted))]">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-[hsl(var(--surface-border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface-hover))]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-[hsl(var(--danger))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)]"
                : variant === "warning"
                  ? "px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-[hsl(var(--warning))] text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning)/0.1)]"
                  : "px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-[hsl(var(--success))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.1)]"
            }
          >
            {isLoading ? "Loading..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
