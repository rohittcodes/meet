import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types";
import { toast } from "sonner";

export function useProjects(orgId: string) {
  return useQuery({
    queryKey: ["projects", orgId],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch(`/api/organizations/${orgId}/projects`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch projects");
      }
      return data.projects as Project[];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useCreateProject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; color?: string }) => {
      const response = await fetch(`/api/organizations/${orgId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create project");
      }
      return data.project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", orgId] });
      toast.success("Project created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create project");
    },
  });
}


