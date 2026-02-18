import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Note, NoteInput, PaginatedResponse } from "@/types";

export function useNotes(workOrderId: number) {
  return useQuery({
    queryKey: ["notes", { work_order: workOrderId }],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Note>>(
        "/workorders/notes/",
        { params: { work_order: workOrderId } }
      );
      return data;
    },
    enabled: !!workOrderId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NoteInput) => {
      const { data } = await api.post<Note>("/workorders/notes/", input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({
        queryKey: ["workorders", data.work_order],
      });
      toast.success("Note added");
    },
    onError: () => {
      toast.error("Failed to add note");
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      note,
    }: {
      id: number;
      note: string;
    }) => {
      const { data } = await api.patch<Note>(`/workorders/notes/${id}/`, {
        note,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({
        queryKey: ["workorders", data.work_order],
      });
      toast.success("Note updated");
    },
    onError: () => {
      toast.error("Failed to update note");
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workorders/notes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });
}
