import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Document } from "@/types";
import { toast } from "sonner";

export function useDocuments(orgId: string, projectId: string) {
  return useQuery({
    queryKey: ["documents", orgId, projectId],
    queryFn: async (): Promise<Document[]> => {
      const res = await fetch(`/api/organizations/${orgId}/projects/${projectId}/documents`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch documents");
      return data.documents as Document[];
    },
    enabled: !!orgId && !!projectId,
    staleTime: 60 * 1000,
  });
}

export function useCreateDocument(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; content?: string; type?: string }) => {
      const res = await fetch(`/api/organizations/${orgId}/projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create document");
      return data.document as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", orgId, projectId] });
      toast.success("Document created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create document"),
  });
}

export function useUpdateDocument(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: { title?: string; content?: string } }) => {
      const res = await fetch(`/api/organizations/${orgId}/projects/${projectId}/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update document");
      return json.document as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", orgId, projectId] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update document"),
  });
}

export function useDeleteDocument(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const res = await fetch(`/api/organizations/${orgId}/projects/${projectId}/documents/${documentId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete document");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", orgId, projectId] });
      toast.success("Document deleted");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete document"),
  });
}

export function useReorderDocuments(orgId: string, projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: Array<{ id: string; position: number; parentId?: string | null }>) => {
      const res = await fetch(`/api/organizations/${orgId}/projects/${projectId}/documents/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to reorder documents");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", orgId, projectId] });
    },
  });
}


