"use client";

import { useState } from "react";
import { useUpdateNote, useDeleteNote } from "@/hooks/use-notes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { Note } from "@/types";

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(note.note);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  function handleSave() {
    if (!editText.trim()) return;
    updateNote.mutate(
      { id: note.id, note: editText.trim() },
      { onSuccess: () => setIsEditing(false) }
    );
  }

  function handleCancel() {
    setEditText(note.note);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="rounded-md border p-3 space-y-2">
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1"
            onClick={handleSave}
            disabled={updateNote.isPending}
          >
            <Check className="h-3 w-3" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="gap-1" onClick={handleCancel}>
            <X className="h-3 w-3" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 rounded-md border p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          }
          title="Delete Note"
          description="This will permanently delete this note."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => deleteNote.mutate(note.id)}
        />
      </div>
    </div>
  );
}
