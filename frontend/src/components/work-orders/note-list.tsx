"use client";

import { NoteItem } from "./note-item";
import { NoteForm } from "./note-form";
import { EmptyState } from "@/components/empty-state";
import { MessageSquare } from "lucide-react";
import type { Note } from "@/types";

interface NoteListProps {
  workOrderId: number;
  notes: Note[];
}

export function NoteList({ workOrderId, notes }: NoteListProps) {
  return (
    <div className="space-y-4">
      <NoteForm workOrderId={workOrderId} />

      {notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No notes"
          description="Add a note to this work order."
        />
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
