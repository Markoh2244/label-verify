'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Images } from 'lucide-react';

interface LabelUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export function LabelUpload({ files, onFilesChange, disabled }: LabelUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesChange([...files, ...acceptedFiles]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'],
      'image/svg+xml': ['.svg'],
    },
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-5">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded border-2 border-dashed p-10 text-center cursor-pointer
          transition-all duration-150
          ${isDragActive
            ? 'border-[var(--primary)] bg-[var(--primary-lightest)]'
            : 'border-[var(--base-light)] bg-white hover:border-[var(--primary)] hover:bg-[var(--base-lightest)]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded ${
              isDragActive
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--base-lightest)] text-[var(--primary)] border border-[var(--border)]'
            }`}
          >
            <Upload className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-base font-bold text-[var(--ink)]">
              {isDragActive ? 'Drop images here' : 'Upload label artwork'}
            </p>
            <p className="mt-1.5 text-sm text-[var(--base-dark)]">
              Drag and drop, or click to browse
            </p>
            <p className="mt-2 text-sm text-[var(--base)]">
              PNG, JPG, JPEG, WebP, SVG — single or batch upload supported
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Images className="h-4 w-4 text-slate-400" />
              {files.length} file{files.length !== 1 ? 's' : ''} ready for verification
            </div>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              disabled={disabled}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilePreview({
  file,
  onRemove,
  disabled,
}: {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const imageUrl = URL.createObjectURL(file);

  return (
    <div className="group relative">
      <div className="aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
        <img
          src={imageUrl}
          alt={file.name}
          className="h-full w-full object-cover"
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-900 p-1 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-600"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <p className="mt-1.5 truncate text-xs text-slate-500" title={file.name}>
        {file.name}
      </p>
    </div>
  );
}
