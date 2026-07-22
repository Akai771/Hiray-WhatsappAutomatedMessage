import { UploadSimpleIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImportDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ImportDialog({ open, title, confirmLabel, onClose, onConfirm }: ImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-120 rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center text-[13px] text-muted-foreground">
          <UploadSimpleIcon className="size-6" />
          Drag &amp; drop your .xlsx file here, or click to browse
        </div>
        <a href="#" onClick={(e) => e.preventDefault()} className="text-[12.5px] font-semibold text-primary hover:underline">
          Download sample template
        </a>
        <div className="mt-1 flex justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
