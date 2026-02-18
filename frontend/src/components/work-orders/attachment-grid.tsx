"use client";

import { useRef } from "react";
import { useUploadAttachment, useDeleteAttachment } from "@/hooks/use-attachments";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { MAX_FILE_SIZE } from "@/lib/constants";
import { toast } from "sonner";
import type { Attachment } from "@/types";

interface AttachmentGridProps {
  workOrderId: number;
  attachments: Attachment[];
}

export function AttachmentGrid({ workOrderId, attachments }: AttachmentGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large (max 10MB)");
      return;
    }

    uploadAttachment.mutate({ workOrderId, file });
    e.target.value = "";
  }

  if (attachments.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={Paperclip}
          title="No attachments"
          description="Upload photos or documents for this work order."
        />
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAttachment.isPending}
          >
            <Upload className="h-4 w-4" />
            {uploadAttachment.isPending ? "Uploading..." : "Upload File"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadAttachment.isPending}
        >
          <Upload className="h-4 w-4" />
          {uploadAttachment.isPending ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group relative rounded-md border overflow-hidden"
          >
            {attachment.file_type === "image" ? (
              <a
                href={attachment.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {attachment.thumbnail_url ? (
                  <img
                    src={attachment.thumbnail_url}
                    alt={attachment.file}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full aspect-square bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </a>
            ) : (
              <a
                href={attachment.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-full aspect-square bg-muted gap-2 p-2"
              >
                <FileText className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center truncate w-full">
                  {attachment.file}
                </span>
              </a>
            )}

            <div className="p-2 text-xs text-muted-foreground">
              {format(new Date(attachment.uploaded_at), "MMM d, yyyy")}
            </div>

            <ConfirmDialog
              trigger={
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              }
              title="Delete Attachment"
              description="This will permanently delete this file."
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={() => deleteAttachment.mutate(attachment.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
