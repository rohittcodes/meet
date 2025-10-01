import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MeetingRoom } from "@/types";
import { toast } from "sonner";

export function useRooms(orgId: string) {
  return useQuery({
    queryKey: ["rooms", orgId],
    queryFn: async (): Promise<MeetingRoom[]> => {
      const response = await fetch(`/api/organizations/${orgId}/rooms`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch rooms");
      }
      return data.rooms as MeetingRoom[];
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useCreateRoom(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; maxParticipants?: number }) => {
      const response = await fetch(`/api/organizations/${orgId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create room");
      }
      return data.room as MeetingRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", orgId] });
      toast.success("Meeting room created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create meeting room");
    },
  });
}


