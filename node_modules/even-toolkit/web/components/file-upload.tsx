import * as React from 'react';
import { cn } from '../utils/cn';
import { IcEditUploadToCloud } from '../icons/svg-icons';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  label?: string;
  className?: string;
}

function FileUpload({ onFiles, accept, multiple = false, maxSize, label, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).filter((f) => !maxSize || f.size <= maxSize);
    setFiles((prev) => multiple ? [...prev, ...arr] : arr);
    onFiles(arr);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFiles(next);
      return next;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-[6px] p-6 text-center cursor-pointer transition-colors',
          isDragging ? 'border-accent bg-accent-alpha' : 'border-border hover:border-accent',
        )}
      >
        <IcEditUploadToCloud className="w-8 h-8 mx-auto mb-2 text-text-dim" />
        <p className="text-[15px] tracking-[-0.15px] text-text-dim">
          {label ?? 'Drop files or tap to browse'}
        </p>
        {maxSize && (
          <p className="text-[11px] tracking-[-0.11px] text-text-muted mt-1">
            Max {formatSize(maxSize)}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((f, i) => (
            <span key={i} className="bg-surface-light px-3 py-1.5 rounded-[6px] text-[13px] tracking-[-0.13px] inline-flex items-center gap-2">
              {f.name}
              <span className="text-text-muted">{formatSize(f.size)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-text-dim hover:text-negative cursor-pointer bg-transparent border-none p-0 text-[11px]"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { FileUpload };
export type { FileUploadProps };
