import { useMutation } from "@tanstack/react-query";
import type { ConnectionDetails } from "@/types";

export function useGetConnectionDetails() {
  return useMutation({
    mutationFn: async (params: { roomName: string; participantName: string; metadata?: string; region?: string }): Promise<ConnectionDetails> => {
      const url = new URL('/api/livekit/connection-details', window.location.origin);
      url.searchParams.append('roomName', params.roomName);
      url.searchParams.append('participantName', params.participantName);
      if (params.metadata) url.searchParams.append('metadata', params.metadata);
      if (params.region) url.searchParams.append('region', params.region);

      const response = await fetch(url.toString());
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to get connection details');
      }
      return data as ConnectionDetails;
    },
  });
}


