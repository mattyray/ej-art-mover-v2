import api from "@/lib/api";
import { toast } from "sonner";

export async function openPdf(url: string) {
  try {
    const response = await api.get(url, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    // Clean up the object URL after a delay to allow the browser to load it
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  } catch {
    toast.error("Failed to generate PDF");
  }
}
