import * as React from 'react';
import { cn } from '../utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const [visible, setVisible] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => { setVisible(false); setClosing(false); }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  React.useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{
        animation: closing ? 'fadeOut 200ms ease forwards' : 'fadeIn 200ms ease',
      }}
    >
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[393px] bg-bg rounded-t-[6px] shadow-[0px_-4px_12px_0px_rgba(0,0,0,0.12)] pt-3"
        style={{
          animation: closing ? 'slideDown 200ms ease forwards' : 'slideUp 250ms ease',
        }}
      >
        <div className="px-4 py-3">
          <h2 className="text-[17px] tracking-[-0.17px] font-normal text-text text-center">{title}</h2>
        </div>
        {description && (
          <div className="px-3 pb-3">
            <p className="text-[13px] tracking-[-0.13px] text-text-dim text-center">{description}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 px-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-[6px] text-[17px] tracking-[-0.17px] font-normal cursor-pointer transition-colors bg-surface text-text hover:bg-surface-light"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className={cn(
              'w-full h-12 rounded-[6px] text-[17px] tracking-[-0.17px] font-normal cursor-pointer transition-colors bg-surface hover:bg-surface-light',
              variant === 'danger' ? 'text-negative' : 'text-text',
            )}
          >
            {confirmLabel}
          </button>
        </div>
        <div className="flex items-center justify-center h-[42px]">
          <div className="w-[139px] h-[5px] rounded-full bg-text" />
        </div>
      </div>
    </div>
  );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
