import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { UploadSimpleIcon, FileXlsIcon, XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImportDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  importing?: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  onDownloadTemplate?: () => void | Promise<void>;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls"];

function isExcelFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

export function ImportDialog({ open, title, confirmLabel, importing, onClose, onConfirm, onDownloadTemplate }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | undefined | null) {
    if (!f) return;
    if (!isExcelFile(f)) {
      toast.error("Please select an .xlsx or .xls file.");
      return;
    }
    setFile(f);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files[0]);
  }

  function handleClose() {
    setFile(null);
    onClose();
  }

  async function handleConfirm() {
    if (!file) {
      toast.error("Choose a file to import first.");
      return;
    }
    await onConfirm(file);
    setFile(null);
  }

  async function handleDownloadTemplate() {
    if (!onDownloadTemplate) return;
    setDownloading(true);
    try {
      await onDownloadTemplate();
    } catch {
      toast.error("Failed to download template.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-120 rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{title}</DialogTitle>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center text-[13px] text-muted-foreground transition-colors ${
              dragOver ? "border-primary bg-primary/5" : ""
            }`}
          >
            <UploadSimpleIcon className="size-6" />
            Drag &amp; drop your .xlsx file here, or click to browse
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border p-4">
            <FileXlsIcon className="size-6 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <span onClick={() => setFile(null)} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </span>
          </div>
        )}

        {onDownloadTemplate && (
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="cursor-pointer self-start text-[12.5px] font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {downloading ? "Downloading…" : "Download sample template"}
          </button>
        )}

        <div className="mt-1 flex justify-end gap-2.5">
          <Button variant="outline" onClick={handleClose} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!file || importing} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            {importing ? "Importing…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
