import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Attachment, PaginatedResponse } from "@/types";

export function useAttachments(workOrderId: number) {
  return useQuery({
    queryKey: ["attachments", { work_order: workOrderId }],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Attachment>>(
        "/workorders/attachments/",
        { params: { work_order: workOrderId } }
      );
      return data;
    },
    enabled: !!workOrderId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workOrderId,
      file,
    }: {
      workOrderId: number;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("work_order", String(workOrderId));
      formData.append("file", file);
      const { data } = await api.post<Attachment>(
        "/workorders/attachments/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({
        queryKey: ["workorders", data.work_order],
      });
      toast.success("File uploaded");
    },
    onError: () => {
      toast.error("Failed to upload file");
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workorders/attachments/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      toast.success("Attachment deleted");
    },
    onError: () => {
      toast.error("Failed to delete attachment");
    },
  });
}
