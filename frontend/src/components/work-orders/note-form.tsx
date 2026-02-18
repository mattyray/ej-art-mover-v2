"use client";

import { useState } from "react";
import { useCreateNote } from "@/hooks/use-notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface NoteFormProps {
  workOrderId: number;
}

export function NoteForm({ workOrderId }: NoteFormProps) {
  const [text, setText] = useState("");
  const createNote = useCreateNote();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    createNote.mutate(
      { work_order: workOrderId, note: text.trim() },
      { onSuccess: () => setText("") }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note..."
        rows={2}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || createNote.isPending}
        className="shrink-0 self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
