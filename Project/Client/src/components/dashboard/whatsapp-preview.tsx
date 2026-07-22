import { ImageIcon, ArrowSquareOutIcon } from "@phosphor-icons/react";

interface WhatsappPreviewProps {
  title: string;
  body: string;
  hasAttachment: boolean;
  attachmentLabel: string;
  hasCta: boolean;
  ctaLabel: string;
  collegeName: string;
  collegeInitials: string;
}

export function WhatsappPreview({
  title,
  body,
  hasAttachment,
  attachmentLabel,
  hasCta,
  ctaLabel,
  collegeName,
  collegeInitials,
}: WhatsappPreviewProps) {
  return (
    <div className="w-full max-w-90 rounded-lg bg-[#161717] p-4.5 shadow-lg">
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-[#f2c2a0] text-[12px] font-extrabold text-[#7a3b12]">
          {collegeInitials}
        </div>
        <div>
          <div className="text-[13.5px] font-bold text-[#e9edef]">{collegeName}</div>
          <div className="text-[11px] text-[#8696a0]">Business account</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg bg-[#242626]">
        <div className="px-3.5 pt-3.5">
          {hasAttachment && (
            <div className="mb-3 flex h-25 flex-col items-center justify-center gap-1.5 rounded-[10px] border border-[#3b4a54] text-[11.5px] text-[#8696a0]">
              <ImageIcon className="size-6.5" strokeWidth={1.5} />
              {attachmentLabel}
            </div>
          )}
          <div className="mb-0.5 text-[13.5px] font-bold text-white">{title}</div>
          <div className="text-[13px] leading-snug whitespace-pre-wrap text-white">{body}</div>
          <div className="text-right text-[11px] text-[#85a0a8]">
           00:00
          </div>
        </div>
        {hasCta && (
          <div className="flex items-center justify-center gap-1.5 border-t border-[#3a3c3c] p-2.5 text-center">
            <ArrowSquareOutIcon className="size-4 text-[#21c063]" />
            <span className="text-[13px] font-bold text-[#21c063]">{ctaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
